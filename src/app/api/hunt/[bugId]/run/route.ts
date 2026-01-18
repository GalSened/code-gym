import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { executeCode, wrapCodeWithTestHarness, compareOutputs } from "@/lib/services/piston";

interface RouteParams {
  params: Promise<{ bugId: string }>;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
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
    const allTestCases = (bug.testCases as unknown) as TestCase[];
    const visibleTestCases = allTestCases.filter((tc) => !tc.isHidden);

    // Run code against each visible test case
    const results = await Promise.all(
      visibleTestCases.map(async (testCase) => {
        // Wrap code with test harness
        const wrappedCode = wrapCodeWithTestHarness(code, language, testCase.input);

        // Execute the code
        const result = await executeCode(wrappedCode, language, undefined, 10000);

        // Compare output
        const passed = result.success && compareOutputs(testCase.expectedOutput, result.output);

        return {
          id: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          passed,
          error: result.error,
          executionTime: result.executionTime,
        };
      })
    );

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
