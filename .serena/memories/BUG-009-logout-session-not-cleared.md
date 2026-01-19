# BUG-009: Logout Not Clearing Session

**Severity:** High
**Feature:** Authentication
**Status:** Confirmed

## Description
After logging out via the `/logout` page, the user's session is not properly invalidated. Protected routes like `/dashboard` remain accessible and display the user's data.

## Steps to Reproduce
1. Login as any user
2. Navigate to `/logout`
3. Wait for "Signing out..." and redirect to `/login`
4. Navigate to `/dashboard`
5. **Actual Result:** Dashboard loads with user data ("Welcome back, Test!")
6. **Expected Result:** Should redirect to `/login`

## Additional Observations
- Hard reload does not fix the issue
- Closing browser and reopening does not fix the issue
- Calling `/api/auth/signout` directly also does not fix the issue

## Technical Details

### Logout Implementation (`/src/app/(auth)/logout/logout-content.tsx`)
```typescript
React.useEffect(() => {
  const performSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch {
      setError("Failed to sign out. Please try again.");
      setIsLoading(false);
    }
  };
  performSignOut();
}, [router]);
```

### Auth Configuration (`/src/lib/auth/config.ts`)
- Uses JWT session strategy
- Protected routes defined in `authorized` callback

### Root Cause Analysis
The `signOut` function from `next-auth/react` is being called but the JWT session cookie is not being properly cleared. This could be due to:
1. Cookie domain/path mismatch
2. NextAuth v5 configuration issue
3. The `redirect: false` option preventing proper cookie clearing

## Potential Fixes
1. Use `signOut({ callbackUrl: "/login" })` instead of manual redirect
2. Manually clear cookies in signOut handler
3. Check NextAuth cookie configuration
4. Add a server action to clear session on server-side
