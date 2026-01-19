import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, Badge, Progress } from "@/components/ui";
import Link from "next/link";

// XP to Level calculation
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel + 1, 2) * 100;
}

function getLevelTitle(level: number): string {
  if (level < 5) return "Newbie";
  if (level < 10) return "Apprentice";
  if (level < 20) return "Junior Developer";
  if (level < 35) return "Developer";
  if (level < 50) return "Senior Developer";
  if (level < 70) return "Expert";
  if (level < 85) return "Master";
  if (level < 95) return "Grandmaster";
  return "Code Legend";
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user stats
  const userStats = await prisma.userStats.findUnique({
    where: { userId: session.user.id },
  });

  // Fetch recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentActivity = await prisma.dailyActivity.findMany({
    where: {
      userId: session.user.id,
      date: { gte: sevenDaysAgo },
    },
    orderBy: { date: "desc" },
  });

  // Fetch recent submissions
  const recentSubmissions = await prisma.challengeSubmission.findMany({
    where: { userId: session.user.id },
    include: { challenge: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate stats
  const totalXp = userStats?.totalXp || 0;
  const currentLevel = calculateLevel(totalXp);
  const currentLevelXp = Math.pow(currentLevel, 2) * 100;
  const nextLevelXp = xpForNextLevel(currentLevel);
  const xpProgress = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const levelProgressPercent = Math.round((xpProgress / xpNeeded) * 100);

  const stats = {
    totalXp,
    level: currentLevel,
    title: getLevelTitle(currentLevel),
    currentStreak: userStats?.currentStreak || 0,
    longestStreak: userStats?.longestStreak || 0,
    challengesSolved: userStats?.challengesSolved || 0,
    bugsFixed: userStats?.bugsFixed || 0,
    projectsCompleted: userStats?.projectsCompleted || 0,
    lessonsCompleted: userStats?.lessonsCompleted || 0,
    levelProgress: levelProgressPercent,
    xpToNextLevel: xpNeeded - xpProgress,
  };

  // Quick action cards for each mode
  const modeCards = [
    {
      title: "Mastery",
      description: "Practice coding challenges",
      href: "/mastery",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      stat: `${stats.challengesSolved} solved`,
    },
    {
      title: "Build",
      description: "Create real projects",
      href: "/build",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      stat: `${stats.projectsCompleted} completed`,
    },
    {
      title: "Hunt",
      description: "Find and fix bugs",
      href: "/hunt",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      stat: `${stats.bugsFixed} fixed`,
    },
    {
      title: "Academy",
      description: "Structured learning paths",
      href: "/academy",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      stat: `${stats.lessonsCompleted} lessons`,
    },
  ];

  return (
    <DashboardLayout
      user={{ ...session.user, totalXp }}
      pageTitle={`Welcome back, ${session.user.name?.split(" ")[0] || "Coder"}!`}
      pageDescription="Track your progress and continue your coding journey"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* XP & Level Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Level {stats.level}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.title}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">{stats.level}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{stats.totalXp.toLocaleString()} XP</span>
                <span className="text-gray-500 dark:text-gray-400">{stats.xpToNextLevel.toLocaleString()} to next</span>
              </div>
              <Progress value={stats.levelProgress} variant="xp" />
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak} days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Longest: {stats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        {/* Challenges Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Challenges Solved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.challengesSolved}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">💻</span>
              </div>
            </div>
            <Link href="/mastery" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400">
              View challenges →
            </Link>
          </CardContent>
        </Card>

        {/* Bugs Fixed Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bugs Fixed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bugsFixed}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐛</span>
              </div>
            </div>
            <Link href="/hunt" className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Start hunting →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {modeCards.map((mode) => (
          <Link key={mode.title} href={mode.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className={`w-14 h-14 ${mode.bgColor} rounded-xl flex items-center justify-center mb-4 ${mode.color}`}>
                  {mode.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{mode.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{mode.description}</p>
                <Badge variant="default">{mode.stat}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Heatmap Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Activity This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const activity = recentActivity.find(
                  (a) => a.date.toDateString() === date.toDateString()
                );
                const xpEarned = activity?.xpEarned || 0;
                const intensity = xpEarned === 0 ? 0 : xpEarned < 20 ? 1 : xpEarned < 50 ? 2 : xpEarned < 100 ? 3 : 4;

                const colors = [
                  "bg-gray-100 dark:bg-gray-800",
                  "bg-green-200 dark:bg-green-900",
                  "bg-green-300 dark:bg-green-800",
                  "bg-green-400 dark:bg-green-700",
                  "bg-green-500 dark:bg-green-600",
                ];

                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {date.toLocaleDateString("en", { weekday: "short" })}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-lg ${colors[intensity]} flex items-center justify-center`}
                      title={`${xpEarned} XP`}
                    >
                      {xpEarned > 0 && (
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {xpEarned}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No submissions yet. Start solving challenges!
                </p>
                <Link href="/mastery">
                  <Badge className="cursor-pointer">Browse Challenges</Badge>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => {
                  const passed = submission.status === "passed";
                  return (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/mastery/${submission.challengeId}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-primary-600 truncate block"
                        >
                          {submission.challenge.title}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={passed ? "success" : "error"}>
                        {passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
