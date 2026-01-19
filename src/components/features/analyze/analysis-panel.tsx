"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepositoryAnalysis {
  id: string;
  architecture: string | null;
  frameworks: string[];
  patterns: string[];
  buildSystem: string | null;
  summary: string | null;
  entryPoints: string[];
}

interface FileAnalysis {
  id: string;
  purpose: string | null;
  layer: string | null;
  summary: string | null;
  exports: string[] | null;
  imports: string[] | null;
}

interface AnalysisPanelProps {
  type: "repository" | "file";
  analysis: RepositoryAnalysis | FileAnalysis | null;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
  onSelectEntryPoint?: (path: string) => void;
  className?: string;
}

function isRepositoryAnalysis(
  analysis: RepositoryAnalysis | FileAnalysis
): analysis is RepositoryAnalysis {
  return "architecture" in analysis || "frameworks" in analysis;
}

export function AnalysisPanel({
  type,
  analysis,
  isAnalyzing = false,
  onAnalyze,
  onSelectEntryPoint,
  className,
}: AnalysisPanelProps) {
  if (!analysis) {
    return (
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center",
          className
        )}
      >
        <Sparkles className="h-8 w-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {type === "repository"
            ? "No analysis yet. Click Analyze to generate AI insights."
            : "No analysis yet. Click Explain to generate AI insights."}
        </p>
        {onAnalyze && (
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {type === "repository" ? "Analyze Repository" : "Generate Analysis"}
          </button>
        )}
      </div>
    );
  }

  // Repository Analysis
  if (type === "repository" && isRepositoryAnalysis(analysis)) {
    return (
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6",
          className
        )}
      >
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

        {analysis.entryPoints.length > 0 && onSelectEntryPoint && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Entry Points
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.entryPoints.map((entry) => (
                <button
                  key={entry}
                  onClick={() => onSelectEntryPoint(entry)}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // File Analysis
  const fileAnalysis = analysis as FileAnalysis;
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4",
        className
      )}
    >
      <h3 className="font-semibold mb-4 flex items-center gap-2">
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

      {fileAnalysis.layer && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
            Layer
          </h4>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded">
            {fileAnalysis.layer}
          </span>
        </div>
      )}

      {fileAnalysis.summary && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
            Summary
          </h4>
          <p className="text-sm whitespace-pre-wrap">{fileAnalysis.summary}</p>
        </div>
      )}

      {fileAnalysis.exports && fileAnalysis.exports.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
            Exports
          </h4>
          <div className="flex flex-wrap gap-1">
            {fileAnalysis.exports.map((exp) => (
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

      {fileAnalysis.imports && fileAnalysis.imports.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
            Imports
          </h4>
          <div className="flex flex-wrap gap-1">
            {fileAnalysis.imports.slice(0, 10).map((imp) => (
              <span
                key={imp}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
              >
                {imp}
              </span>
            ))}
            {fileAnalysis.imports.length > 10 && (
              <span className="px-2 py-0.5 text-gray-500 text-xs">
                +{fileAnalysis.imports.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
