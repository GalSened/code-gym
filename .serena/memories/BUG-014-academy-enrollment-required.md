# BUG-014: Academy lesson completion fails - not enrolled

## Severity
High

## Component
Academy feature - Lesson completion

## Description
Users can view Academy lesson content but clicking "Mark as Complete" fails with a 403 Forbidden error and displays "Not enrolled in this learning path" message.

## Steps to Reproduce
1. Navigate to `/academy`
2. Click on "Full Stack Fundamentals" learning path
3. Click on any lesson (e.g., "Introduction to Web Development")
4. View the full lesson content (content is visible and readable)
5. Click "Mark as Complete" button
6. Observe error

## Expected Behavior
Either:
- Users should not be able to view lesson content without enrolling first, OR
- Users should be able to mark lessons as complete if they can access the content, OR
- A clear "Enroll" prompt should be shown before accessing lessons

## Actual Behavior
- Lesson content is fully visible and accessible
- Clicking "Mark as Complete" triggers 403 Forbidden error
- Page displays "Not enrolled in this learning path" message
- No enrollment prompt is shown when accessing lesson

## Console Error
```
Failed to load resource: the server responded with a status of 403 (Forbidden) @ http://localhost:3000/api/academy/[pathId]/phases/[phaseId]/lessons/[lessonId]
```

## Root Cause Analysis
The API endpoint for marking lessons complete requires enrollment, but the lesson content page doesn't check enrollment before displaying content. There's a mismatch between read access (allowed) and write access (requires enrollment).

## Files to Investigate
- `src/app/(dashboard)/academy/[pathId]/[phaseId]/[lessonId]/page.tsx` - Lesson page
- `src/app/api/academy/[pathId]/phases/[phaseId]/lessons/[lessonId]/route.ts` - Lesson API
- Enrollment logic and middleware

## Suggested Fix
1. Check enrollment status when loading lesson page
2. Either redirect to enrollment page OR show enrollment CTA if not enrolled
3. Ensure consistent access control between viewing and completing lessons

## Impact
- Users cannot progress through learning paths
- Frustrating UX - can see content but can't track progress
- Blocks Academy feature functionality

## Date Found
2026-01-19
