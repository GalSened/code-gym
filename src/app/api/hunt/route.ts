import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const type = searchParams.get("type");
    const language = searchParams.get("language");
    const status = searchParams.get("status");

    // Build filter conditions
    const where: Record<string, unknown> = { isActive: true };

    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (type) {
      where.type = type;
    }
    if (language) {
      where.language = language;
    }

    // Fetch bugs
    const bugs = await prisma.bug.findMany({
      where,
      orderBy: [
        { difficulty: "asc" },
        { createdAt: "desc" },
      ],
    });

    // Fetch user's submissions
    const submissions = await prisma.bugSubmission.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        bugId: true,
        status: true,
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

    // Filter by status if requested
    let filteredBugs = bugs;
    if (status === "solved") {
      filteredBugs = bugs.filter((bug) => statusMap.get(bug.id) === "passed");
    } else if (status === "attempted") {
      filteredBugs = bugs.filter(
        (bug) => statusMap.has(bug.id) && statusMap.get(bug.id) !== "passed"
      );
    } else if (status === "unsolved") {
      filteredBugs = bugs.filter((bug) => !statusMap.has(bug.id));
    }

    // Map bugs with status
    const bugsWithStatus = filteredBugs.map((bug) => ({
      id: bug.id,
      slug: bug.slug,
      title: bug.title,
      description: bug.description,
      difficulty: bug.difficulty,
      type: bug.type,
      language: bug.language,
      xpReward: bug.xpReward,
      status: statusMap.get(bug.id) || null,
      isSolved: statusMap.get(bug.id) === "passed",
    }));

    // Get counts by difficulty
    const counts = {
      easy: bugs.filter((b) => b.difficulty === "easy").length,
      medium: bugs.filter((b) => b.difficulty === "medium").length,
      hard: bugs.filter((b) => b.difficulty === "hard").length,
      solved: Array.from(statusMap.values()).filter((s) => s === "passed").length,
    };

    return NextResponse.json({
      success: true,
      bugs: bugsWithStatus,
      counts,
    });
  } catch (error) {
    console.error("Get bugs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bugs" },
      { status: 500 }
    );
  }
}
