import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { MilestoneWorkspace } from "@/components/features/build";

interface PageProps {
  params: Promise<{ projectId: string; milestoneId: string }>;
}

export default async function MilestonePage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user stats for XP display
  const userStats = await prisma.userStats.findUnique({
    where: { userId: session.user.id },
    select: { totalXp: true },
  });

  const { projectId, milestoneId } = await params;

  // Fetch project with all milestones
  const project = await prisma.project.findUnique({
    where: { id: projectId, isActive: true },
    include: {
      milestones: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Find the current milestone
  const milestone = project.milestones.find((m) => m.id === milestoneId);

  if (!milestone) {
    notFound();
  }

  // Get user's submissions for this project
  const submissions = await prisma.projectSubmission.findMany({
    where: {
      userId: session.user.id,
      projectId,
    },
    orderBy: { createdAt: "desc" },
  });

  // Build milestone status map
  const milestoneStatus = new Map<string, string>();
  for (const submission of submissions) {
    const existing = milestoneStatus.get(submission.milestoneId);
    if (!existing || submission.status === "passed") {
      milestoneStatus.set(submission.milestoneId, submission.status);
    }
  }

  // Check if this milestone is accessible
  const milestoneIndex = project.milestones.findIndex((m) => m.id === milestoneId);
  const previousMilestones = project.milestones.slice(0, milestoneIndex);
  const isAccessible =
    milestoneIndex === 0 ||
    previousMilestones.every((m) => milestoneStatus.get(m.id) === "passed");

  if (!isAccessible) {
    // Redirect to project page if milestone is locked
    redirect(`/build/${projectId}`);
  }

  // Get submissions for this specific milestone
  const milestoneSubmissions = submissions.filter(
    (s) => s.milestoneId === milestoneId
  );
  const latestSubmission = milestoneSubmissions[0];
  const isCompleted = milestoneStatus.get(milestoneId) === "passed";

  // Find previous and next milestones
  const prevMilestone = milestoneIndex > 0 ? project.milestones[milestoneIndex - 1] : null;
  const nextMilestone =
    milestoneIndex < project.milestones.length - 1
      ? project.milestones[milestoneIndex + 1]
      : null;
  const canAccessNext = isCompleted && nextMilestone;

  // Parse starter files
  const starterFiles = (milestone.starterFiles as Record<string, string>) || {};

  return (
    <DashboardLayout
      user={{ ...session.user, totalXp: userStats?.totalXp ?? 0 }}
      pageTitle={milestone.title}
      pageDescription={`${project.title} - Milestone ${milestoneIndex + 1}`}
    >
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/build" className="hover:text-gray-700 dark:hover:text-gray-300">
          Build
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link
          href={`/build/${projectId}`}
          className="hover:text-gray-700 dark:hover:text-gray-300"
        >
          {project.title}
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 dark:text-white">{milestone.title}</span>
      </div>

      {/* Milestone Header */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="default">
                  Milestone {milestoneIndex + 1} of {project.milestones.length}
                </Badge>
                {isCompleted && (
                  <Badge variant="easy" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Completed
                  </Badge>
                )}
                {latestSubmission && !isCompleted && (
                  <Badge variant="secondary" className="capitalize">
                    {latestSubmission.status.replace("_", " ")}
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {milestone.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {milestone.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                +{milestone.xpReward} XP
              </p>
            </div>
          </div>

          {/* Navigation between milestones */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {prevMilestone ? (
              <Link href={`/build/${projectId}/${prevMilestone.id}`}>
                <Button variant="ghost" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {canAccessNext ? (
              <Link href={`/build/${projectId}/${nextMilestone.id}`}>
                <Button variant="ghost" size="sm">
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            ) : nextMilestone ? (
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Complete to unlock next
              </span>
            ) : (
              <div />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestone Workspace */}
      <MilestoneWorkspace
        projectId={projectId}
        milestoneId={milestoneId}
        instructions={milestone.instructions}
        requirements={milestone.requirements}
        starterFiles={starterFiles}
        isCompleted={isCompleted}
        latestSubmission={latestSubmission ? {
          id: latestSubmission.id,
          files: latestSubmission.files as Record<string, string>,
          status: latestSubmission.status,
          feedback: latestSubmission.feedback,
          aiReview: latestSubmission.aiReview,
          createdAt: latestSubmission.createdAt.toISOString(),
        } : null}
      />

      {/* Completion message */}
      {isCompleted && !nextMilestone && (
        <Card className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="py-6 text-center">
            <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-bold mb-2">Project Completed!</h3>
            <p className="text-green-100 mb-4">
              Congratulations! You've completed all milestones for {project.title}.
            </p>
            <Link href="/build">
              <Button variant="secondary">
                Browse More Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
