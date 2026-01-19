# BUG-012: Language Switch Doesn't Update Editor Code

**Severity:** Medium
**Feature:** Mastery (Code Editor)
**Status:** Confirmed

## Description
When switching programming languages in the Mastery challenge editor, the editor content does not update to the new language's starter code. The old code remains in the editor.

## Steps to Reproduce
1. Navigate to any Mastery challenge (e.g., `/mastery/cmkjxzpq00000o6itcxjnm857` - Two Sum)
2. Note the language selector shows "JavaScript" with JavaScript starter code
3. Change the language selector to "Python"
4. **Actual Result:** Language selector shows "Python" but editor still contains JavaScript code (`function solution(input) {`, `const`, etc.)
5. **Expected Result:** Editor should show Python starter code (`def solution(input):`, etc.)

## Impact
- Users cannot easily switch languages without manually rewriting their code
- Running JavaScript code with Python execution will fail
- Confusing UX - language says Python but code is JavaScript

## Expected Behavior Options
1. Replace editor content with the new language's starter code (with warning prompt about losing current work)
2. Attempt to convert the code to the new language
3. Store separate code versions per language

## Technical Notes
- This may be a missing API call to fetch the starter code for the new language
- May need to implement language-specific starter code templates
- Consider adding a confirmation dialog before switching languages if code has been modified
