import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, Badge, Progress, Avatar } from "@/components/ui";

// XP to Level calculation (same as dashboard)
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

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user with stats and preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      stats: true,
      preferences: true,
      achievements: {
        include: {
          achievement: true,
        },
        orderBy: { unlockedAt: "desc" },
        take: 6,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate level stats
  const totalXp = user.stats?.totalXp || 0;
  const currentLevel = calculateLevel(totalXp);
  const currentLevelXp = Math.pow(currentLevel, 2) * 100;
  const nextLevelXp = xpForNextLevel(currentLevel);
  const xpProgress = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const levelProgressPercent = Math.round((xpProgress / xpNeeded) * 100);

  // Format join date
  const joinDate = user.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const stats = {
    totalXp,
    level: currentLevel,
    title: getLevelTitle(currentLevel),
    currentStreak: user.stats?.currentStreak || 0,
    longestStreak: user.stats?.longestStreak || 0,
    challengesSolved: user.stats?.challengesSolved || 0,
    bugsFixed: user.stats?.bugsFixed || 0,
    projectsCompleted: user.stats?.projectsCompleted || 0,
    lessonsCompleted: user.stats?.lessonsCompleted || 0,
    pathsCompleted: user.stats?.pathsCompleted || 0,
    totalTimeSpent: user.stats?.totalTimeSpent || 0,
    levelProgress: levelProgressPercent,
    xpToNextLevel: xpNeeded - xpProgress,
  };

  // Format time spent
  const hoursSpent = Math.floor(stats.totalTimeSpent / 60);
  const minutesSpent = stats.totalTimeSpent % 60;
  const timeSpentDisplay = hoursSpent > 0
    ? `${hoursSpent}h ${minutesSpent}m`
    : `${minutesSpent}m`;

  return (
    <DashboardLayout
      user={session.user}
      pageTitle="Profile"
      pageDescription="View your progress and achievements"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar
                src={user.avatarUrl || user.image}
                name={user.displayName || user.name || user.email || "User"}
                size="xl"
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.displayName || user.name || "Coder"}
                </h1>
                {user.username && (
                  <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Member since {joinDate}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <Badge variant="default">Level {stats.level}</Badge>
                  <Badge variant="secondary">{stats.title}</Badge>
                  {stats.currentStreak > 0 && (
                    <Badge variant="warning">{stats.currentStreak} day streak</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Level {stats.level} - {stats.title}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stats.xpToNextLevel.toLocaleString()} XP to Level {stats.level + 1}
              </span>
            </div>
            <Progress value={stats.levelProgress} variant="xp" className="h-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Total XP: {stats.totalXp.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.challengesSolved}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Challenges Solved
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.bugsFixed}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Bugs Fixed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.projectsCompleted}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Projects Completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.lessonsCompleted}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Lessons Completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Streaks and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Streaks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.currentStreak} days
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{stats.currentStreak > 0 ? "🔥" : "❄️"}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Longest streak: <span className="font-medium text-gray-700 dark:text-gray-300">{stats.longestStreak} days</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Time Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Time Coding</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {timeSpentDisplay}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Learning paths completed: <span className="font-medium text-gray-700 dark:text-gray-300">{stats.pathsCompleted}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {user.achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {user.achievements.map((ua) => (
                  <div
                    key={ua.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xl">
                      {ua.achievement.icon || "🏆"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {ua.achievement.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(ua.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferences Summary */}
        {user.preferences && (
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Preferred Languages</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(user.preferences.preferredLanguages || []).map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Daily Goal</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {user.preferences.dailyGoal} minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
