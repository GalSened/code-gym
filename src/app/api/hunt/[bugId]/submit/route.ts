import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { executeCode, wrapCodeWithTestHarness, compareOutputs } from "@/lib/services/piston";

interface RouteParams {
  params: Promise<{ bugId: string }>;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bugId } = await params;
    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Fetch bug
    const bug = await prisma.bug.findUnique({
      where: { id: bugId, isActive: true },
    });

    if (!bug) {
      return NextResponse.json(
        { error: "Bug not found" },
        { status: 404 }
      );
    }

    // Check if user has already fixed this bug
    const existingPassedSubmission = await prisma.bugSubmission.findFirst({
      where: {
        userId: session.user.id,
        bugId,
        status: "passed",
      },
    });

    const alreadyFixed = !!existingPassedSubmission;

    // Parse ALL test cases from JSON field
    const allTestCases = (bug.testCases as unknown) as TestCase[];

    // Run code against ALL test cases
    const results = await Promise.all(
      allTestCases.map(async (testCase) => {
        const wrappedCode = wrapCodeWithTestHarness(code, language, testCase.input);
        const result = await executeCode(wrappedCode, language, undefined, 10000);
        const passed = result.success && compareOutputs(testCase.expectedOutput, result.output);

        return {
          id: testCase.id,
          input: testCase.isHidden ? "[Hidden]" : testCase.input,
          expectedOutput: testCase.isHidden ? "[Hidden]" : testCase.expectedOutput,
          actualOutput: testCase.isHidden ? (passed ? "[Correct]" : "[Incorrect]") : result.output,
          passed,
          error: testCase.isHidden ? undefined : result.error,
          executionTime: result.executionTime,
          isHidden: testCase.isHidden,
        };
      })
    );

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount;

    // Create submission record
    await prisma.bugSubmission.create({
      data: {
        userId: session.user.id,
        bugId,
        fixedCode: code,
        status: allPassed ? "passed" : "failed",
        xpAwarded: 0, // Will update if passing
      },
    });

    // Award XP only if this is first time fixing
    let xpAwarded = 0;
    if (allPassed && !alreadyFixed) {
      xpAwarded = bug.xpReward;

      // Update the submission with XP awarded
      await prisma.bugSubmission.updateMany({
        where: {
          userId: session.user.id,
          bugId,
          status: "passed",
        },
        data: {
          xpAwarded,
        },
      });

      // Update user stats
      await prisma.userStats.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          totalXp: xpAwarded,
          bugsFixed: 1,
        },
        update: {
          totalXp: { increment: xpAwarded },
          bugsFixed: { increment: 1 },
        },
      });

      // Record daily activity for streak tracking
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyActivity.upsert({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
        create: {
          userId: session.user.id,
          date: today,
          bugsFixed: 1,
          xpEarned: xpAwarded,
        },
        update: {
          bugsFixed: { increment: 1 },
          xpEarned: { increment: xpAwarded },
        },
      });

      // Update user streak
      await updateUserStreak(session.user.id);
    }

    return NextResponse.json({
      success: true,
      results,
      passedCount,
      totalCount,
      allPassed,
      xpAwarded,
      alreadyFixed,
    });
  } catch (error) {
    console.error("Submit bug fix error:", error);
    return NextResponse.json(
      { error: "Failed to submit bug fix" },
      { status: 500 }
    );
  }
}

async function updateUserStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if user was active yesterday
  const yesterdayActivity = await prisma.dailyActivity.findUnique({
    where: {
      userId_date: {
        userId,
        date: yesterday,
      },
    },
  });

  const userStats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!userStats) return;

  let newStreak = 1;

  if (yesterdayActivity) {
    // Continue streak
    newStreak = userStats.currentStreak + 1;
  } else {
    // Check if today is already counted
    const todayActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (todayActivity && (todayActivity.bugsFixed || 0) > 1) {
      // Already had activity today, don't reset streak
      return;
    }

    // Reset streak to 1
    newStreak = 1;
  }

  // Update streak
  await prisma.userStats.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, userStats.longestStreak),
    },
  });
}
