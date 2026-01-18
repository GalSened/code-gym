// Challenge-related types

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface TestResult {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
  executionTime?: number;
  isHidden?: boolean;
}

export interface RunResult {
  success: boolean;
  results: TestResult[];
  summary: {
    passed: number;
    total: number;
    allPassed: boolean;
  };
}

export interface SubmitResult {
  success: boolean;
  submission: {
    id: string;
    status: string;
    testsPassed: number;
    testsTotal: number;
    executionTime: number;
  };
  results: TestResult[];
  summary: {
    passed: number;
    total: number;
    allPassed: boolean;
    xpAwarded: number;
    alreadySolved: boolean;
  };
}
