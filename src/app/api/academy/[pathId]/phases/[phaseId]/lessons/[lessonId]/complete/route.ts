import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ pathId: string; phaseId: string; lessonId: string }>;
}

interface ExerciseSubmission {
  code: string;
  language: string;
}

interface QuizSubmission {
  answers: number[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface Quiz {
  questions: QuizQuestion[];
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

    const { pathId, phaseId, lessonId } = await params;
    const body = await request.json();

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
      },
    });

    if (!lesson || lesson.phase.id !== phaseId || lesson.phase.path.id !== pathId) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const userProgress = lesson.phase.path.progress[0];

    if (!userProgress) {
      return NextResponse.json(
        { error: "Not enrolled in this learning path" },
        { status: 403 }
      );
    }

    const completedLessons = userProgress.completedLessons || [];
    const completedPhases = userProgress.completedPhases || [];

    // Check if already completed
    const alreadyCompleted = completedLessons.includes(lessonId);

    let submissionStatus = "passed";
    let score: number | null = null;
    let feedback: string | null = null;
    let xpAwarded = 0;

    // Handle different lesson types
    if (lesson.type === "exercise") {
      const { code, language } = body as ExerciseSubmission;

      if (!code) {
        return NextResponse.json(
          { error: "Code is required for exercise submission" },
          { status: 400 }
        );
      }

      // Simple validation - in production, would run against test cases
      submissionStatus = "passed";
      feedback = "Exercise completed successfully!";

      // Create submission record
      await prisma.learningSubmission.create({
        data: {
          userId: session.user.id,
          lessonId,
          type: "exercise",
          content: { code, language },
          status: submissionStatus,
          feedback,
          xpAwarded: alreadyCompleted ? 0 : lesson.xpReward,
        },
      });
    } else if (lesson.type === "quiz") {
      const { answers } = body as QuizSubmission;
      const quiz = lesson.quiz as Quiz | null;

      if (!answers || !quiz) {
        return NextResponse.json(
          { error: "Answers are required for quiz submission" },
          { status: 400 }
        );
      }

      // Calculate score
      const correctCount = quiz.questions.reduce((count, q, i) => {
        return count + (answers[i] === q.correctIndex ? 1 : 0);
      }, 0);

      score = Math.round((correctCount / quiz.questions.length) * 100);
      submissionStatus = score >= 70 ? "passed" : "needs_revision";
      feedback = score >= 70
        ? `Great job! You scored ${score}% (${correctCount}/${quiz.questions.length})`
        : `You scored ${score}%. You need at least 70% to pass. Try again!`;

      // Create submission record
      await prisma.learningSubmission.create({
        data: {
          userId: session.user.id,
          lessonId,
          type: "quiz",
          content: { answers },
          status: submissionStatus,
          score,
          feedback,
          xpAwarded: submissionStatus === "passed" && !alreadyCompleted ? lesson.xpReward : 0,
        },
      });
    } else {
      // Concept lesson - just mark as read
      submissionStatus = "passed";
      feedback = "Lesson completed!";
    }

    // If passed and not already completed, update progress
    if (submissionStatus === "passed" && !alreadyCompleted) {
      xpAwarded = lesson.xpReward;

      // Update completed lessons
      const newCompletedLessons = [...completedLessons, lessonId];

      // Check if phase is now completed
      const phaseLessonIds = lesson.phase.lessons.map((l) => l.id);
      const isPhaseCompleted = phaseLessonIds.every((id) =>
        newCompletedLessons.includes(id)
      );

      const newCompletedPhases = isPhaseCompleted
        ? [...completedPhases, phaseId]
        : completedPhases;

      // Find next lesson
      const lessonIndex = lesson.phase.lessons.findIndex((l) => l.id === lessonId);
      let nextLessonId: string | null = null;
      let nextPhaseId: string | null = null;

      if (lessonIndex < lesson.phase.lessons.length - 1) {
        const nextLesson = lesson.phase.lessons[lessonIndex + 1];
        if (nextLesson) {
          nextLessonId = nextLesson.id;
          nextPhaseId = phaseId;
        }
      } else {
        // Move to next phase
        const phaseIndex = lesson.phase.path.phases.findIndex(
          (p) => p.id === phaseId
        );
        if (phaseIndex >= 0 && phaseIndex < lesson.phase.path.phases.length - 1) {
          const nextPhase = lesson.phase.path.phases[phaseIndex + 1];
          if (nextPhase) {
            nextPhaseId = nextPhase.id;
            nextLessonId = nextPhase.lessons[0]?.id ?? null;
          }
        }
      }

      // Check if entire path is completed
      const allPhasesCompleted = lesson.phase.path.phases.every((p) =>
        newCompletedPhases.includes(p.id)
      );

      await prisma.userLearningProgress.update({
        where: { id: userProgress.id },
        data: {
          completedLessons: newCompletedLessons,
          completedPhases: newCompletedPhases,
          currentPhaseId: nextPhaseId,
          currentLessonId: nextLessonId,
          lastAccessedAt: new Date(),
          completedAt: allPhasesCompleted ? new Date() : null,
        },
      });

      // Update user stats
      await prisma.userStats.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          totalXp: xpAwarded,
        },
        update: {
          totalXp: { increment: xpAwarded },
        },
      });

      // Record daily activity
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
          xpEarned: xpAwarded,
        },
        update: {
          xpEarned: { increment: xpAwarded },
        },
      });

      // Award bonus XP if phase completed
      if (isPhaseCompleted && !completedPhases.includes(phaseId)) {
        const phaseBonus = lesson.phase.xpReward;
        xpAwarded += phaseBonus;

        await prisma.userStats.update({
          where: { userId: session.user.id },
          data: {
            totalXp: { increment: phaseBonus },
          },
        });

        await prisma.dailyActivity.update({
          where: {
            userId_date: {
              userId: session.user.id,
              date: today,
            },
          },
          data: {
            xpEarned: { increment: phaseBonus },
          },
        });
      }

      // Award bonus XP if path completed
      if (allPhasesCompleted && !userProgress.completedAt) {
        const pathBonus = 100; // Bonus for completing entire path
        xpAwarded += pathBonus;

        await prisma.userStats.update({
          where: { userId: session.user.id },
          data: {
            totalXp: { increment: pathBonus },
          },
        });

        await prisma.dailyActivity.update({
          where: {
            userId_date: {
              userId: session.user.id,
              date: today,
            },
          },
          data: {
            xpEarned: { increment: pathBonus },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: submissionStatus,
      score,
      feedback,
      xpAwarded,
      alreadyCompleted,
    });
  } catch (error) {
    console.error("Complete lesson error:", error);
    return NextResponse.json(
      { error: "Failed to complete lesson" },
      { status: 500 }
    );
  }
}
