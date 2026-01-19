"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";

export function LogoutContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const performSignOut = async () => {
      try {
        // Clear the session
        await signOut({ redirect: false });

        // Refresh the router cache to clear any stale session data
        router.refresh();

        // Small delay to ensure session is fully cleared before redirect
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Navigate to login page
        router.push("/login");
      } catch {
        setError("Failed to sign out. Please try again.");
        setIsLoading(false);
      }
    };

    performSignOut();
  }, [router]);

  if (error) {
    return (
      <div className="text-center">
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
        <Button
          onClick={async () => {
            setError(null);
            setIsLoading(true);
            try {
              await signOut({ redirect: false });
              router.refresh();
              await new Promise((resolve) => setTimeout(resolve, 100));
              router.push("/login");
            } catch {
              setError("Failed to sign out. Please try again.");
              setIsLoading(false);
            }
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {isLoading && (
        <>
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Signing you out...
          </p>
        </>
      )}
    </div>
  );
}
