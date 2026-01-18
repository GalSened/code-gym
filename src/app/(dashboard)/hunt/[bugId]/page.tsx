import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { BugWorkspace } from "@/components/features/hunt";

interface PageProps {
  params: Promise<{ bugId: string }>;
}

export default async function BugPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { bugId } = await params;

  // Fetch bug with user's submission history
  const bug = await prisma.bug.findUnique({
    where: { id: bugId, isActive: true },
  });

  if (!bug) {
    notFound();
  }

  // Get user's previous submissions for this bug
  const submissions = await prisma.bugSubmission.findMany({
    where: {
      userId: session.user.id,
      bugId,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const hasSolved = submissions.some((s) => s.status === "passed");
  const latestSubmission = submissions[0];

  // Parse test cases - hide solutions
  const testCases = (bug.testCases as unknown) as Array<{
    id: string;
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }>;

  // Only show visible test cases for "run", all for "submit"
  const visibleTestCases = testCases.filter((tc) => !tc.isHidden);

  return (
    <DashboardLayout
      user={session.user}
      pageTitle={bug.title}
      pageDescription="Find and fix the bug"
    >
      <BugWorkspace
        bug={{
          id: bug.id,
          title: bug.title,
          description: bug.description,
          difficulty: bug.difficulty,
          type: bug.type,
          language: bug.language,
          buggyCode: bug.buggyCode,
          hint: bug.hint,
          explanation: hasSolved ? bug.explanation : null,
          xpReward: bug.xpReward,
          testCases: visibleTestCases,
          totalTestCases: testCases.length,
        }}
        hasSolved={hasSolved}
        latestSubmission={latestSubmission ? {
          id: latestSubmission.id,
          status: latestSubmission.status,
          fixedCode: latestSubmission.fixedCode,
          createdAt: latestSubmission.createdAt.toISOString(),
        } : null}
      />
    </DashboardLayout>
  );
}
