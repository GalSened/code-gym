import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ pathId: string; phaseId: string; lessonId: string }>;
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

    const { pathId, phaseId, lessonId } = await params;

    // Fetch lesson with phase and path info
    const lesson = await prisma.learningLesson.findUnique({
      where: { id: lessonId },
      include: {
        phase: {
          include: {
            path: {
              include: {
                phases: {
                  orderBy: { orderIndex: "asc" },
                  include: {
                    lessons: {
                      orderBy: { orderIndex: "asc" },
                    },
                  },
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
        },
        submissions: {
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!lesson || lesson.phase.id !== phaseId || lesson.phase.path.id !== pathId) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const userProgress = lesson.phase.path.progress[0] || null;
    const completedLessons = userProgress?.completedLessons || [];
    const completedPhases = userProgress?.completedPhases || [];

    // Check if lesson is accessible
    const phaseIndex = lesson.phase.path.phases.findIndex(
      (p) => p.id === phaseId
    );
    const previousPhases = lesson.phase.path.phases.slice(0, phaseIndex);
    const isPhaseAccessible =
      phaseIndex === 0 ||
      previousPhases.every((p) => completedPhases.includes(p.id));

    if (!isPhaseAccessible) {
      return NextResponse.json(
        { error: "Lesson is locked. Complete previous phases first." },
        { status: 403 }
      );
    }

    const lessonIndex = lesson.phase.lessons.findIndex((l) => l.id === lessonId);
    const previousLessons = lesson.phase.lessons.slice(0, lessonIndex);
    const isLessonAccessible =
      lessonIndex === 0 ||
      previousLessons.every((l) => completedLessons.includes(l.id));

    if (!isLessonAccessible) {
      return NextResponse.json(
        { error: "Lesson is locked. Complete previous lessons first." },
        { status: 403 }
      );
    }

    // Find next and previous lessons
    const prevLesson =
      lessonIndex > 0 ? lesson.phase.lessons[lessonIndex - 1] : null;
    let nextLesson =
      lessonIndex < lesson.phase.lessons.length - 1
        ? lesson.phase.lessons[lessonIndex + 1]
        : null;

    // If no next lesson in current phase, get first lesson of next phase
    let nextPhase: typeof lesson.phase.path.phases[number] | null = null;
    if (!nextLesson && phaseIndex >= 0 && phaseIndex < lesson.phase.path.phases.length - 1) {
      const candidatePhase = lesson.phase.path.phases[phaseIndex + 1];
      if (candidatePhase) {
        nextPhase = candidatePhase;
        nextLesson = candidatePhase.lessons[0] || null;
      }
    }

    const isCompleted = completedLessons.includes(lessonId);
    const latestSubmission = lesson.submissions[0] || null;

    return NextResponse.json({
      success: true,
      path: {
        id: lesson.phase.path.id,
        title: lesson.phase.path.title,
      },
      phase: {
        id: lesson.phase.id,
        title: lesson.phase.title,
        orderIndex: lesson.phase.orderIndex,
      },
      lesson: {
        id: lesson.id,
        orderIndex: lesson.orderIndex,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        xpReward: lesson.xpReward,
        exercise: lesson.exercise,
        quiz: lesson.quiz,
        videoUrl: lesson.videosUrl,
        resourceLinks: lesson.resourcesLinks,
      },
      isCompleted,
      latestSubmission: latestSubmission
        ? {
            id: latestSubmission.id,
            status: latestSubmission.status,
            score: latestSubmission.score,
            feedback: latestSubmission.feedback,
            xpAwarded: latestSubmission.xpAwarded,
            createdAt: latestSubmission.createdAt.toISOString(),
          }
        : null,
      navigation: {
        lessonIndex,
        totalLessons: lesson.phase.lessons.length,
        prevLesson: prevLesson
          ? { id: prevLesson.id, title: prevLesson.title }
          : null,
        nextLesson: nextLesson
          ? {
              id: nextLesson.id,
              title: nextLesson.title,
              phaseId: nextPhase?.id || phaseId,
            }
          : null,
        canAccessNext: isCompleted && nextLesson !== null,
      },
    });
  } catch (error) {
    console.error("Get lesson error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}
