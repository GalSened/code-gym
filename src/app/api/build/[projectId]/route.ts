import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    // Fetch project with milestones
    const project = await prisma.project.findUnique({
      where: { id: projectId, isActive: true },
      include: {
        milestones: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get user's submissions for this project
    const submissions = await prisma.projectSubmission.findMany({
      where: {
        userId: session.user.id,
        projectId,
      },
      orderBy: { createdAt: "desc" },
    });

    // Build milestone status map
    const milestoneStatus = new Map<string, string>();
    for (const submission of submissions) {
      const existing = milestoneStatus.get(submission.milestoneId);
      if (!existing || submission.status === "passed") {
        milestoneStatus.set(submission.milestoneId, submission.status);
      }
    }

    // Calculate progress
    const completedCount = Array.from(milestoneStatus.values()).filter(
      (s) => s === "passed"
    ).length;
    const totalCount = project.milestones.length;
    const progressPercentage =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Find current milestone (first incomplete)
    const currentMilestoneIndex = project.milestones.findIndex(
      (m) => milestoneStatus.get(m.id) !== "passed"
    );

    // Prepare milestone data with status
    const milestonesWithStatus = project.milestones.map((milestone, index) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      xpReward: milestone.xpReward,
      orderIndex: milestone.orderIndex,
      status: milestoneStatus.get(milestone.id) || null,
      isCompleted: milestoneStatus.get(milestone.id) === "passed",
      isCurrent: currentMilestoneIndex === index,
      isLocked: index > currentMilestoneIndex && currentMilestoneIndex !== -1,
    }));

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        techStack: project.techStack,
        estimatedHours: project.estimatedHours,
        xpReward: project.xpReward,
        skills: project.skills,
      },
      milestones: milestonesWithStatus,
      progress: {
        completed: completedCount,
        total: totalCount,
        percentage: progressPercentage,
      },
      currentMilestoneIndex,
      isStarted: submissions.length > 0,
      isCompleted: completedCount === totalCount && totalCount > 0,
    });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
