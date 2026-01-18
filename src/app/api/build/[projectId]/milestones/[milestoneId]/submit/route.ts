import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ projectId: string; milestoneId: string }>;
}

interface TestCriteria {
  type: string; // 'contains', 'file_exists', 'function_exists', 'output_match'
  target?: string;
  value?: string;
  description?: string;
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

    const { projectId, milestoneId } = await params;
    const body = await request.json();
    const { files } = body;

    if (!files || Object.keys(files).length === 0) {
      return NextResponse.json(
        { error: "Files are required" },
        { status: 400 }
      );
    }

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

    // Find the milestone
    const milestone = project.milestones.find((m) => m.id === milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Get user's submissions to check if milestone is accessible
    const existingSubmissions = await prisma.projectSubmission.findMany({
      where: {
        userId: session.user.id,
        projectId,
      },
    });

    // Build milestone status map
    const milestoneStatus = new Map<string, string>();
    for (const submission of existingSubmissions) {
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

    // Check if user has already passed this milestone
    const alreadyPassed = milestoneStatus.get(milestoneId) === "passed";

    // Validate against test criteria
    const testCriteria = (milestone.testCriteria as unknown as TestCriteria[]) || [];
    const validationResults = validateSubmission(files, testCriteria);
    const allPassed = validationResults.every((r) => r.passed);

    // Generate AI review (simplified - in production, use actual AI)
    const aiReview = generateSimpleReview(files, milestone.requirements, allPassed);

    // Determine status
    const status = allPassed ? "passed" : "needs_revision";

    // Create submission
    const submission = await prisma.projectSubmission.create({
      data: {
        userId: session.user.id,
        projectId,
        milestoneId,
        files,
        status,
        aiReview,
        feedback: allPassed
          ? "Great work! All requirements have been met."
          : "Some requirements are not fully met. Please review the feedback and try again.",
        xpAwarded: 0,
      },
    });

    // Award XP only if passing for the first time
    let xpAwarded = 0;
    if (allPassed && !alreadyPassed) {
      xpAwarded = milestone.xpReward;

      // Update submission with XP
      await prisma.projectSubmission.update({
        where: { id: submission.id },
        data: { xpAwarded },
      });

      // Update user stats
      await prisma.userStats.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          totalXp: xpAwarded,
          projectsCompleted: 0,
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

      // Check if all milestones are completed (project finished)
      const updatedSubmissions = await prisma.projectSubmission.findMany({
        where: {
          userId: session.user.id,
          projectId,
          status: "passed",
        },
      });

      const completedMilestoneIds = new Set(
        updatedSubmissions.map((s) => s.milestoneId)
      );

      if (completedMilestoneIds.size === project.milestones.length) {
        // Award project completion XP and increment completed count
        const projectBonusXp = project.xpReward;

        await prisma.userStats.update({
          where: { userId: session.user.id },
          data: {
            totalXp: { increment: projectBonusXp },
            projectsCompleted: { increment: 1 },
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
            xpEarned: { increment: projectBonusXp },
          },
        });

        xpAwarded += projectBonusXp;
      }
    }

    return NextResponse.json({
      success: true,
      status,
      aiReview,
      feedback: submission.feedback,
      validationResults,
      xpAwarded,
      alreadyPassed,
    });
  } catch (error) {
    console.error("Submit milestone error:", error);
    return NextResponse.json(
      { error: "Failed to submit milestone" },
      { status: 500 }
    );
  }
}

// Simple validation function
function validateSubmission(
  files: Record<string, string>,
  criteria: TestCriteria[]
): { criterion: string; passed: boolean; message: string }[] {
  if (criteria.length === 0) {
    // No criteria defined, auto-pass
    return [{ criterion: "submission", passed: true, message: "Submission received" }];
  }

  return criteria.map((criterion) => {
    switch (criterion.type) {
      case "file_exists":
        const fileExists = criterion.target && files[criterion.target];
        return {
          criterion: criterion.description || `File ${criterion.target} exists`,
          passed: !!fileExists,
          message: fileExists
            ? `File ${criterion.target} found`
            : `File ${criterion.target} is missing`,
        };

      case "contains":
        const fileContent = criterion.target && files[criterion.target];
        const containsValue =
          fileContent && criterion.value && fileContent.includes(criterion.value);
        return {
          criterion: criterion.description || `Contains "${criterion.value}"`,
          passed: !!containsValue,
          message: containsValue
            ? `Found expected content`
            : `Expected content not found`,
        };

      case "function_exists":
        const anyFileHasFunction = Object.values(files).some(
          (content) =>
            criterion.value &&
            (content.includes(`function ${criterion.value}`) ||
              content.includes(`const ${criterion.value} =`) ||
              content.includes(`def ${criterion.value}`))
        );
        return {
          criterion: criterion.description || `Function ${criterion.value} exists`,
          passed: anyFileHasFunction,
          message: anyFileHasFunction
            ? `Function ${criterion.value} found`
            : `Function ${criterion.value} not found`,
        };

      default:
        return {
          criterion: criterion.description || "Unknown criterion",
          passed: true,
          message: "Skipped unknown criterion",
        };
    }
  });
}

// Simple review generator (in production, use actual AI)
function generateSimpleReview(
  files: Record<string, string>,
  requirements: string[],
  allPassed: boolean
): string {
  const fileCount = Object.keys(files).length;
  const totalLines = Object.values(files).reduce(
    (sum, content) => sum + content.split("\n").length,
    0
  );

  if (allPassed) {
    return `Great submission! Your code includes ${fileCount} file(s) with approximately ${totalLines} lines of code. All requirements have been addressed. The implementation looks solid. Keep up the good work!`;
  }

  return `Your submission includes ${fileCount} file(s) with approximately ${totalLines} lines of code. Some requirements may need additional attention:\n\n${requirements
    .map((req, i) => `${i + 1}. ${req}`)
    .join("\n")}\n\nPlease review these requirements and update your submission.`;
}
