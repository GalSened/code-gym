/**
 * Piston API Service for sandboxed code execution
 * https://github.com/engineer-man/piston
 */

const PISTON_API_URL = process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";

// Language mapping for Piston API
const languageConfig: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "cpp", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.68.2" },
  ruby: { language: "ruby", version: "3.0.1" },
  php: { language: "php", version: "8.2.3" },
  csharp: { language: "csharp", version: "6.12.0" },
  swift: { language: "swift", version: "5.3.3" },
  kotlin: { language: "kotlin", version: "1.8.20" },
};

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
}

export interface PistonResponse {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

/**
 * Execute code using Piston API
 */
export async function executeCode(
  code: string,
  language: string,
  input?: string,
  timeout: number = 10000
): Promise<ExecutionResult> {
  const config = languageConfig[language];

  if (!config) {
    return {
      success: false,
      output: "",
      error: `Unsupported language: ${language}`,
    };
  }

  try {
    const startTime = Date.now();

    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [
          {
            name: getFileName(language),
            content: code,
          },
        ],
        stdin: input || "",
        args: [],
        compile_timeout: timeout,
        run_timeout: timeout,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    const executionTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        output: "",
        error: `Execution service error: ${errorText}`,
        executionTime,
      };
    }

    const result: PistonResponse = await response.json();

    // Check for compilation errors
    if (result.compile && result.compile.code !== 0) {
      return {
        success: false,
        output: "",
        error: result.compile.stderr || result.compile.output || "Compilation error",
        executionTime,
      };
    }

    // Check for runtime errors
    if (result.run.code !== 0) {
      return {
        success: false,
        output: result.run.stdout,
        error: result.run.stderr || "Runtime error",
        executionTime,
      };
    }

    return {
      success: true,
      output: result.run.stdout.trim(),
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : "Unknown execution error",
    };
  }
}


/**
 * Execute multiple test cases sequentially with delays to respect API rate limits
 * The Piston API has a rate limit of 1 request per 200ms
 */
export interface TestCaseInput {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface TestResult {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
  executionTime?: number;
}

export async function executeTestsSequentially(
  code: string,
  language: string,
  testCases: TestCaseInput[],
  timeout: number = 10000
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const RATE_LIMIT_DELAY = 250; // 250ms delay to respect 200ms rate limit with margin

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    // Skip if testCase is undefined (shouldn't happen but satisfies TypeScript)
    if (!testCase) continue;

    // Add delay between requests (except for the first one)
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
    }

    // Wrap code with test harness
    const wrappedCode = wrapCodeWithTestHarness(code, language, testCase.input);

    // Execute the code
    const result = await executeCode(wrappedCode, language, undefined, timeout);

    // Compare output
    const passed = result.success && compareOutputs(testCase.expectedOutput, result.output);

    results.push({
      id: testCase.id,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: result.output,
      passed,
      error: result.error,
      executionTime: result.executionTime,
    });
  }

  return results;
}

/**
 * Get file name based on language
 */
function getFileName(language: string): string {
  const extensions: Record<string, string> = {
    javascript: "index.js",
    typescript: "index.ts",
    python: "main.py",
    java: "Main.java",
    cpp: "main.cpp",
    c: "main.c",
    go: "main.go",
    rust: "main.rs",
    ruby: "main.rb",
    php: "main.php",
    csharp: "Main.cs",
    swift: "main.swift",
    kotlin: "Main.kt",
  };

  return extensions[language] || "main.txt";
}

/**
 * Get available runtimes from Piston
 */
export async function getAvailableRuntimes(): Promise<
  { language: string; version: string; aliases: string[] }[]
> {
  try {
    const response = await fetch(`${PISTON_API_URL}/runtimes`);

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Extract the main function name from code based on language
 */
function extractFunctionName(code: string, language: string): string {
  let match: RegExpMatchArray | null = null;

  switch (language) {
    case "javascript":
    case "typescript":
      // Match: function name( or const/let/var name = or name = function(
      match = code.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\(|async))/);
      break;
    case "python":
      // Match: def name(
      match = code.match(/def\s+(\w+)\s*\(/);
      break;
    case "go":
      // Match: func name(
      match = code.match(/func\s+(\w+)\s*\(/);
      break;
    case "java":
      // Match: public static ... name(
      match = code.match(/public\s+static\s+\w+\s+(\w+)\s*\(/);
      break;
  }

  // Return the first captured group that exists
  if (match) {
    return match[1] || match[2] || "solution";
  }
  return "solution";
}

/**
 * Wrap user code with test harness based on language
 */
export function wrapCodeWithTestHarness(
  code: string,
  language: string,
  testInput: string
): string {
  // For simple test cases, we can pass input via stdin
  // The user's function should read from stdin or be called with the input

  // Extract the actual function name from the code
  const funcName = extractFunctionName(code, language);

  switch (language) {
    case "javascript":
    case "typescript":
      return `
${code}

// Test harness
const input = ${JSON.stringify(testInput)};
try {
  const result = ${funcName}(JSON.parse(input));
  console.log(JSON.stringify(result));
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
`;

    case "python":
      return `
import json
import sys

${code}

# Test harness
if __name__ == "__main__":
    input_data = ${JSON.stringify(testInput)}
    try:
        result = ${funcName}(json.loads(input_data))
        print(json.dumps(result))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
`;

    case "java":
      return `
import java.util.*;
import com.google.gson.Gson;

${code}

class Main {
    public static void main(String[] args) {
        Gson gson = new Gson();
        String input = ${JSON.stringify(testInput)};
        try {
            Object parsed = gson.fromJson(input, Object.class);
            Object result = Solution.${funcName}(parsed);
            System.out.println(gson.toJson(result));
        } catch (Exception e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }
}
`;

    case "go":
      return `
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

${code}

func main() {
    input := ${JSON.stringify(testInput)}
    var parsed interface{}
    if err := json.Unmarshal([]byte(input), &parsed); err != nil {
        fmt.Fprintln(os.Stderr, err)
        os.Exit(1)
    }
    result := ${funcName}(parsed)
    output, _ := json.Marshal(result)
    fmt.Println(string(output))
}
`;

    default:
      // For unsupported languages, return code as-is
      return code;
  }
}

/**
 * Compare outputs for test validation
 */
export function compareOutputs(expected: string, actual: string): boolean {
  // Normalize whitespace and compare
  const normalizeOutput = (s: string) =>
    s
      .trim()
      .replace(/\r\n/g, "\n")
      .replace(/\s+/g, " ")
      .toLowerCase();

  // Try direct comparison first
  if (normalizeOutput(expected) === normalizeOutput(actual)) {
    return true;
  }

  // Try JSON comparison for complex outputs
  try {
    const expectedJson = JSON.parse(expected);
    const actualJson = JSON.parse(actual);
    return JSON.stringify(expectedJson) === JSON.stringify(actualJson);
  } catch {
    // Not JSON, fall back to string comparison
    return false;
  }
}
