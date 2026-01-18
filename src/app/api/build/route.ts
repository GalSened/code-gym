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

    // Build query
    const where: { isActive: boolean; difficulty?: string } = { isActive: true };
    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    // Fetch projects with milestones and user submissions
    const projects = await prisma.project.findMany({
      where,
      include: {
        milestones: {
          orderBy: { orderIndex: "asc" },
        },
        submissions: {
          where: { userId: session.user.id },
        },
      },
      orderBy: [{ difficulty: "asc" }, { title: "asc" }],
    });

    // Calculate progress for each project
    const projectsWithProgress = projects.map((project) => {
      const completedMilestones = new Set(
        project.submissions
          .filter((s) => s.status === "passed")
          .map((s) => s.milestoneId)
      );

      return {
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        techStack: project.techStack,
        estimatedHours: project.estimatedHours,
        xpReward: project.xpReward,
        skills: project.skills,
        milestoneCount: project.milestones.length,
        progress: {
          completed: completedMilestones.size,
          total: project.milestones.length,
          percentage:
            project.milestones.length > 0
              ? Math.round((completedMilestones.size / project.milestones.length) * 100)
              : 0,
        },
        isStarted: project.submissions.length > 0,
        isCompleted:
          completedMilestones.size === project.milestones.length &&
          project.milestones.length > 0,
      };
    });

    return NextResponse.json({
      success: true,
      projects: projectsWithProgress,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
