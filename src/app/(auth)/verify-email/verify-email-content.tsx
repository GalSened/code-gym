"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout";
import { Button, Spinner } from "@/components/ui";

type VerificationStatus = "loading" | "success" | "error" | "expired";

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = React.useState<VerificationStatus>("loading");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (!response.ok) {
          if (result.error?.includes("expired")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
          setError(result.error || "Verification failed");
          return;
        }

        setStatus("success");
      } catch {
        setStatus("error");
        setError("An unexpected error occurred");
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    // This would require the user's email, which we don't have here
    // In a real app, you'd redirect to a page where they can enter their email
    window.location.href = "/login?resend=true";
  };

  if (status === "loading") {
    return (
      <AuthLayout title="Verifying your email" description="Please wait...">
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Verifying your email address...
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout
        title="Email verified!"
        description="Your email has been successfully verified"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You can now access all features of Code Gym.
          </p>

          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (status === "expired") {
    return (
      <AuthLayout
        title="Link expired"
        description="This verification link has expired"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your verification link has expired. Please request a new one.
          </p>

          <Button className="w-full" onClick={handleResendVerification}>
            Request new verification link
          </Button>

          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Error state
  return (
    <AuthLayout
      title="Verification failed"
      description="We couldn't verify your email"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {error && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        )}

        <Button className="w-full" onClick={handleResendVerification}>
          Request new verification link
        </Button>

        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
