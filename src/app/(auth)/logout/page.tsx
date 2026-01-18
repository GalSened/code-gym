import { LogoutContent } from "./logout-content";
import { AuthLayout } from "@/components/layout";

export default function LogoutPage() {
  return (
    <AuthLayout
      title="Signing out..."
      description="Please wait while we sign you out"
    >
      <LogoutContent />
    </AuthLayout>
  );
}
