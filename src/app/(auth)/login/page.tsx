import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { AuthLayout } from "@/components/layout";
import { Spinner } from "@/components/ui";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account to continue your coding journey"
    >
      <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
