import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { executeTestsSequentially, TestCaseInput } from "@/lib/services/piston";

interface RouteParams {
  params: Promise<{ bugId: string }>;
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

    const { bugId } = await params;
    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

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

    // Parse test cases from JSON field - only visible ones for run
    const allTestCases = (bug.testCases as unknown) as TestCaseInput[];
    const visibleTestCases = allTestCases.filter((tc) => !tc.isHidden);

    // Run code against each visible test case sequentially to respect rate limits
    const results = await executeTestsSequentially(code, language, visibleTestCases, 10000);

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: true,
      results,
      passedCount,
      totalCount,
      allPassed: passedCount === totalCount,
    });
  } catch (error) {
    console.error("Run code error:", error);
    return NextResponse.json(
      { error: "Failed to run code" },
      { status: 500 }
    );
  }
}
