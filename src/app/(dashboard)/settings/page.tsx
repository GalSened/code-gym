import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/layout";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get or create user preferences
  let preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  });

  if (!preferences) {
    preferences = await prisma.userPreferences.create({
      data: {
        userId: session.user.id,
      },
    });
  }

  return (
    <DashboardLayout
      user={session.user}
      pageTitle="Settings"
      pageDescription="Manage your account preferences"
    >
      <SettingsForm
        initialValues={{
          theme: preferences.theme,
          language: preferences.language,
          preferredLanguages: preferences.preferredLanguages,
          emailNotifications: preferences.emailNotifications,
          showHints: preferences.showHints,
          dailyGoal: preferences.dailyGoal,
        }}
      />
    </DashboardLayout>
  );
}
