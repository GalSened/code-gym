import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Badge, Button, Input, Select } from "@/components/ui";
import { Difficulty } from "@/types";

interface SearchParams {
  difficulty?: Difficulty | "all";
  category?: string;
  status?: "all" | "solved" | "attempted" | "unsolved";
  search?: string;
  page?: string;
}

export default async function MasteryPage({
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
  const category = params.category || "all";
  const status = params.status || "all";
  const search = params.search || "";
  const page = parseInt(params.page || "1");
  const pageSize = 12;

  // Build query filters
  const where: {
    difficulty?: Difficulty;
    category?: string;
    isActive?: boolean;
    title?: { contains: string; mode: "insensitive" };
    id?: { in?: string[]; notIn?: string[] };
  } = {
    isActive: true,
  };

  if (difficulty && difficulty !== "all") {
    where.difficulty = difficulty;
  }

  if (category && category !== "all") {
    where.category = category;
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  // Get user's solved and attempted challenges
  const userSubmissions = await prisma.challengeSubmission.findMany({
    where: { userId: session.user.id },
    select: { challengeId: true, status: true },
  });

  const solvedChallengeIds = new Set(
    userSubmissions
      .filter((s) => s.status === "passed")
      .map((s) => s.challengeId)
  );

  const attemptedChallengeIds = new Set(
    userSubmissions
      .filter((s) => s.status !== "passed")
      .map((s) => s.challengeId)
  );

  // Filter by status
  if (status === "solved") {
    where.id = { in: Array.from(solvedChallengeIds) };
  } else if (status === "attempted") {
    where.id = { in: Array.from(attemptedChallengeIds) };
  } else if (status === "unsolved") {
    where.id = { notIn: Array.from(solvedChallengeIds) };
  }

  // Fetch challenges
  const [challenges, totalCount, categories] = await Promise.all([
    prisma.challenge.findMany({
      where,
      orderBy: [{ difficulty: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.challenge.count({ where }),
    prisma.challenge.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Get unique categories for filter
  const uniqueCategories = categories.map((c) => c.category);

  // Stats
  const stats = {
    total: totalCount,
    solved: solvedChallengeIds.size,
    easy: challenges.filter((c) => c.difficulty === "easy").length,
    medium: challenges.filter((c) => c.difficulty === "medium").length,
    hard: challenges.filter((c) => c.difficulty === "hard").length,
  };

  // Difficulty color mapping
  const difficultyColors: Record<Difficulty, string> = {
    easy: "text-green-600 dark:text-green-400",
    medium: "text-yellow-600 dark:text-yellow-400",
    hard: "text-red-600 dark:text-red-400",
  };

  // XP rewards by difficulty
  const xpRewards: Record<Difficulty, number> = {
    easy: 10,
    medium: 25,
    hard: 50,
  };

  return (
    <DashboardLayout
      user={{ ...session.user, totalXp: userStats?.totalXp ?? 0 }}
      pageTitle="Mastery Mode"
      pageDescription="Practice coding challenges and level up your skills"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Challenges</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.solved}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Solved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {Math.round((stats.solved / stats.total) * 100) || 0}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total - stats.solved}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              name="search"
              placeholder="Search challenges..."
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
              name="category"
              defaultValue={category}
              options={[
                { value: "all", label: "All Categories" },
                ...uniqueCategories.map((c) => ({ value: c, label: c })),
              ]}
            />
            <Select
              name="status"
              defaultValue={status}
              options={[
                { value: "all", label: "All Status" },
                { value: "solved", label: "Solved" },
                { value: "attempted", label: "Attempted" },
                { value: "unsolved", label: "Unsolved" },
              ]}
            />
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Challenge Grid */}
      {challenges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No challenges found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {challenges.map((challenge) => {
              const isSolved = solvedChallengeIds.has(challenge.id);
              const isAttempted = attemptedChallengeIds.has(challenge.id);

              return (
                <Link key={challenge.id} href={`/mastery/${challenge.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="pt-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant={challenge.difficulty as "easy" | "medium" | "hard"}>
                          {challenge.difficulty}
                        </Badge>
                        {isSolved && (
                          <span className="text-green-500" title="Solved">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                        {!isSolved && isAttempted && (
                          <span className="text-yellow-500" title="Attempted">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {challenge.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                        {challenge.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Badge variant="default">{challenge.category}</Badge>
                        <span className={`text-sm font-medium ${difficultyColors[challenge.difficulty as Difficulty]}`}>
                          +{xpRewards[challenge.difficulty as Difficulty]} XP
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
                href={`/mastery?page=${page - 1}&difficulty=${difficulty}&category=${category}&status=${status}&search=${search}`}
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
                href={`/mastery?page=${page + 1}&difficulty=${difficulty}&category=${category}&status=${status}&search=${search}`}
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
