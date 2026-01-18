import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ bugId: string }>;
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

    const { bugId } = await params;

    // Fetch bug
    const bug = await prisma.bug.findUnique({
      where: { id: bugId, isActive: true },
    });

    if (!bug) {
      return NextResponse.json(
        { error: "Bug not found" },
        { status: 404 }
      );
    }

    // Fetch user's submissions for this bug
    const submissions = await prisma.bugSubmission.findMany({
      where: {
        userId: session.user.id,
        bugId,
      },
      orderBy: { createdAt: "desc" },
    });

    const isSolved = submissions.some((s) => s.status === "passed");
    const latestSubmission = submissions[0] || null;

    return NextResponse.json({
      success: true,
      bug: {
        id: bug.id,
        slug: bug.slug,
        title: bug.title,
        description: bug.description,
        difficulty: bug.difficulty,
        type: bug.type,
        language: bug.language,
        buggyCode: bug.buggyCode,
        testCases: bug.testCases,
        hint: bug.hint,
        xpReward: bug.xpReward,
        // Only show correct code and explanation if solved
        correctCode: isSolved ? bug.correctCode : null,
        explanation: isSolved ? bug.explanation : null,
      },
      isSolved,
      latestSubmission: latestSubmission
        ? {
            id: latestSubmission.id,
            fixedCode: latestSubmission.fixedCode,
            status: latestSubmission.status,
            createdAt: latestSubmission.createdAt.toISOString(),
          }
        : null,
      submissions: submissions.map((s) => ({
        id: s.id,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get bug error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bug" },
      { status: 500 }
    );
  }
}
