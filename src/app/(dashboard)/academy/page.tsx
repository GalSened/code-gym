"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  Zap,
  ChevronRight,
  BookOpen,
  Target,
  Search,
  Loader2,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  phaseCount: number;
  lessonCount: number;
  progress: {
    completed: number;
    total: number;
    percentage: number;
    completedPhases: number;
  };
  isEnrolled: boolean;
  isCompleted: boolean;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function AcademyPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const fetchPaths = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (difficultyFilter !== "all") {
        params.set("difficulty", difficultyFilter);
      }

      const response = await fetch(`/api/academy?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch learning paths");
      }

      setPaths(data.paths);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [difficultyFilter]);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const filteredPaths = paths.filter((path) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        path.title.toLowerCase().includes(query) ||
        path.description.toLowerCase().includes(query) ||
        path.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
            <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold">Academy</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Master full-stack development with structured 7-phase learning paths
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search paths or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredPaths.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No learning paths found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery
              ? "Try adjusting your search query"
              : "Check back later for new learning paths"}
          </p>
        </div>
      )}

      {/* Path Cards */}
      {!isLoading && !error && filteredPaths.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPaths.map((path) => (
            <Link
              key={path.id}
              href={`/academy/${path.id}`}
              className="block group"
            >
              <div className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200 overflow-hidden">
                {/* Preview Image */}
                {path.previewImage && (
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                    <GraduationCap className="h-16 w-16 text-white/50" />
                  </div>
                )}
                {!path.previewImage && (
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                    <GraduationCap className="h-16 w-16 text-white/50" />
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">
                        {path.title}
                      </h3>
                      <span
                        className={cn(
                          "inline-block px-2 py-1 text-xs font-medium rounded-full mt-1",
                          difficultyColors[path.difficulty] ||
                            "bg-gray-100 text-gray-700"
                        )}
                      >
                        {path.difficulty.charAt(0).toUpperCase() +
                          path.difficulty.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-500">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">{path.totalXp} XP</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {path.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{path.phaseCount} phases</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{path.lessonCount} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{path.estimatedHours}h</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {path.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {path.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        +{path.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  {path.isEnrolled && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress
                        </span>
                        <span className="font-medium">
                          {path.progress.percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${path.progress.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {path.progress.completed}/{path.progress.total} lessons
                        completed
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        path.isCompleted
                          ? "text-green-500"
                          : path.isEnrolled
                          ? "text-purple-500"
                          : "text-gray-500"
                      )}
                    >
                      {path.isCompleted
                        ? "Completed"
                        : path.isEnrolled
                        ? "Continue Learning"
                        : "Start Learning"}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
