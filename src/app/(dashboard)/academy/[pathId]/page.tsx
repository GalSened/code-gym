"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Zap,
  ChevronRight,
  BookOpen,
  Target,
  Lock,
  Check,
  Loader2,
  ArrowLeft,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  orderIndex: number;
  title: string;
  type: string;
  xpReward: number;
  isCompleted: boolean;
}

interface Phase {
  id: string;
  orderIndex: number;
  title: string;
  description: string;
  deliverable: string | null;
  xpReward: number;
  lessons: Lesson[];
  progress: {
    completed: number;
    total: number;
  };
  isCompleted: boolean;
  isAccessible: boolean;
  isCurrent: boolean;
}

interface LearningPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  totalXp: number;
  skills: string[];
  previewImage: string | null;
}

interface PathData {
  path: LearningPath;
  phases: Phase[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
    completedPhases: number;
    totalPhases: number;
  };
  isEnrolled: boolean;
  isCompleted: boolean;
  currentPhaseId: string | null;
  currentLessonId: string | null;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const lessonTypeIcons: Record<string, string> = {
  concept: "📖",
  exercise: "💻",
  quiz: "❓",
};

interface PageProps {
  params: Promise<{ pathId: string }>;
}

export default function PathPage({ params }: PageProps) {
  const { pathId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<PathData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPath = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/academy/${pathId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch learning path");
      }

      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [pathId]);

  useEffect(() => {
    fetchPath();
  }, [fetchPath]);

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      const response = await fetch(`/api/academy/${pathId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to enroll");
      }

      // Refresh data
      await fetchPath();

      // Navigate to first lesson
      if (data?.phases[0]?.lessons[0]) {
        router.push(
          `/academy/${pathId}/${data.phases[0].id}/${data.phases[0].lessons[0].id}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinue = () => {
    if (data?.currentPhaseId && data?.currentLessonId) {
      router.push(
        `/academy/${pathId}/${data.currentPhaseId}/${data.currentLessonId}`
      );
    } else if (data?.phases[0]?.lessons[0]) {
      router.push(
        `/academy/${pathId}/${data.phases[0].id}/${data.phases[0].lessons[0].id}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error || "Failed to load learning path"}
        </div>
      </div>
    );
  }

  const { path, phases, progress, isEnrolled, isCompleted } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/academy"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-500 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Academy</span>
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-full",
                  difficultyColors[path.difficulty] || "bg-gray-100 text-gray-700"
                )}
              >
                {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
              </span>
              <div className="flex items-center gap-1 text-purple-500">
                <Zap className="h-4 w-4" />
                <span className="font-medium">{path.totalXp} XP</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">{path.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {path.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-gray-400" />
                <span>{phases.length} phases</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-400" />
                <span>{progress.total} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{path.estimatedHours} hours</span>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Skills you&apos;ll learn
              </h3>
              <div className="flex flex-wrap gap-2">
                {path.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {!isEnrolled ? (
              <button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isEnrolling ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                Start Learning
              </button>
            ) : isCompleted ? (
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check className="h-5 w-5" />
                Completed - Review
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Play className="h-5 w-5" />
                Continue Learning
              </button>
            )}
          </div>

          {/* Progress Card */}
          {isEnrolled && (
            <div className="lg:w-80 bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="font-medium mb-4">Your Progress</h3>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Overall Progress
                  </span>
                  <span className="font-medium">{progress.percentage}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Lessons Completed
                  </span>
                  <span>
                    {progress.completed}/{progress.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Phases Completed
                  </span>
                  <span>
                    {progress.completedPhases}/{progress.totalPhases}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">Learning Path Timeline</h2>

        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl border transition-colors",
                phase.isAccessible
                  ? "border-gray-200 dark:border-gray-700"
                  : "border-gray-100 dark:border-gray-800 opacity-60"
              )}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Phase Number */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                      phase.isCompleted
                        ? "bg-green-500 text-white"
                        : phase.isCurrent
                        ? "bg-purple-500 text-white"
                        : phase.isAccessible
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                    )}
                  >
                    {phase.isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : phase.isAccessible ? (
                      index + 1
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        Phase {index + 1}: {phase.title}
                      </h3>
                      <div className="flex items-center gap-1 text-purple-500">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {phase.xpReward} XP
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {phase.description}
                    </p>

                    {/* Progress Bar */}
                    {isEnrolled && phase.isAccessible && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500 dark:text-gray-400">
                            {phase.progress.completed}/{phase.progress.total}{" "}
                            lessons
                          </span>
                          <span>
                            {phase.progress.total > 0
                              ? Math.round(
                                  (phase.progress.completed /
                                    phase.progress.total) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{
                              width: `${
                                phase.progress.total > 0
                                  ? (phase.progress.completed /
                                      phase.progress.total) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Lessons */}
                    {phase.isAccessible && (
                      <div className="grid gap-2">
                        {phase.lessons.map((lesson) => (
                          <Link
                            key={lesson.id}
                            href={`/academy/${pathId}/${phase.id}/${lesson.id}`}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-colors",
                              lesson.isCompleted
                                ? "bg-green-50 dark:bg-green-900/20"
                                : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            <span className="text-lg">
                              {lessonTypeIcons[lesson.type] || "📄"}
                            </span>
                            <span className="flex-1 text-sm">
                              {lesson.title}
                            </span>
                            {lesson.isCompleted ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Deliverable */}
                    {phase.deliverable && phase.isAccessible && (
                      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-1">
                          Phase Deliverable
                        </h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          {phase.deliverable}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
