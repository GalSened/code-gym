import { Suspense } from "react";
import { ResetPasswordContent } from "./reset-password-content";
import { AuthLayout } from "@/components/layout";
import { Spinner } from "@/components/ui";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Reset Password" description="Loading...">
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
