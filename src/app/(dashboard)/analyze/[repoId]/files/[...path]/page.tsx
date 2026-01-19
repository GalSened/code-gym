"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileCode,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileData {
  id: string;
  path: string;
  name: string;
  extension: string | null;
  directory: string;
  size: number;
  language: string | null;
  content: string;
}

interface FileAnalysisData {
  id: string;
  purpose: string | null;
  layer: string | null;
  summary: string | null;
  exports: string[] | null;
  imports: string[] | null;
}

interface Symbol {
  id: string;
  name: string;
  type: string;
  signature: string | null;
  startLine: number;
  endLine: number;
  explanation: string | null;
  isExported: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const languageLabels: Record<string, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  rust: "Rust",
  go: "Go",
  java: "Java",
  ruby: "Ruby",
  php: "PHP",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  markdown: "Markdown",
  yaml: "YAML",
};

const symbolTypeIcons: Record<string, string> = {
  function: "ƒ",
  class: "C",
  interface: "I",
  type: "T",
  constant: "K",
  variable: "V",
};

const symbolTypeColors: Record<string, string> = {
  function: "text-purple-500",
  class: "text-yellow-500",
  interface: "text-blue-500",
  type: "text-green-500",
  constant: "text-orange-500",
  variable: "text-gray-500",
};

export default function FileViewerPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const filePath = (params.path as string[]).join("/");

  const [file, setFile] = useState<FileData | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysisData | null>(null);
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isExplaining, setIsExplaining] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const fetchFile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analyze/${repoId}/files/${filePath}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch file");
      }

      setFile(data.file);
      setAnalysis(data.analysis);
      setSymbols(data.symbols || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [repoId, filePath]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(
          `/api/analyze/${repoId}/chat?contextType=file&contextPath=${encodeURIComponent(filePath)}`
        );
        const data = await response.json();
        if (data.conversation?.messages) {
          setChatMessages(data.conversation.messages);
        }
      } catch {
        // Ignore errors for chat history
      }
    };
    loadChatHistory();
  }, [repoId, filePath]);

  const handleExplain = async () => {
    setIsExplaining(true);
    try {
      const response = await fetch(`/api/analyze/${repoId}/files/${filePath}`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to explain file");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to explain file");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCopy = async () => {
    if (!file?.content) return;
    await navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          contextType: "file",
          contextPath: filePath,
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

  const scrollToLine = (line: number) => {
    const lineElement = document.querySelector(`[data-line="${line}"]`);
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
      lineElement.classList.add("bg-yellow-100", "dark:bg-yellow-900/30");
      setTimeout(() => {
        lineElement.classList.remove("bg-yellow-100", "dark:bg-yellow-900/30");
      }, 2000);
    }
  };

  // Build breadcrumb path
  const pathParts = filePath.split("/");
  const breadcrumbs = pathParts.map((part, index) => ({
    name: part,
    path: pathParts.slice(0, index + 1).join("/"),
    isLast: index === pathParts.length - 1,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <h3 className="font-semibold">Error loading file</h3>
            <p>{error || "File not found"}</p>
          </div>
        </div>
        <Link
          href={`/analyze/${repoId}`}
          className="inline-flex items-center gap-2 mt-4 text-purple-500 hover:text-purple-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to repository
        </Link>
      </div>
    );
  }

  const lines = file.content.split("\n");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/analyze/${repoId}`}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb.path} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                    )}
                    {crumb.isLast ? (
                      <span className="font-medium flex items-center gap-1.5">
                        <FileCode className="h-4 w-4 text-blue-500" />
                        {crumb.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        {crumb.name}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {file.language && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                  {languageLabels[file.language] || file.language}
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {lines.length} lines
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </span>

              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Copy content"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={handleExplain}
                disabled={isExplaining}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isExplaining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Explain
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Code View */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <tbody>
                    {lines.map((line, index) => (
                      <tr
                        key={index}
                        data-line={index + 1}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-0.5 text-right text-gray-400 dark:text-gray-500 select-none border-r border-gray-200 dark:border-gray-700 w-12">
                          {index + 1}
                        </td>
                        <td className="px-4 py-0.5 whitespace-pre">
                          {line || " "}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 shrink-0 space-y-6">
            {/* Analysis Panel */}
            {analysis ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI Analysis
                </h3>

                {analysis.purpose && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Purpose
                    </h4>
                    <p className="text-sm">{analysis.purpose}</p>
                  </div>
                )}

                {analysis.layer && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Layer
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded">
                      {analysis.layer}
                    </span>
                  </div>
                )}

                {analysis.summary && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Summary
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{analysis.summary}</p>
                  </div>
                )}

                {analysis.exports && analysis.exports.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Exports
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.exports.map((exp) => (
                        <span
                          key={exp}
                          className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.imports && analysis.imports.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Imports
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.imports.slice(0, 10).map((imp) => (
                        <span
                          key={imp}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                        >
                          {imp}
                        </span>
                      ))}
                      {analysis.imports.length > 10 && (
                        <span className="px-2 py-0.5 text-gray-500 text-xs">
                          +{analysis.imports.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No analysis yet. Click Explain to generate AI insights.
                </p>
                <button
                  onClick={handleExplain}
                  disabled={isExplaining}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isExplaining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate Analysis
                </button>
              </div>
            )}

            {/* Symbols Panel */}
            {symbols.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold mb-3">Symbols</h3>
                <div className="space-y-1">
                  {symbols.map((symbol) => (
                    <button
                      key={symbol.id}
                      onClick={() => scrollToLine(symbol.startLine)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <span
                        className={cn(
                          "w-5 h-5 flex items-center justify-center text-xs font-bold rounded",
                          symbolTypeColors[symbol.type] || "text-gray-500"
                        )}
                      >
                        {symbolTypeIcons[symbol.type] || "?"}
                      </span>
                      <span className="truncate flex-1">{symbol.name}</span>
                      {symbol.isExported && (
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-400">
                        L{symbol.startLine}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Ask about this file</h3>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* File Context */}
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            {file.name}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Ask questions about this file&apos;s code, logic, or purpose
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
          <form
            onSubmit={handleSendChat}
            className="p-4 border-t border-gray-200 dark:border-gray-700"
          >
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
