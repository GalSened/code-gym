"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  BookOpen,
  Code,
  HelpCircle,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CodeEditor } from "@/components/features/code-editor";

interface ExerciseData {
  instructions: string;
  starterCode: Record<string, string>;
  solution: string;
  testCases: { input: string; expectedOutput: string }[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizData {
  questions: QuizQuestion[];
}

interface LessonData {
  id: string;
  orderIndex: number;
  title: string;
  type: string;
  content: string;
  xpReward: number;
  exercise: ExerciseData | null;
  quiz: QuizData | null;
  videoUrl: string | null;
  resourceLinks: { title: string; url: string }[] | null;
}

interface NavigationData {
  lessonIndex: number;
  totalLessons: number;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string; phaseId: string } | null;
  canAccessNext: boolean;
}

interface PageData {
  path: { id: string; title: string };
  phase: { id: string; title: string; orderIndex: number };
  lesson: LessonData;
  isCompleted: boolean;
  latestSubmission: {
    id: string;
    status: string;
    score: number | null;
    feedback: string | null;
    xpAwarded: number;
    createdAt: string;
  } | null;
  navigation: NavigationData;
}

const lessonTypeIcons: Record<string, React.ReactNode> = {
  concept: <BookOpen className="h-5 w-5" />,
  exercise: <Code className="h-5 w-5" />,
  quiz: <HelpCircle className="h-5 w-5" />,
};

interface PageProps {
  params: Promise<{ pathId: string; phaseId: string; lessonId: string }>;
}

export default function LessonPage({ params }: PageProps) {
  const { pathId, phaseId, lessonId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exercise state
  const [exerciseCode, setExerciseCode] = useState("");
  const [exerciseLanguage, setExerciseLanguage] = useState("javascript");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    feedback: string;
    passed: boolean;
  } | null>(null);

  const fetchLesson = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/academy/${pathId}/phases/${phaseId}/lessons/${lessonId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch lesson");
      }

      setData(data);

      // Initialize exercise code
      if (data.lesson.exercise?.starterCode) {
        const lang = Object.keys(data.lesson.exercise.starterCode)[0] || "javascript";
        setExerciseLanguage(lang);
        setExerciseCode(data.lesson.exercise.starterCode[lang] || "");
      }

      // Initialize quiz answers
      if (data.lesson.quiz?.questions) {
        setQuizAnswers(new Array(data.lesson.quiz.questions.length).fill(-1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [pathId, phaseId, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleComplete = async (submissionData?: { code?: string; language?: string; answers?: number[] }) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/academy/${pathId}/phases/${phaseId}/lessons/${lessonId}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData || {}),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to complete lesson");
      }

      if (data?.lesson.type === "quiz") {
        setQuizSubmitted(true);
        setQuizResults({
          score: result.score || 0,
          feedback: result.feedback || "",
          passed: result.status === "passed",
        });

        if (result.status !== "passed") {
          setIsSubmitting(false);
          return;
        }
      }

      // Refresh data and navigate to next lesson
      await fetchLesson();

      if (result.status === "passed" && data?.navigation.nextLesson) {
        const nextPhaseId = data.navigation.nextLesson.phaseId || phaseId;
        router.push(
          `/academy/${pathId}/${nextPhaseId}/${data.navigation.nextLesson.id}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkComplete = () => {
    handleComplete();
  };

  const handleSubmitExercise = () => {
    handleComplete({ code: exerciseCode, language: exerciseLanguage });
  };

  const handleSubmitQuiz = () => {
    handleComplete({ answers: quizAnswers });
  };

  const handleRetryQuiz = () => {
    setQuizSubmitted(false);
    setQuizResults(null);
    setQuizAnswers(new Array(data?.lesson.quiz?.questions.length || 0).fill(-1));
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
          {error || "Failed to load lesson"}
        </div>
      </div>
    );
  }

  const { path, phase, lesson, isCompleted, navigation } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/academy/${pathId}`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {path.title} / Phase {phase.orderIndex + 1}
                </div>
                <h1 className="font-semibold">{lesson.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-purple-500">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">{lesson.xpReward} XP</span>
              </div>
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
                  isCompleted
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                )}
              >
                {lessonTypeIcons[lesson.type]}
                <span>{lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}</span>
                {isCompleted && <Check className="h-4 w-4" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Concept Lesson */}
          {lesson.type === "concept" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match;
                      return !isInline ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match![1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {lesson.content}
                </ReactMarkdown>
              </div>

              {!isCompleted && (
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleMarkComplete}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      "Mark as Complete"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Exercise Lesson */}
          {lesson.type === "exercise" && lesson.exercise && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-semibold mb-4">Instructions</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{lesson.exercise.instructions}</ReactMarkdown>
                </div>
              </div>

              {/* Code Editor */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                  <select
                    value={exerciseLanguage}
                    onChange={(e) => {
                      setExerciseLanguage(e.target.value);
                      setExerciseCode(
                        lesson.exercise?.starterCode[e.target.value] || ""
                      );
                    }}
                    className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    {Object.keys(lesson.exercise.starterCode).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-64 sm:h-80 md:h-96">
                  <CodeEditor
                    value={exerciseCode}
                    onChange={setExerciseCode}
                    language={exerciseLanguage}
                  />
                </div>
              </div>

              {!isCompleted && (
                <button
                  onClick={handleSubmitExercise}
                  disabled={isSubmitting || !exerciseCode.trim()}
                  className="w-full py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Submit Exercise"
                  )}
                </button>
              )}
            </div>
          )}

          {/* Quiz Lesson */}
          {lesson.type === "quiz" && lesson.quiz && (
            <div className="space-y-6">
              {lesson.quiz.questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h3 className="font-medium mb-4">
                    Question {qIndex + 1}: {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <label
                        key={oIndex}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          quizAnswers[qIndex] === oIndex
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
                          quizSubmitted &&
                            oIndex === question.correctIndex &&
                            "border-green-500 bg-green-50 dark:bg-green-900/20",
                          quizSubmitted &&
                            quizAnswers[qIndex] === oIndex &&
                            oIndex !== question.correctIndex &&
                            "border-red-500 bg-red-50 dark:bg-red-900/20"
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={quizAnswers[qIndex] === oIndex}
                          onChange={() => {
                            if (!quizSubmitted) {
                              const newAnswers = [...quizAnswers];
                              newAnswers[qIndex] = oIndex;
                              setQuizAnswers(newAnswers);
                            }
                          }}
                          disabled={quizSubmitted}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            quizAnswers[qIndex] === oIndex
                              ? "border-purple-500"
                              : "border-gray-300"
                          )}
                        >
                          {quizAnswers[qIndex] === oIndex && (
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                          )}
                        </div>
                        <span>{option}</span>
                        {quizSubmitted && oIndex === question.correctIndex && (
                          <Check className="h-4 w-4 text-green-500 ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>
                  {quizSubmitted && question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Quiz Results */}
              {quizResults && (
                <div
                  className={cn(
                    "p-6 rounded-xl border",
                    quizResults.passed
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  )}
                >
                  <h3
                    className={cn(
                      "font-medium mb-2",
                      quizResults.passed ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                    )}
                  >
                    {quizResults.passed ? "Congratulations!" : "Keep Trying!"}
                  </h3>
                  <p
                    className={cn(
                      "text-sm",
                      quizResults.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {quizResults.feedback}
                  </p>
                </div>
              )}

              {!isCompleted && !quizSubmitted && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || quizAnswers.includes(-1)}
                  className="w-full py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Submit Quiz"
                  )}
                </button>
              )}

              {quizSubmitted && !quizResults?.passed && (
                <button
                  onClick={handleRetryQuiz}
                  className="w-full py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            {navigation.prevLesson ? (
              <Link
                href={`/academy/${pathId}/${phaseId}/${navigation.prevLesson.id}`}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-500"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>{navigation.prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {navigation.nextLesson && isCompleted && (
              <Link
                href={`/academy/${pathId}/${navigation.nextLesson.phaseId}/${navigation.nextLesson.id}`}
                className="flex items-center gap-2 text-purple-500 hover:text-purple-600"
              >
                <span>{navigation.nextLesson.title}</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
