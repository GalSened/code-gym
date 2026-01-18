import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { executeCode, wrapCodeWithTestHarness, compareOutputs } from "@/lib/services/piston";
import { TestCase } from "@/types";

interface RouteParams {
  params: Promise<{ challengeId: string }>;
}

// XP rewards by difficulty
const XP_REWARDS: Record<string, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { challengeId } = await params;
    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    // Fetch challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId, isActive: true },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Check if user has already solved this challenge
    const existingPassedSubmission = await prisma.challengeSubmission.findFirst({
      where: {
        userId: session.user.id,
        challengeId,
        status: "passed",
      },
    });

    const alreadySolved = !!existingPassedSubmission;

    // Parse all test cases from JSON field
    const allTestCases = (challenge.testCases as unknown) as TestCase[];

    // Run code against ALL test cases
    const results = await Promise.all(
      allTestCases.map(async (testCase: TestCase) => {
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

    // Calculate average execution time
    const avgExecutionTime = Math.round(
      results.reduce((sum, r) => sum + (r.executionTime || 0), 0) / results.length
    );

    // Create submission record
    const submission = await prisma.challengeSubmission.create({
      data: {
        userId: session.user.id,
        challengeId,
        code,
        language,
        status: allPassed ? "passed" : "failed",
        testsPassed: passedCount,
        testsTotal: totalCount,
        executionTime: avgExecutionTime,
      },
    });

    // Award XP only if this is first time solving
    let xpAwarded = 0;
    if (allPassed && !alreadySolved) {
      xpAwarded = XP_REWARDS[challenge.difficulty] || 10;

      // Update user stats
      await prisma.userStats.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          totalXp: xpAwarded,
          challengesSolved: 1,
        },
        update: {
          totalXp: { increment: xpAwarded },
          challengesSolved: { increment: 1 },
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
          challengesSolved: 1,
          xpEarned: xpAwarded,
        },
        update: {
          challengesSolved: { increment: 1 },
          xpEarned: { increment: xpAwarded },
        },
      });

      // Update user streak
      await updateUserStreak(session.user.id);
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        testsPassed: passedCount,
        testsTotal: totalCount,
        executionTime: avgExecutionTime,
      },
      results,
      summary: {
        passed: passedCount,
        total: totalCount,
        allPassed,
        xpAwarded,
        alreadySolved,
      },
    });
  } catch (error) {
    console.error("Submit code error:", error);
    return NextResponse.json(
      { error: "Failed to submit code" },
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
    // Check if today is already counted (user already active today)
    const todayActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (todayActivity && todayActivity.challengesSolved > 1) {
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
