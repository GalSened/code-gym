# BUG-011: Code Execution Rate Limiting Too Aggressive

**Severity:** High
**Feature:** Mastery (Code Execution)
**Status:** Confirmed

## Description
When running code tests in Mastery challenges, the code execution service has aggressive rate limiting (1 request per 200ms) that causes subsequent test cases to fail even when the solution is correct.

## Steps to Reproduce
1. Navigate to any Mastery challenge (e.g., `/mastery/cmkjxzpq00000o6itcxjnm857` - Two Sum)
2. Write a correct solution in the code editor
3. Click "Run Code"
4. **Actual Result:** First test passes, remaining tests fail with "Execution service error: Requests limited to 1 per 200ms"
5. **Expected Result:** All tests should run and pass if solution is correct

## Test Results Example
```
1/3 tests passed
Test 1: Passed
  Input: [[2,7,11,15], 9]
  Expected: [0,1]

Test 2: Failed
  Input: [[3,2,4], 6]
  Expected: [1,2]
  Got: Execution service error: {"message":"Requests limited to 1 per 200ms"}

Test 3: Failed
  Input: [[3,3], 6]
  Expected: [0,1]
  Got: Execution service error: {"message":"Requests limited to 1 per 200ms"}
```

## Impact
- Users cannot validate their solutions properly
- May lead to frustration and incorrect feedback about solution correctness
- Submission may fail even with correct solutions

## Root Cause
The code execution service (likely Piston or similar) has rate limiting configured at 1 request per 200ms. When running multiple test cases in quick succession, subsequent requests are rejected.

## Potential Fixes
1. Batch all test cases into a single execution request
2. Add delay between test case executions (200ms+ between each)
3. Increase rate limit on the execution service
4. Queue test executions and retry failed ones after delay
5. Run all tests in a single code execution with test harness
