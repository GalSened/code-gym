import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch today's daily hunt
    const dailyHunt = await prisma.dailyHunt.findFirst({
      where: {
        date: today,
      },
      include: {
        bugs: {
          include: {
            bug: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!dailyHunt) {
      return NextResponse.json({
        success: true,
        dailyHunt: null,
        message: "No daily hunt available today",
      });
    }

    // Fetch user's submissions for daily hunt bugs
    const bugIds = dailyHunt.bugs.map((b) => b.bug.id);
    const submissions = await prisma.bugSubmission.findMany({
      where: {
        userId: session.user.id,
        bugId: { in: bugIds },
      },
    });

    // Build status map
    const statusMap = new Map<string, string>();
    for (const submission of submissions) {
      const existing = statusMap.get(submission.bugId);
      if (!existing || submission.status === "passed") {
        statusMap.set(submission.bugId, submission.status);
      }
    }

    // Map bugs with status
    const bugsWithStatus = dailyHunt.bugs.map((dailyBug) => ({
      id: dailyBug.bug.id,
      slug: dailyBug.bug.slug,
      title: dailyBug.bug.title,
      description: dailyBug.bug.description,
      difficulty: dailyBug.bug.difficulty,
      type: dailyBug.bug.type,
      language: dailyBug.bug.language,
      xpReward: dailyBug.bug.xpReward,
      orderIndex: dailyBug.orderIndex,
      status: statusMap.get(dailyBug.bug.id) || null,
      isSolved: statusMap.get(dailyBug.bug.id) === "passed",
    }));

    // Calculate completion
    const solvedCount = bugsWithStatus.filter((b) => b.isSolved).length;
    const isCompleted = solvedCount === bugsWithStatus.length;

    // Calculate time until next daily hunt
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const timeUntilNext = tomorrow.getTime() - Date.now();

    return NextResponse.json({
      success: true,
      dailyHunt: {
        id: dailyHunt.id,
        date: dailyHunt.date.toISOString(),
        bonusXp: dailyHunt.bonusXp,
        bugs: bugsWithStatus,
      },
      progress: {
        solved: solvedCount,
        total: bugsWithStatus.length,
        isCompleted,
      },
      timeUntilNext,
    });
  } catch (error) {
    console.error("Get daily hunt error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily hunt" },
      { status: 500 }
    );
  }
}
