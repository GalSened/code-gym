import { LoginForm } from "./login-form";
import { AuthLayout } from "@/components/layout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account to continue your coding journey"
    >
      <LoginForm />
    </AuthLayout>
  );
}
