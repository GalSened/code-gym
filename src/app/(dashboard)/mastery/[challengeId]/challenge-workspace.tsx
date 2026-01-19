"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Challenge } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button, Badge, Card, CardContent, Spinner } from "@/components/ui";
import { CodeEditor, starterCodeTemplates } from "@/components/features/code-editor";

interface ChallengeWorkspaceProps {
  challenge: Challenge;
  hasSolved: boolean;
  previousCode: string;
  previousLanguage: string;
}

type Language = "javascript" | "typescript" | "python" | "java" | "cpp" | "go" | "rust";

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  executionTime?: number;
}

interface RunResult {
  success: boolean;
  results: TestResult[];
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  error?: string;
}

const languages: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

export function ChallengeWorkspace({
  challenge,
  hasSolved,
  previousCode,
  previousLanguage,
}: ChallengeWorkspaceProps) {
  const router = useRouter();

  // State
  const [language, setLanguage] = React.useState<Language>(
    (previousLanguage as Language) || "javascript"
  );
  const [code, setCode] = React.useState(() => {
    if (previousCode) return previousCode;
    const starterCode = challenge.starterCode as Record<string, string> | null;
    const lang = (previousLanguage as Language) || "javascript";
    return starterCode?.[lang] || starterCodeTemplates[lang] || "";
  });
  const [isRunning, setIsRunning] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [runResult, setRunResult] = React.useState<RunResult | null>(null);
  const [activeTab, setActiveTab] = React.useState<"description" | "hints" | "solution">("description");
  const [hintsRevealed, setHintsRevealed] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<"description" | "code">("code");

  // Parse hints, solutions, examples, and starter code from challenge
  const hints = challenge.hints as string[] || [];
  const solutions = challenge.solutions as Record<string, string> | null;
  const examples = challenge.examples as { input: string; output: string; explanation?: string }[] || [];
  const challengeStarterCode = challenge.starterCode as Record<string, string> | null;

  // Get starter code for a language (use challenge-specific or fall back to generic template)
  const getStarterCode = (lang: Language): string => {
    return challengeStarterCode?.[lang] || starterCodeTemplates[lang] || "";
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: Language) => {
    const currentStarterCode = getStarterCode(language);
    // Update code if it matches the current starter code or is empty
    if (code === currentStarterCode || code === "" || code === starterCodeTemplates[language]) {
      setCode(getStarterCode(newLanguage));
    }
    setLanguage(newLanguage);
  };

  // Run code against visible test cases
  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);

    try {
      const response = await fetch(`/api/mastery/${challenge.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
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
      const response = await fetch(`/api/mastery/${challenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, hintsUsed: hintsRevealed }),
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

      // If passed, show success and refresh
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

  // Reveal next hint
  const revealNextHint = () => {
    if (hintsRevealed < hints.length) {
      setHintsRevealed(hintsRevealed + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Link
              href="/mastery"
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
              <span className="hidden sm:inline">Back to Challenges</span>
            </Link>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            <h1 className="font-semibold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {challenge.title}
            </h1>

            <Badge variant={challenge.difficulty as "easy" | "medium" | "hard"}>
              {challenge.difficulty}
            </Badge>

            {hasSolved && (
              <Badge variant="success">Solved</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Mobile view toggle - only visible below lg */}
      <div className="flex lg:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button
          onClick={() => setMobileView("description")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            mobileView === "description"
              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Description
        </button>
        <button
          onClick={() => setMobileView("code")}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            mobileView === "code"
              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Code Editor
        </button>
      </div>

      {/* Main content - split pane */}
      <div className="flex h-[calc(100vh-6.5rem)] lg:h-[calc(100vh-3.5rem)]">
        {/* Left pane - Problem description */}
        <div className={cn(
          "w-full lg:w-1/2 border-r border-gray-200 dark:border-gray-800 overflow-y-auto",
          mobileView === "description" ? "block" : "hidden lg:block"
        )}>
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
                Description
              </button>
              <button
                onClick={() => setActiveTab("hints")}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "hints"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                Hints ({hintsRevealed}/{hints.length})
              </button>
              {(hasSolved || showSolution) && (
                <button
                  onClick={() => setActiveTab("solution")}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === "solution"
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  )}
                >
                  Solution
                </button>
              )}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {challenge.description}
                </p>

                {/* Examples */}
                <h3 className="text-lg font-semibold mt-6 mb-4">Examples</h3>
                {examples.slice(0, 3).map((example, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Example {index + 1}
                    </p>
                    <div className="font-mono text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-500">Input:</span> {example.input}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-500">Output:</span> {example.output}
                      </p>
                      {example.explanation && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-xs">
                          {example.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Constraints */}
                {challenge.constraints && (
                  <>
                    <h3 className="text-lg font-semibold mt-6 mb-4">Constraints</h3>
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {challenge.constraints}
                    </pre>
                  </>
                )}

                {/* Reveal Solution Button (only if not solved) */}
                {!hasSolved && !showSolution && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSolution(true)}
                      className="text-gray-500"
                    >
                      Reveal Solution (forfeit XP)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "hints" && (
              <div className="space-y-4">
                {hints.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No hints available for this challenge.
                  </p>
                ) : (
                  <>
                    {hints.map((hint, index) => (
                      <div key={index}>
                        {index < hintsRevealed ? (
                          <Card>
                            <CardContent className="pt-4">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Hint {index + 1}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">{hint}</p>
                            </CardContent>
                          </Card>
                        ) : index === hintsRevealed ? (
                          <Card className="border-dashed">
                            <CardContent className="pt-4 text-center">
                              <p className="text-gray-500 dark:text-gray-400 mb-3">
                                Need help? Reveal the next hint.
                              </p>
                              <Button variant="secondary" onClick={revealNextHint}>
                                Reveal Hint {index + 1}
                              </Button>
                              <p className="text-xs text-gray-400 mt-2">
                                Using hints may reduce XP earned
                              </p>
                            </CardContent>
                          </Card>
                        ) : null}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === "solution" && solutions && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Solution ({language})
                    </h4>
                    <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
                      <code>{solutions[language] || solutions.javascript || Object.values(solutions)[0]}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Right pane - Code editor and results */}
        <div className={cn(
          "w-full lg:w-1/2 flex-col",
          mobileView === "code" ? "flex" : "hidden lg:flex"
        )}>
          {/* Code editor */}
          <div className="flex-1 p-4">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
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
                            ? "All tests passed!"
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
                            <span className="font-medium">Test {index + 1}</span>
                            <Badge variant={result.passed ? "success" : "error"}>
                              {result.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          <div className="font-mono text-xs space-y-1">
                            <p>Input: {result.input}</p>
                            <p>Expected: {result.expectedOutput}</p>
                            {!result.passed && (
                              <p className="text-red-600 dark:text-red-400">
                                Got: {result.actualOutput || result.error || "No output"}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  Run your code to see test results
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {hasSolved ? (
                  <span className="text-green-600 dark:text-green-400">
                    You&apos;ve solved this challenge!
                  </span>
                ) : (
                  <span>XP Reward: +{challenge.xpReward}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting}
                >
                  {isRunning ? <Spinner size="sm" /> : "Run Code"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
