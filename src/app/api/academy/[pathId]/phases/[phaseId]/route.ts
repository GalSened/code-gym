import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ pathId: string; phaseId: string }>;
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

    const { pathId, phaseId } = await params;

    // Fetch phase with lessons
    const phase = await prisma.learningPhase.findUnique({
      where: { id: phaseId },
      include: {
        path: {
          include: {
            phases: {
              orderBy: { orderIndex: "asc" },
            },
            progress: {
              where: { userId: session.user.id },
            },
          },
        },
        lessons: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!phase || phase.path.id !== pathId) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      );
    }

    const userProgress = phase.path.progress[0] || null;
    const completedLessons = userProgress?.completedLessons || [];
    const completedPhases = userProgress?.completedPhases || [];

    // Check if phase is accessible
    const phaseIndex = phase.path.phases.findIndex((p) => p.id === phaseId);
    const previousPhases = phase.path.phases.slice(0, phaseIndex);
    const isAccessible =
      phaseIndex === 0 ||
      previousPhases.every((p) => completedPhases.includes(p.id));

    if (!isAccessible) {
      return NextResponse.json(
        { error: "Phase is locked. Complete previous phases first." },
        { status: 403 }
      );
    }

    // Build lesson data with status
    const lessonsWithStatus = phase.lessons.map((lesson, index) => {
      const isCompleted = completedLessons.includes(lesson.id);
      // Lesson is accessible if it's the first or previous lessons in this phase are completed
      const previousLessons = phase.lessons.slice(0, index);
      const isLessonAccessible =
        index === 0 ||
        previousLessons.every((l) => completedLessons.includes(l.id));

      return {
        id: lesson.id,
        orderIndex: lesson.orderIndex,
        title: lesson.title,
        type: lesson.type,
        xpReward: lesson.xpReward,
        isCompleted,
        isAccessible: isLessonAccessible,
        isCurrent:
          !isCompleted &&
          isLessonAccessible &&
          userProgress !== null &&
          userProgress.currentLessonId === lesson.id,
      };
    });

    // Find next and previous phases
    const prevPhase =
      phaseIndex > 0 ? phase.path.phases[phaseIndex - 1] : null;
    const nextPhase =
      phaseIndex < phase.path.phases.length - 1
        ? phase.path.phases[phaseIndex + 1]
        : null;

    return NextResponse.json({
      success: true,
      path: {
        id: phase.path.id,
        title: phase.path.title,
      },
      phase: {
        id: phase.id,
        orderIndex: phase.orderIndex,
        title: phase.title,
        description: phase.description,
        deliverable: phase.deliverable,
        xpReward: phase.xpReward,
      },
      lessons: lessonsWithStatus,
      progress: {
        completed: phase.lessons.filter((l) => completedLessons.includes(l.id))
          .length,
        total: phase.lessons.length,
      },
      isCompleted: completedPhases.includes(phaseId),
      navigation: {
        phaseIndex,
        totalPhases: phase.path.phases.length,
        prevPhase: prevPhase
          ? { id: prevPhase.id, title: prevPhase.title }
          : null,
        nextPhase: nextPhase
          ? { id: nextPhase.id, title: nextPhase.title }
          : null,
        canAccessNext:
          completedPhases.includes(phaseId) && nextPhase !== null,
      },
    });
  } catch (error) {
    console.error("Get phase error:", error);
    return NextResponse.json(
      { error: "Failed to fetch phase" },
      { status: 500 }
    );
  }
}
