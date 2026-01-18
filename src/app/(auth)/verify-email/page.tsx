import { Suspense } from "react";
import { VerifyEmailContent } from "./verify-email-content";
import { AuthLayout } from "@/components/layout";
import { Spinner } from "@/components/ui";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Verifying your email" description="Please wait...">
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </AuthLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
