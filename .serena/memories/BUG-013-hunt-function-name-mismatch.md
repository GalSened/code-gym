# BUG-013: Hunt Tests Expect Wrong Function Name

**Severity:** High
**Feature:** Hunt (Bug Fixing)
**Status:** Confirmed

## Description
Hunt tests expect the function to be named `solution()`, but the buggy starter code uses different function names (e.g., `sumArray`). This causes all tests to fail with "solution is not defined" even if the fix is correct.

## Steps to Reproduce
1. Navigate to any Hunt bug (e.g., `/hunt/cmkjxzs4z000ko6itlberan83` - Off-by-One Loop Error)
2. Note the buggy code has function named `sumArray`
3. Fix the bug in the code
4. Click "Run Tests"
5. **Actual Result:** Tests fail with "solution is not defined"
6. **Expected Result:** Tests should call the actual function name from the code

## Test Output Example
```
0/3 tests passed
Test 1: Failed
  Input: [1, 2, 3, 4, 5]
  Expected: 15
  Got: Execution service error: {"message":"Requests limited to 1 per 200ms"}

Test 2: Failed  
  Input: [10]
  Expected: 10
  Got: Execution service error: {"message":"Requests limited to 1 per 200ms"}

Test 3: Failed
  Input: []
  Expected: 0
  Got: solution is not defined
```

## Root Cause
The test harness for Hunt bugs is hardcoded to call `solution()` but the starter code uses meaningful function names like `sumArray`, `isEven`, etc.

## Potential Fixes
1. Update test harness to call the actual function name from the starter code
2. Rename all starter code functions to `solution`
3. Add a wrapper that maps `solution` to the actual function name
4. Store the function name in the bug metadata and use it in tests
