"use client";

import Link from "next/link";
import {
  Star,
  Lock,
  Globe,
  RefreshCw,
  Trash2,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  defaultBranch: string;
  language: string | null;
  stars: number;
  isPrivate: boolean;
  status: string;
  fileCount: number;
  hasAnalysis: boolean;
}

interface RepositoryCardProps {
  repository: Repository;
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  syncing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ready: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  Java: "bg-red-500",
  Ruby: "bg-red-400",
  PHP: "bg-purple-500",
};

export function RepositoryCard({
  repository,
  onSync,
  onDelete,
  isDeleting = false,
}: RepositoryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {repository.isPrivate ? (
            <Lock className="h-4 w-4 text-gray-400" />
          ) : (
            <Globe className="h-4 w-4 text-gray-400" />
          )}
          <span
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              statusColors[repository.status]
            )}
          >
            {repository.status}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSync(repository.id)}
            className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors"
            title="Sync"
            disabled={repository.status === "syncing"}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                repository.status === "syncing" && "animate-spin"
              )}
            />
          </button>
          <button
            onClick={() => onDelete(repository.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Link href={`/analyze/${repository.id}`}>
        <h3 className="font-semibold text-lg mb-1 hover:text-purple-500 transition-colors">
          {repository.name}
        </h3>
      </Link>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {repository.fullName}
      </p>

      {repository.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {repository.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        {repository.language && (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "w-3 h-3 rounded-full",
                languageColors[repository.language] || "bg-gray-400"
              )}
            />
            <span>{repository.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          <span>{repository.stars.toLocaleString()}</span>
        </div>
        {repository.fileCount > 0 && <span>{repository.fileCount} files</span>}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {repository.hasAnalysis ? (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Analyzed
            </span>
          ) : (
            <span className="text-gray-500">Not analyzed</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <Link
            href={`/analyze/${repository.id}`}
            className="text-purple-500 hover:text-purple-600 font-medium text-sm"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
