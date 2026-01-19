"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  GitBranch,
  Star,
  Lock,
  Globe,
  RefreshCw,
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  ArrowLeft,
  ExternalLink,
  FileCode,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  extension?: string;
  language?: string;
}

interface Analysis {
  id: string;
  architecture: string | null;
  frameworks: string[];
  patterns: string[];
  buildSystem: string | null;
  summary: string | null;
  entryPoints: string[];
}

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
  syncedAt: string | null;
  analyzedAt: string | null;
  fileCount: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const fileIconColors: Record<string, string> = {
  ts: "text-blue-500",
  tsx: "text-blue-500",
  js: "text-yellow-500",
  jsx: "text-yellow-500",
  py: "text-green-500",
  rs: "text-orange-500",
  go: "text-cyan-500",
  java: "text-red-500",
  rb: "text-red-400",
  php: "text-purple-500",
  json: "text-yellow-600",
  md: "text-gray-500",
  css: "text-pink-500",
  html: "text-orange-400",
};

function FileTreeNode({
  node,
  depth = 0,
  selectedPath,
  onSelect,
  expandedPaths,
  onToggle,
}: {
  node: FileNode;
  depth?: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === "directory";
  const extension = node.extension || node.name.split(".").pop() || "";
  const iconColor = fileIconColors[extension] || "text-gray-400";

  return (
    <div>
      <button
        onClick={() => {
          if (isDirectory) {
            onToggle(node.path);
          } else {
            onSelect(node.path);
          }
        }}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left",
          isSelected && "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-500 shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileCode className={cn("h-4 w-4 shrink-0", iconColor)} />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RepositoryExplorerPage() {
  const params = useParams();
  const repoId = params.repoId as string;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileAnalysis, setFileAnalysis] = useState<{
    purpose: string | null;
    summary: string | null;
  } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isExplainingFile, setIsExplainingFile] = useState(false);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchRepository = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analyze/${repoId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch repository");
      }

      setRepository(data.repository);
      setFileTree(data.fileTree);
      setAnalysis(data.analysis);

      // Auto-expand first level directories
      const firstLevel = new Set<string>();
      data.fileTree.forEach((node: FileNode) => {
        if (node.type === "directory") {
          firstLevel.add(node.path);
        }
      });
      setExpandedPaths(firstLevel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    fetchRepository();
  }, [fetchRepository]);

  const handleSelectFile = async (path: string) => {
    setSelectedFile(path);
    setFileContent(null);
    setFileAnalysis(null);
    setIsLoadingFile(true);

    try {
      const response = await fetch(`/api/analyze/${repoId}/files/${path}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch file");
      }

      setFileContent(data.file.content);
      if (data.analysis) {
        setFileAnalysis({
          purpose: data.analysis.purpose,
          summary: data.analysis.summary,
        });
      }
    } catch (err) {
      console.error("Failed to fetch file:", err);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleExplainFile = async () => {
    if (!selectedFile) return;

    setIsExplainingFile(true);

    try {
      const response = await fetch(`/api/analyze/${repoId}/files/${selectedFile}`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to explain file");
      }

      setFileAnalysis({
        purpose: data.analysis.purpose,
        summary: data.analysis.summary,
      });
    } catch (err) {
      console.error("Failed to explain file:", err);
    } finally {
      setIsExplainingFile(false);
    }
  };

  const handleToggleFolder = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/analyze/${repoId}/sync`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync");
      }

      // Refresh repository data
      await fetchRepository();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/analyze/${repoId}/analyze`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to analyze");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsSendingChat(true);

    try {
      const response = await fetch(`/api/analyze/${repoId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatInput,
          contextType: selectedFile ? "file" : "repository",
          contextPath: selectedFile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setChatMessages((prev) => [...prev, data.message]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <h3 className="font-semibold">Error loading repository</h3>
            <p>{error || "Repository not found"}</p>
          </div>
        </div>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 mt-4 text-purple-500 hover:text-purple-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to repositories
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/analyze"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{repository.name}</h1>
                {repository.isPrivate ? (
                  <Lock className="h-4 w-4 text-gray-400" />
                ) : (
                  <Globe className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {repository.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mr-4">
              {repository.language && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  {repository.language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {repository.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                {repository.defaultBranch}
              </span>
              <span>{repository.fileCount} files</span>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              Sync
            </button>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Analyze
            </button>

            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Files
            </h2>
          </div>
          <div className="py-2">
            {fileTree.map((node) => (
              <FileTreeNode
                key={node.path}
                node={node}
                selectedPath={selectedFile}
                onSelect={handleSelectFile}
                expandedPaths={expandedPaths}
                onToggle={handleToggleFolder}
              />
            ))}
          </div>
        </div>

        {/* File Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              {/* File Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{selectedFile}</span>
                </div>
                <button
                  onClick={handleExplainFile}
                  disabled={isExplainingFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                >
                  {isExplainingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Explain
                </button>
              </div>

              {/* File Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingFile ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <div className="flex">
                    {/* Code */}
                    <div className="flex-1 overflow-x-auto">
                      <pre className="p-4 text-sm font-mono bg-gray-50 dark:bg-gray-900 min-h-full">
                        <code>{fileContent}</code>
                      </pre>
                    </div>

                    {/* File Analysis Panel */}
                    {fileAnalysis && (
                      <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          AI Analysis
                        </h3>
                        {fileAnalysis.purpose && (
                          <div className="mb-4">
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                              Purpose
                            </h4>
                            <p className="text-sm">{fileAnalysis.purpose}</p>
                          </div>
                        )}
                        {fileAnalysis.summary && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                              Summary
                            </h4>
                            <p className="text-sm whitespace-pre-wrap">
                              {fileAnalysis.summary}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Welcome/Analysis View */
            <div className="flex-1 p-6 overflow-y-auto">
              {analysis ? (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Repository Analysis
                    </h2>

                    {analysis.summary && (
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {analysis.summary}
                      </p>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      {analysis.architecture && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Architecture
                          </h3>
                          <p className="font-semibold">{analysis.architecture}</p>
                        </div>
                      )}

                      {analysis.buildSystem && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Build System
                          </h3>
                          <p className="font-semibold">{analysis.buildSystem}</p>
                        </div>
                      )}

                      {analysis.frameworks.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Frameworks
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {analysis.frameworks.map((fw) => (
                              <span
                                key={fw}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded"
                              >
                                {fw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.patterns.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Patterns
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {analysis.patterns.map((pattern) => (
                              <span
                                key={pattern}
                                className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded"
                              >
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {analysis.entryPoints.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Entry Points
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.entryPoints.map((entry) => (
                            <button
                              key={entry}
                              onClick={() => handleSelectFile(entry)}
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            >
                              {entry}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {repository.description && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Description
                      </h3>
                      <p>{repository.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <File className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Select a file to view</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Browse the file tree on the left to explore the codebase
                  </p>
                  {!analysis && (
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Analyze Repository
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "fixed bottom-4 right-4 p-3 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all z-40",
          isChatOpen && "hidden"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Ask about the code</h3>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Context */}
          {selectedFile && (
            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-sm text-purple-700 dark:text-purple-300">
              Discussing: {selectedFile}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Ask questions about the repository or the currently selected file
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] p-3 rounded-lg",
                  msg.role === "user"
                    ? "ml-auto bg-purple-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {isSendingChat && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isSendingChat}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSendingChat}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
