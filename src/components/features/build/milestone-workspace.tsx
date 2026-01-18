"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, Badge, Card, CardContent, Spinner } from "@/components/ui";
import { CodeEditor } from "@/components/features/code-editor";

interface LatestSubmission {
  id: string;
  files: Record<string, string>;
  status: string;
  feedback: string | null;
  aiReview: string | null;
  createdAt: string;
}

interface MilestoneWorkspaceProps {
  projectId: string;
  milestoneId: string;
  instructions: string;
  requirements: string[];
  starterFiles: Record<string, string>;
  isCompleted: boolean;
  latestSubmission: LatestSubmission | null;
}

interface SubmitResult {
  success: boolean;
  status: string;
  feedback?: string;
  aiReview?: string;
  xpAwarded?: number;
  error?: string;
}

export function MilestoneWorkspace({
  projectId,
  milestoneId,
  instructions,
  requirements,
  starterFiles,
  isCompleted,
  latestSubmission,
}: MilestoneWorkspaceProps) {
  const router = useRouter();

  // Initialize files from latest submission or starter files
  const initialFiles = latestSubmission?.files || starterFiles;
  const fileNames = Object.keys(initialFiles);

  // State
  const [files, setFiles] = React.useState<Record<string, string>>(initialFiles);
  const [activeFile, setActiveFile] = React.useState(fileNames[0] || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitResult, setSubmitResult] = React.useState<SubmitResult | null>(null);
  const [activeTab, setActiveTab] = React.useState<"instructions" | "feedback">("instructions");
  const [checkedRequirements, setCheckedRequirements] = React.useState<Set<number>>(new Set());

  // Update file content
  const handleFileChange = (content: string) => {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: content,
    }));
  };

  // Reset files to starter code
  const handleReset = () => {
    setFiles(starterFiles);
    setSubmitResult(null);
    setCheckedRequirements(new Set());
  };

  // Toggle requirement checkbox
  const toggleRequirement = (index: number) => {
    setCheckedRequirements((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Submit milestone
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch(
        `/api/build/${projectId}/milestones/${milestoneId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSubmitResult({
          success: false,
          status: "error",
          error: data.error || "Failed to submit milestone",
        });
        return;
      }

      setSubmitResult({
        success: true,
        status: data.status,
        feedback: data.feedback,
        aiReview: data.aiReview,
        xpAwarded: data.xpAwarded,
      });

      // Switch to feedback tab
      setActiveTab("feedback");

      // Refresh page if passed
      if (data.status === "passed") {
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        status: "error",
        error: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get file language from extension
  const getLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rs: "rust",
      rb: "ruby",
      php: "php",
      cs: "csharp",
      swift: "swift",
      kt: "kotlin",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      sql: "sql",
      sh: "shell",
      yaml: "yaml",
      yml: "yaml",
    };
    return languageMap[ext || ""] || "plaintext";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Instructions & Requirements */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("instructions")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "instructions"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            Instructions
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "feedback"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            Feedback
            {submitResult?.status === "passed" && (
              <span className="ml-1 text-green-500">✓</span>
            )}
          </button>
        </div>

        {/* Instructions Tab */}
        {activeTab === "instructions" && (
          <Card>
            <CardContent className="py-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Instructions
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div
                  className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: instructions.replace(/\n/g, "<br />") }}
                />
              </div>

              {/* Requirements Checklist */}
              {requirements.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Requirements Checklist
                  </h4>
                  <ul className="space-y-2">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <button
                          onClick={() => toggleRequirement(index)}
                          className={cn(
                            "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                            checkedRequirements.has(index)
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                          )}
                        >
                          {checkedRequirements.has(index) && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                        <span
                          className={cn(
                            "text-sm",
                            checkedRequirements.has(index)
                              ? "text-gray-400 line-through"
                              : "text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {req}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-gray-500">
                    {checkedRequirements.size}/{requirements.length} requirements completed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <Card>
            <CardContent className="py-4">
              {submitResult ? (
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-medium text-gray-900 dark:text-white">Status:</span>
                    <Badge
                      variant={
                        submitResult.status === "passed"
                          ? "easy"
                          : submitResult.status === "needs_revision"
                          ? "medium"
                          : "hard"
                      }
                      className={
                        submitResult.status === "passed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : submitResult.status === "needs_revision"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }
                    >
                      {submitResult.status === "passed"
                        ? "Passed"
                        : submitResult.status === "needs_revision"
                        ? "Needs Revision"
                        : submitResult.status === "error"
                        ? "Error"
                        : "Failed"}
                    </Badge>
                    {submitResult.xpAwarded && submitResult.xpAwarded > 0 && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{submitResult.xpAwarded} XP
                      </span>
                    )}
                  </div>

                  {/* Error Message */}
                  {submitResult.error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {submitResult.error}
                      </p>
                    </div>
                  )}

                  {/* AI Review */}
                  {submitResult.aiReview && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        AI Review
                      </h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {submitResult.aiReview}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {submitResult.feedback && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Feedback
                      </h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {submitResult.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : latestSubmission ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Previous Submission:
                    </span>
                    <Badge
                      variant={latestSubmission.status === "passed" ? "easy" : "medium"}
                      className={
                        latestSubmission.status === "passed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }
                    >
                      {latestSubmission.status === "passed" ? "Passed" : "Needs Revision"}
                    </Badge>
                  </div>

                  {latestSubmission.aiReview && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        AI Review
                      </h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {latestSubmission.aiReview}
                        </p>
                      </div>
                    </div>
                  )}

                  {latestSubmission.feedback && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Feedback
                      </h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {latestSubmission.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    No submissions yet. Complete the requirements and submit your code.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Panel - Code Editor */}
      <div className="space-y-4">
        {/* File Tabs */}
        {fileNames.length > 1 && (
          <div className="flex gap-1 overflow-x-auto pb-2">
            {fileNames.map((filename) => (
              <button
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors whitespace-nowrap",
                  activeFile === filename
                    ? "bg-gray-800 text-white border-gray-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {filename}
              </button>
            ))}
          </div>
        )}

        {/* Editor */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {activeFile && (
              <CodeEditor
                value={files[activeFile] || ""}
                onChange={handleFileChange}
                language={getLanguage(activeFile)}
                height="400px"
                readOnly={isCompleted}
              />
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={isSubmitting || isCompleted}
          >
            Reset to Starter
          </Button>

          <div className="flex items-center gap-3">
            {isCompleted && (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Milestone Completed
              </span>
            )}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || isCompleted}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : isCompleted ? (
                "Completed"
              ) : (
                "Submit Milestone"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
