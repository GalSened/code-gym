"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, Badge, Card, CardContent, Spinner } from "@/components/ui";
import { CodeEditor } from "@/components/features/code-editor";

interface BugData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  type: string;
  language: string;
  buggyCode: string;
  hint: string | null;
  explanation: string | null;
  xpReward: number;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
  }>;
  totalTestCases: number;
}

interface LatestSubmission {
  id: string;
  status: string;
  fixedCode: string;
  createdAt: string;
}

interface BugWorkspaceProps {
  bug: BugData;
  hasSolved: boolean;
  latestSubmission: LatestSubmission | null;
}

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  executionTime?: number;
  isHidden?: boolean;
}

interface RunResult {
  success: boolean;
  results: TestResult[];
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  xpAwarded?: number;
  error?: string;
}

const typeColors: Record<string, string> = {
  logic: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  performance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  security: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  edge_case: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const typeLabels: Record<string, string> = {
  logic: "Logic",
  performance: "Performance",
  security: "Security",
  edge_case: "Edge Case",
};

export function BugWorkspace({
  bug,
  hasSolved,
  latestSubmission,
}: BugWorkspaceProps) {
  const router = useRouter();

  // State
  const [code, setCode] = React.useState(
    latestSubmission?.fixedCode || bug.buggyCode
  );
  const [isRunning, setIsRunning] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [runResult, setRunResult] = React.useState<RunResult | null>(null);
  const [activeTab, setActiveTab] = React.useState<"description" | "hint" | "explanation">("description");
  const [showHint, setShowHint] = React.useState(false);

  // Reset code to buggy version
  const handleReset = () => {
    setCode(bug.buggyCode);
    setRunResult(null);
  };

  // Run code against visible test cases
  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);

    try {
      const response = await fetch(`/api/hunt/${bug.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: bug.language }),
      });

      const result = await response.json();

      if (!response.ok) {
        setRunResult({
          success: false,
          results: [],
          allPassed: false,
          passedCount: 0,
          totalCount: 0,
          error: result.error || "Failed to run code",
        });
        return;
      }

      setRunResult(result);
    } catch {
      setRunResult({
        success: false,
        results: [],
        allPassed: false,
        passedCount: 0,
        totalCount: 0,
        error: "Network error. Please try again.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code for full evaluation
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setRunResult(null);

    try {
      const response = await fetch(`/api/hunt/${bug.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: bug.language }),
      });

      const result = await response.json();

      if (!response.ok) {
        setRunResult({
          success: false,
          results: [],
          allPassed: false,
          passedCount: 0,
          totalCount: 0,
          error: result.error || "Failed to submit code",
        });
        return;
      }

      setRunResult(result);

      // If passed, refresh to show explanation
      if (result.allPassed) {
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch {
      setRunResult({
        success: false,
        results: [],
        allPassed: false,
        passedCount: 0,
        totalCount: 0,
        error: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Link
              href="/hunt"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Back to Hunt</span>
            </Link>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            <h1 className="font-semibold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {bug.title}
            </h1>

            <Badge variant={bug.difficulty as "easy" | "medium" | "hard"}>
              {bug.difficulty}
            </Badge>

            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[bug.type]}`}>
              {typeLabels[bug.type] || bug.type}
            </span>

            {hasSolved && (
              <Badge variant="success">Fixed</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default">{bug.language}</Badge>
          </div>
        </div>
      </header>

      {/* Main content - split pane */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left pane - Bug description */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          {/* Tabs */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex">
              <button
                onClick={() => setActiveTab("description")}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "description"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Bug Description
              </button>
              <button
                onClick={() => setActiveTab("hint")}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "hint"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Hint
              </button>
              {hasSolved && bug.explanation && (
                <button
                  onClick={() => setActiveTab("explanation")}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "explanation"
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                >
                  Explanation
                </button>
              )}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {bug.description}
                </p>

                {/* Test Cases */}
                <h3 className="text-lg font-semibold mt-6 mb-4">Test Cases</h3>
                <div className="space-y-3">
                  {bug.testCases.map((tc, index) => (
                    <div
                      key={tc.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Test Case {index + 1}
                      </p>
                      <div className="font-mono text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="text-gray-500">Input:</span> {tc.input}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="text-gray-500">Expected:</span> {tc.expectedOutput}
                        </p>
                      </div>
                    </div>
                  ))}
                  {bug.totalTestCases > bug.testCases.length && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      + {bug.totalTestCases - bug.testCases.length} hidden test cases
                    </p>
                  )}
                </div>

                {/* XP Reward */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">XP Reward</span>
                    <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      +{bug.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "hint" && (
              <div className="space-y-4">
                {bug.hint ? (
                  showHint ? (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-gray-700 dark:text-gray-300">{bug.hint}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="pt-4 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                          Need a hint to find the bug?
                        </p>
                        <Button variant="secondary" onClick={() => setShowHint(true)}>
                          Reveal Hint
                        </Button>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No hint available for this bug.
                  </p>
                )}
              </div>
            )}

            {activeTab === "explanation" && bug.explanation && (
              <div className="prose dark:prose-invert max-w-none">
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Bug Explanation
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {bug.explanation}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Right pane - Code editor and results */}
        <div className="w-1/2 flex flex-col">
          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Buggy Code - Find and fix the bug
            </span>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset Code
            </Button>
          </div>

          {/* Code editor */}
          <div className="flex-1 p-4">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={bug.language}
              height="100%"
              className="h-full"
            />
          </div>

          {/* Test results */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            {/* Results display */}
            <div className="p-4 max-h-48 overflow-y-auto">
              {runResult ? (
                <div className="space-y-2">
                  {runResult.error ? (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {runResult.error}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "p-3 rounded-lg border",
                          runResult.allPassed
                            ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
                        )}
                      >
                        <p
                          className={cn(
                            "font-medium",
                            runResult.allPassed
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {runResult.allPassed
                            ? `Bug fixed! +${runResult.xpAwarded || bug.xpReward} XP`
                            : `${runResult.passedCount}/${runResult.totalCount} tests passed`}
                        </p>
                      </div>

                      {/* Individual test results */}
                      {runResult.results.map((result, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 rounded-lg border text-sm",
                            result.passed
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              Test {index + 1}
                              {result.isHidden && " (Hidden)"}
                            </span>
                            <Badge variant={result.passed ? "success" : "error"}>
                              {result.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          {!result.isHidden && (
                            <div className="font-mono text-xs space-y-1">
                              <p>Input: {result.input}</p>
                              <p>Expected: {result.expectedOutput}</p>
                              {!result.passed && (
                                <p className="text-red-600 dark:text-red-400">
                                  Got: {result.actualOutput || result.error || "No output"}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  Run your code to test if the bug is fixed
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {hasSolved ? (
                  <span className="text-green-600 dark:text-green-400">
                    You&apos;ve fixed this bug!
                  </span>
                ) : (
                  <span>XP Reward: +{bug.xpReward}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting}
                >
                  {isRunning ? <Spinner size="sm" /> : "Run Tests"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting || hasSolved}
                >
                  {isSubmitting ? <Spinner size="sm" /> : "Submit Fix"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
