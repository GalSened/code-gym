import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ pathId: string }>;
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

    const { pathId } = await params;

    // Fetch learning path with phases and lessons
    const path = await prisma.learningPath.findUnique({
      where: { id: pathId, isActive: true },
      include: {
        phases: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                orderIndex: true,
                xpReward: true,
              },
            },
          },
        },
        progress: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!path) {
      return NextResponse.json(
        { error: "Learning path not found" },
        { status: 404 }
      );
    }

    const userProgress = path.progress[0] || null;

    // Calculate progress
    const totalLessons = path.phases.reduce(
      (sum, phase) => sum + phase.lessons.length,
      0
    );
    const completedLessons = userProgress?.completedLessons || [];
    const completedPhases = userProgress?.completedPhases || [];

    // Build phase data with status
    const phasesWithStatus = path.phases.map((phase, index) => {
      const phaseLessons = phase.lessons;
      const completedPhaseeLessons = phaseLessons.filter((l) =>
        completedLessons.includes(l.id)
      ).length;
      const isPhaseCompleted = completedPhases.includes(phase.id);

      // Phase is accessible if it's the first phase or previous phases are completed
      const isAccessible =
        index === 0 ||
        path.phases
          .slice(0, index)
          .every((p) => completedPhases.includes(p.id));

      return {
        id: phase.id,
        orderIndex: phase.orderIndex,
        title: phase.title,
        description: phase.description,
        deliverable: phase.deliverable,
        xpReward: phase.xpReward,
        lessons: phaseLessons.map((lesson) => ({
          ...lesson,
          isCompleted: completedLessons.includes(lesson.id),
        })),
        progress: {
          completed: completedPhaseeLessons,
          total: phaseLessons.length,
        },
        isCompleted: isPhaseCompleted,
        isAccessible,
        isCurrent:
          !isPhaseCompleted && isAccessible && userProgress !== null,
      };
    });

    return NextResponse.json({
      success: true,
      path: {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        difficulty: path.difficulty,
        estimatedHours: path.estimatedHours,
        totalXp: path.totalXp,
        skills: path.skills,
        previewImage: path.previewImage,
      },
      phases: phasesWithStatus,
      progress: {
        completed: completedLessons.length,
        total: totalLessons,
        percentage:
          totalLessons > 0
            ? Math.round((completedLessons.length / totalLessons) * 100)
            : 0,
        completedPhases: completedPhases.length,
        totalPhases: path.phases.length,
      },
      isEnrolled: userProgress !== null,
      isCompleted: userProgress?.completedAt !== null,
      currentPhaseId: userProgress?.currentPhaseId,
      currentLessonId: userProgress?.currentLessonId,
    });
  } catch (error) {
    console.error("Get learning path error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning path" },
      { status: 500 }
    );
  }
}

// Enroll in a learning path
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { pathId } = await params;

    // Check if path exists
    const path = await prisma.learningPath.findUnique({
      where: { id: pathId, isActive: true },
      include: {
        phases: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!path) {
      return NextResponse.json(
        { error: "Learning path not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingProgress = await prisma.userLearningProgress.findUnique({
      where: {
        userId_pathId: {
          userId: session.user.id,
          pathId,
        },
      },
    });

    if (existingProgress) {
      return NextResponse.json({
        success: true,
        message: "Already enrolled",
        progress: existingProgress,
      });
    }

    // Get first phase and lesson
    const firstPhase = path.phases[0];
    const firstLesson = firstPhase?.lessons[0];

    // Create enrollment
    const progress = await prisma.userLearningProgress.create({
      data: {
        userId: session.user.id,
        pathId,
        currentPhaseId: firstPhase?.id,
        currentLessonId: firstLesson?.id,
        completedLessons: [],
        completedPhases: [],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled",
      progress,
    });
  } catch (error) {
    console.error("Enroll in path error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in learning path" },
      { status: 500 }
    );
  }
}
