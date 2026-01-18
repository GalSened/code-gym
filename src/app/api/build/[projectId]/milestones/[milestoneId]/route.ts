import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ projectId: string; milestoneId: string }>;
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

    const { projectId, milestoneId } = await params;

    // Fetch project with milestones to check access
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

    // Find the requested milestone
    const milestone = project.milestones.find((m) => m.id === milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
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

    // Check if this milestone is accessible
    const milestoneIndex = project.milestones.findIndex(
      (m) => m.id === milestoneId
    );
    const previousMilestones = project.milestones.slice(0, milestoneIndex);
    const isAccessible =
      milestoneIndex === 0 ||
      previousMilestones.every((m) => milestoneStatus.get(m.id) === "passed");

    if (!isAccessible) {
      return NextResponse.json(
        { error: "Milestone is locked. Complete previous milestones first." },
        { status: 403 }
      );
    }

    // Get submissions for this specific milestone
    const milestoneSubmissions = submissions
      .filter((s) => s.milestoneId === milestoneId)
      .map((s) => ({
        id: s.id,
        files: s.files,
        status: s.status,
        aiReview: s.aiReview,
        feedback: s.feedback,
        xpAwarded: s.xpAwarded,
        createdAt: s.createdAt.toISOString(),
      }));

    const latestSubmission = milestoneSubmissions[0] || null;
    const isCompleted = milestoneStatus.get(milestoneId) === "passed";

    // Find previous and next milestones
    const prevMilestone =
      milestoneIndex > 0 ? project.milestones[milestoneIndex - 1] : null;
    const nextMilestone =
      milestoneIndex < project.milestones.length - 1
        ? project.milestones[milestoneIndex + 1]
        : null;

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
      },
      milestone: {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        instructions: milestone.instructions,
        requirements: milestone.requirements,
        starterFiles: milestone.starterFiles,
        xpReward: milestone.xpReward,
        orderIndex: milestone.orderIndex,
      },
      status: milestoneStatus.get(milestoneId) || null,
      isCompleted,
      latestSubmission,
      submissions: milestoneSubmissions,
      navigation: {
        milestoneIndex,
        totalMilestones: project.milestones.length,
        prevMilestone: prevMilestone
          ? { id: prevMilestone.id, title: prevMilestone.title }
          : null,
        nextMilestone: nextMilestone
          ? { id: nextMilestone.id, title: nextMilestone.title }
          : null,
        canAccessNext: isCompleted && nextMilestone !== null,
      },
    });
  } catch (error) {
    console.error("Get milestone error:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestone" },
      { status: 500 }
    );
  }
}
