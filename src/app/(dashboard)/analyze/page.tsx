"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  GitBranch,
  Star,
  Lock,
  Globe,
  RefreshCw,
  Trash2,
  Plus,
  Loader2,
  FolderGit2,
  AlertCircle,
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
  languages: Record<string, number> | null;
  stars: number;
  isPrivate: boolean;
  status: string;
  syncedAt: string | null;
  analyzedAt: string | null;
  createdAt: string;
  fileCount: number;
  hasAnalysis: boolean;
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

export default function AnalyzePage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRepositories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/analyze");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch repositories");
      }

      setRepositories(data.repositories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!importUrl.trim()) {
      setImportError("Please enter a GitHub URL");
      return;
    }

    try {
      setIsImporting(true);
      setImportError(null);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import repository");
      }

      // Add new repository to list
      setRepositories((prev) => [data.repository, ...prev]);
      setImportUrl("");
      setShowImportForm(false);

      // Trigger sync for the new repository
      fetch(`/api/analyze/${data.repository.id}/sync`, { method: "POST" });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (repoId: string) => {
    if (!confirm("Are you sure you want to remove this repository?")) {
      return;
    }

    try {
      setDeletingId(repoId);

      const response = await fetch(`/api/analyze/${repoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete repository");
      }

      setRepositories((prev) => prev.filter((r) => r.id !== repoId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSync = async (repoId: string) => {
    try {
      // Update status locally
      setRepositories((prev) =>
        prev.map((r) => (r.id === repoId ? { ...r, status: "syncing" } : r))
      );

      const response = await fetch(`/api/analyze/${repoId}/sync`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync");
      }

      // Update with new data
      setRepositories((prev) =>
        prev.map((r) =>
          r.id === repoId
            ? {
                ...r,
                status: "ready",
                syncedAt: data.stats.syncedAt,
                fileCount: data.stats.totalFiles,
              }
            : r
        )
      );
    } catch (err) {
      setRepositories((prev) =>
        prev.map((r) => (r.id === repoId ? { ...r, status: "error" } : r))
      );
      alert(err instanceof Error ? err.message : "Failed to sync");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analyze</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect GitHub repositories and turn them into interactive learning resources
          </p>
        </div>

        <button
          onClick={() => setShowImportForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Import Repository
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Import Form Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Import Repository</h2>

            <form onSubmit={handleImport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isImporting}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter the URL of a public repository, or connect GitHub for private repos
                </p>
              </div>

              {importError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {importError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportForm(false);
                    setImportUrl("");
                    setImportError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isImporting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <GitBranch className="h-4 w-4" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {repositories.length === 0 && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FolderGit2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No repositories yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Import a GitHub repository to start analyzing code and learning from real projects
          </p>
          <button
            onClick={() => setShowImportForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Import Your First Repository
          </button>
        </div>
      )}

      {/* Repository Grid */}
      {repositories.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {repo.isPrivate ? (
                    <Lock className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Globe className="h-4 w-4 text-gray-400" />
                  )}
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      statusColors[repo.status]
                    )}
                  >
                    {repo.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSync(repo.id)}
                    className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors"
                    title="Sync"
                    disabled={repo.status === "syncing"}
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        repo.status === "syncing" && "animate-spin"
                      )}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(repo.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                    disabled={deletingId === repo.id}
                  >
                    {deletingId === repo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Link href={`/analyze/${repo.id}`}>
                <h3 className="font-semibold text-lg mb-1 hover:text-purple-500 transition-colors">
                  {repo.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {repo.fullName}
              </p>

              {repo.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {repo.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {repo.language && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-3 h-3 rounded-full",
                        languageColors[repo.language] || "bg-gray-400"
                      )}
                    />
                    <span>{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{repo.stars.toLocaleString()}</span>
                </div>
                {repo.fileCount > 0 && (
                  <span>{repo.fileCount} files</span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {repo.hasAnalysis ? (
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
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Link
                    href={`/analyze/${repo.id}`}
                    className="text-purple-500 hover:text-purple-600 font-medium text-sm"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
