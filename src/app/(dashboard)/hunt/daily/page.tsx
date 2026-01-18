import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { BugType } from "@/types";

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

export default async function DailyHuntPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tomorrow for countdown
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch today's daily hunt
  const dailyHunt = await prisma.dailyHunt.findUnique({
    where: { date: today },
    include: {
      bugs: {
        include: { bug: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  // Get user's submissions for today's bugs
  let userSubmissions: Map<string, string> = new Map();
  if (dailyHunt) {
    const bugIds = dailyHunt.bugs.map((b) => b.bugId);
    const submissions = await prisma.bugSubmission.findMany({
      where: {
        userId: session.user.id,
        bugId: { in: bugIds },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map bug IDs to their best status
    for (const sub of submissions) {
      const existing = userSubmissions.get(sub.bugId);
      if (!existing || sub.status === "passed") {
        userSubmissions.set(sub.bugId, sub.status);
      }
    }
  }

  // Calculate stats
  const completedCount = dailyHunt
    ? dailyHunt.bugs.filter((b) => userSubmissions.get(b.bugId) === "passed").length
    : 0;
  const totalCount = dailyHunt?.bugs.length || 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  // Calculate time remaining until next daily hunt
  const now = new Date();
  const hoursRemaining = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <DashboardLayout
      user={session.user}
      pageTitle="Daily Hunt"
      pageDescription="Complete today's bug challenges for bonus XP"
    >
      {/* Header Card */}
      <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-2xl font-bold">Daily Hunt</h1>
              </div>
              <p className="text-orange-100">
                {dailyHunt
                  ? allCompleted
                    ? "Congratulations! You've completed today's hunt!"
                    : `Fix ${totalCount - completedCount} more bug${totalCount - completedCount === 1 ? "" : "s"} to complete today's hunt`
                  : "No daily hunt available today. Check back tomorrow!"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-100">Next hunt in</p>
              <p className="text-3xl font-bold">
                {hoursRemaining}h {minutesRemaining}m
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {dailyHunt && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">
                  {completedCount}/{totalCount} bugs fixed
                </span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Bonus XP */}
          {dailyHunt && (
            <div className="mt-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">
                {allCompleted
                  ? `+${dailyHunt.bonusXp} bonus XP earned!`
                  : `Complete all to earn +${dailyHunt.bonusXp} bonus XP`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bug Cards */}
      {dailyHunt ? (
        <div className="space-y-4">
          {dailyHunt.bugs.map((dailyBug, index) => {
            const bug = dailyBug.bug;
            const status = userSubmissions.get(bug.id);
            const isFixed = status === "passed";
            const isAttempted = status === "failed";

            return (
              <Card
                key={bug.id}
                className={`transition-all ${isFixed ? "ring-2 ring-green-500" : ""}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Number badge */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        isFixed
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {isFixed ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Bug info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {bug.title}
                        </h3>
                        <Badge variant={bug.difficulty as "easy" | "medium" | "hard"}>
                          {bug.difficulty}
                        </Badge>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[bug.type as BugType]}`}>
                          {typeLabels[bug.type as BugType]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {bug.description}
                      </p>
                    </div>

                    {/* Status and action */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant="default">{bug.language}</Badge>
                        <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                          +{bug.xpReward} XP
                        </p>
                      </div>
                      <Link href={`/hunt/${bug.id}`}>
                        <Button
                          variant={isFixed ? "secondary" : "primary"}
                          disabled={isFixed}
                        >
                          {isFixed ? "Completed" : isAttempted ? "Retry" : "Start"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Daily Hunt Today
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Check back tomorrow for a new set of bug challenges!
            </p>
            <Link href="/hunt">
              <Button variant="secondary">Browse All Bugs</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Back to Hunt link */}
      <div className="mt-6 text-center">
        <Link
          href="/hunt"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          &larr; Back to Bug Hunt
        </Link>
      </div>
    </DashboardLayout>
  );
}
