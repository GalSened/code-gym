import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Badge, Button, Input, Select } from "@/components/ui";
import { Difficulty, BugType } from "@/types";

interface SearchParams {
  difficulty?: Difficulty | "all";
  type?: BugType | "all";
  language?: string;
  status?: "all" | "fixed" | "attempted" | "unfixed";
  search?: string;
  page?: string;
}

export default async function HuntPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user stats for XP display
  const userStats = await prisma.userStats.findUnique({
    where: { userId: session.user.id },
    select: { totalXp: true },
  });

  const params = await searchParams;
  const difficulty = params.difficulty || "all";
  const type = params.type || "all";
  const language = params.language || "all";
  const status = params.status || "all";
  const search = params.search || "";
  const page = parseInt(params.page || "1");
  const pageSize = 12;

  // Build query filters
  const where: {
    difficulty?: Difficulty;
    type?: BugType;
    language?: string;
    isActive?: boolean;
    title?: { contains: string; mode: "insensitive" };
    id?: { in?: string[]; notIn?: string[] };
  } = {
    isActive: true,
  };

  if (difficulty && difficulty !== "all") {
    where.difficulty = difficulty;
  }

  if (type && type !== "all") {
    where.type = type;
  }

  if (language && language !== "all") {
    where.language = language;
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  // Get user's fixed and attempted bugs
  const userSubmissions = await prisma.bugSubmission.findMany({
    where: { userId: session.user.id },
    select: { bugId: true, status: true },
  });

  const fixedBugIds = new Set(
    userSubmissions.filter((s) => s.status === "passed").map((s) => s.bugId)
  );

  const attemptedBugIds = new Set(
    userSubmissions.filter((s) => s.status !== "passed").map((s) => s.bugId)
  );

  // Filter by status
  if (status === "fixed") {
    where.id = { in: Array.from(fixedBugIds) };
  } else if (status === "attempted") {
    where.id = { in: Array.from(attemptedBugIds) };
  } else if (status === "unfixed") {
    where.id = { notIn: Array.from(fixedBugIds) };
  }

  // Fetch bugs
  const [bugs, totalCount, languages] = await Promise.all([
    prisma.bug.findMany({
      where,
      orderBy: [{ difficulty: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.bug.count({ where }),
    prisma.bug.findMany({
      where: { isActive: true },
      select: { language: true },
      distinct: ["language"],
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const uniqueLanguages = languages.map((l) => l.language);

  // Stats
  const stats = {
    total: totalCount,
    fixed: fixedBugIds.size,
    easy: bugs.filter((b) => b.difficulty === "easy").length,
    medium: bugs.filter((b) => b.difficulty === "medium").length,
    hard: bugs.filter((b) => b.difficulty === "hard").length,
  };

  // Type color mapping
  const typeColors: Record<BugType, string> = {
    logic: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    performance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    security: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    edge_case: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  const typeLabels: Record<BugType, string> = {
    logic: "Logic",
    performance: "Performance",
    security: "Security",
    edge_case: "Edge Case",
  };

  // Check for today's daily hunt
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyHunt = await prisma.dailyHunt.findUnique({
    where: { date: today },
    include: {
      bugs: {
        include: { bug: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return (
    <DashboardLayout
      user={{ ...session.user, totalXp: userStats?.totalXp ?? 0 }}
      pageTitle="Hunt Mode"
      pageDescription="Find and fix bugs to sharpen your debugging skills"
    >
      {/* Daily Hunt Banner */}
      {dailyHunt && (
        <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Daily Hunt</span>
                </div>
                <p className="text-sm text-orange-100">
                  Complete today&apos;s 3 bug challenges for +{dailyHunt.bonusXp} bonus XP!
                </p>
              </div>
              <Link href="/hunt/daily">
                <Button variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
                  Start Hunt
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Bugs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.fixed}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fixed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {Math.round((stats.fixed / stats.total) * 100) || 0}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total - stats.fixed}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <form className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Input
              name="search"
              placeholder="Search bugs..."
              defaultValue={search}
            />
            <Select
              name="difficulty"
              defaultValue={difficulty}
              options={[
                { value: "all", label: "All Difficulties" },
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
            />
            <Select
              name="type"
              defaultValue={type}
              options={[
                { value: "all", label: "All Types" },
                { value: "logic", label: "Logic" },
                { value: "performance", label: "Performance" },
                { value: "security", label: "Security" },
                { value: "edge_case", label: "Edge Case" },
              ]}
            />
            <Select
              name="language"
              defaultValue={language}
              options={[
                { value: "all", label: "All Languages" },
                ...uniqueLanguages.map((l) => ({ value: l, label: l })),
              ]}
            />
            <Select
              name="status"
              defaultValue={status}
              options={[
                { value: "all", label: "All Status" },
                { value: "fixed", label: "Fixed" },
                { value: "attempted", label: "Attempted" },
                { value: "unfixed", label: "Unfixed" },
              ]}
            />
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Bug Grid */}
      {bugs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bugs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or check back later for new bugs
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {bugs.map((bug) => {
              const isFixed = fixedBugIds.has(bug.id);
              const isAttempted = attemptedBugIds.has(bug.id);

              return (
                <Link key={bug.id} href={`/hunt/${bug.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="pt-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          <Badge variant={bug.difficulty as "easy" | "medium" | "hard"}>
                            {bug.difficulty}
                          </Badge>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[bug.type as BugType]}`}>
                            {typeLabels[bug.type as BugType]}
                          </span>
                        </div>
                        {isFixed && (
                          <span className="text-green-500" title="Fixed">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                        {!isFixed && isAttempted && (
                          <span className="text-yellow-500" title="Attempted">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {bug.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                        {bug.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Badge variant="default">{bug.language}</Badge>
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          +{bug.xpReward} XP
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Link
                href={`/hunt?page=${page - 1}&difficulty=${difficulty}&type=${type}&language=${language}&status=${status}&search=${search}`}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="secondary" disabled={page <= 1}>
                  Previous
                </Button>
              </Link>

              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>

              <Link
                href={`/hunt?page=${page + 1}&difficulty=${difficulty}&type=${type}&language=${language}&status=${status}&search=${search}`}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="secondary" disabled={page >= totalPages}>
                  Next
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
