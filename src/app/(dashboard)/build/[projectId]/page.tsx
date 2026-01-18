import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Badge, Button } from "@/components/ui";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { projectId } = await params;

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

  // Calculate progress
  const completedCount = Array.from(milestoneStatus.values()).filter(s => s === "passed").length;
  const totalCount = project.milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find current milestone (first incomplete)
  const currentMilestoneIndex = project.milestones.findIndex(
    m => milestoneStatus.get(m.id) !== "passed"
  );
  const currentMilestone = currentMilestoneIndex >= 0
    ? project.milestones[currentMilestoneIndex]
    : null;

  return (
    <DashboardLayout
      user={session.user}
      pageTitle={project.title}
      pageDescription="Build your project step by step"
    >
      {/* Back Link */}
      <Link
        href="/build"
        className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </Link>

      {/* Project Header */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={project.difficulty as "easy" | "medium" | "hard"}>
                  {project.difficulty}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ~{project.estimatedHours} hours
                </span>
                <span className="text-sm text-primary-600 dark:text-primary-400">
                  +{project.xpReward} XP
                </span>
              </div>
            </div>
            {currentMilestone && (
              <Link href={`/build/${project.id}/${currentMilestone.id}`}>
                <Button variant="primary">
                  {completedCount === 0 ? "Start Building" : "Continue"}
                </Button>
              </Link>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skills You'll Learn
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-gray-500 dark:text-gray-400">
                {completedCount}/{totalCount} milestones completed
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progressPercentage === 100 ? "bg-green-500" : "bg-primary-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones List */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Project Milestones
      </h2>

      <div className="space-y-3">
        {project.milestones.map((milestone, index) => {
          const status = milestoneStatus.get(milestone.id);
          const isCompleted = status === "passed";
          const isInProgress = status && status !== "passed";
          const isCurrent = currentMilestoneIndex === index;
          const isLocked = index > currentMilestoneIndex && currentMilestoneIndex !== -1;

          return (
            <Card
              key={milestone.id}
              className={`transition-all ${
                isCompleted ? "ring-2 ring-green-500" :
                isCurrent ? "ring-2 ring-primary-500" : ""
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : isCurrent
                        ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                        : isLocked
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : isLocked ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Milestone Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        isLocked ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"
                      }`}>
                        {milestone.title}
                      </h3>
                      {isCurrent && !isCompleted && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                      {isInProgress && !isCompleted && (
                        <Badge variant="secondary" className="text-xs capitalize">{status}</Badge>
                      )}
                    </div>
                    <p className={`text-sm line-clamp-1 ${
                      isLocked ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {milestone.description}
                    </p>
                  </div>

                  {/* XP & Action */}
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${
                      isLocked ? "text-gray-400" : "text-primary-600 dark:text-primary-400"
                    }`}>
                      +{milestone.xpReward} XP
                    </span>
                    {!isLocked && (
                      <Link href={`/build/${project.id}/${milestone.id}`}>
                        <Button
                          variant={isCompleted ? "secondary" : "primary"}
                          size="sm"
                        >
                          {isCompleted ? "Review" : isCurrent ? "Start" : "View"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedCount === totalCount && totalCount > 0 && (
        <Card className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="py-6 text-center">
            <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-bold mb-2">Project Completed!</h3>
            <p className="text-green-100">
              Congratulations! You've completed all milestones and earned {project.xpReward} XP.
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
