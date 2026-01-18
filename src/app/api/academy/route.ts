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

    // Fetch learning paths with phases and user progress
    const paths = await prisma.learningPath.findMany({
      where,
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
      orderBy: [{ difficulty: "asc" }, { title: "asc" }],
    });

    // Calculate progress for each path
    const pathsWithProgress = paths.map((path) => {
      const userProgress = path.progress[0] || null;
      const totalLessons = path.phases.reduce(
        (sum, phase) => sum + phase.lessons.length,
        0
      );
      const completedLessons = userProgress?.completedLessons.length || 0;
      const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        difficulty: path.difficulty,
        estimatedHours: path.estimatedHours,
        totalXp: path.totalXp,
        skills: path.skills,
        previewImage: path.previewImage,
        phaseCount: path.phases.length,
        lessonCount: totalLessons,
        progress: {
          completed: completedLessons,
          total: totalLessons,
          percentage: progressPercentage,
          completedPhases: userProgress?.completedPhases.length || 0,
        },
        isEnrolled: userProgress !== null,
        isCompleted: userProgress?.completedAt !== null,
      };
    });

    return NextResponse.json({
      success: true,
      paths: pathsWithProgress,
    });
  } catch (error) {
    console.error("Get learning paths error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning paths" },
      { status: 500 }
    );
  }
}
