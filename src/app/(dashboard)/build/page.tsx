import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Badge, Button } from "@/components/ui";

interface SearchParams {
  difficulty?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default async function BuildPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const difficultyFilter = params.difficulty;

  // Build query
  const where: { isActive: boolean; difficulty?: string } = { isActive: true };
  if (difficultyFilter && difficultyFilter !== "all") {
    where.difficulty = difficultyFilter;
  }

  // Fetch projects
  const projects = await prisma.project.findMany({
    where,
    include: {
      milestones: {
        orderBy: { orderIndex: "asc" },
      },
      submissions: {
        where: { userId: session.user.id },
      },
    },
    orderBy: [{ difficulty: "asc" }, { title: "asc" }],
  });

  // Calculate progress for each project
  const projectsWithProgress = projects.map((project) => {
    const completedMilestones = new Set(
      project.submissions
        .filter((s) => s.status === "passed")
        .map((s) => s.milestoneId)
    );

    return {
      ...project,
      progress: {
        completed: completedMilestones.size,
        total: project.milestones.length,
        percentage: project.milestones.length > 0
          ? Math.round((completedMilestones.size / project.milestones.length) * 100)
          : 0,
      },
      isStarted: project.submissions.length > 0,
      isCompleted: completedMilestones.size === project.milestones.length && project.milestones.length > 0,
    };
  });

  return (
    <DashboardLayout
      user={session.user}
      pageTitle="Build Mode"
      pageDescription="Learn by building real-world projects step by step"
    >
      {/* Header */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h1 className="text-2xl font-bold">Build Mode</h1>
          </div>
          <p className="text-purple-100">
            Build real projects from scratch with guided milestones. Learn by doing!
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
        <div className="flex gap-2">
          {["all", "beginner", "intermediate", "advanced"].map((difficulty) => (
            <Link
              key={difficulty}
              href={`/build${difficulty !== "all" ? `?difficulty=${difficulty}` : ""}`}
            >
              <Badge
                variant={
                  (difficultyFilter === difficulty || (!difficultyFilter && difficulty === "all"))
                    ? "default"
                    : "secondary"
                }
                className="cursor-pointer capitalize"
              >
                {difficulty}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {projectsWithProgress.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projectsWithProgress.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Preview Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${difficultyColors[project.difficulty]}`}>
                    {project.difficulty}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>

                {/* Progress */}
                {project.isStarted && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{project.progress.completed}/{project.progress.total} milestones</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          project.isCompleted ? "bg-green-500" : "bg-primary-500"
                        }`}
                        style={{ width: `${project.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ~{project.estimatedHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {project.xpReward} XP
                  </span>
                </div>

                {/* Action Button */}
                <Link href={`/build/${project.id}`}>
                  <Button
                    variant={project.isCompleted ? "secondary" : "primary"}
                    className="w-full"
                  >
                    {project.isCompleted
                      ? "Review"
                      : project.isStarted
                      ? "Continue"
                      : "Start Project"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Projects Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {difficultyFilter
                ? `No ${difficultyFilter} projects found. Try a different filter.`
                : "Projects are coming soon. Check back later!"}
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
