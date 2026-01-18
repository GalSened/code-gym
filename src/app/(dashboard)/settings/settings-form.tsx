"use client";

import * as React from "react";
import { z } from "zod";
import { Form, FormSelect, FormCheckbox } from "@/components/forms";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@/components/ui";

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "he"]),
  preferredLanguages: z.array(z.string()),
  emailNotifications: z.boolean(),
  showHints: z.boolean(),
  dailyGoal: z.number().min(5).max(240),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialValues: SettingsFormData;
}

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "he", label: "Hebrew" },
];

const dailyGoalOptions = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const programmingLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
];

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(
    initialValues.preferredLanguages
  );

  const handleSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          preferredLanguages: selectedLanguages,
          dailyGoal: Number(data.dailyGoal),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }

      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <Form
        schema={settingsSchema}
        defaultValues={{
          ...initialValues,
          dailyGoal: initialValues.dailyGoal,
        }}
        onSubmit={handleSubmit}
      >
        {({ formState }) => (
          <>
            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how Code Gym looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormSelect
                  name="theme"
                  label="Theme"
                  options={themeOptions}
                  helperText="Choose your preferred color scheme"
                />
                <FormSelect
                  name="language"
                  label="Language"
                  options={languageOptions}
                  helperText="Select your preferred language"
                />
              </CardContent>
            </Card>

            {/* Coding Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Coding Preferences</CardTitle>
                <CardDescription>
                  Configure your coding environment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Programming Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {programmingLanguages.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => toggleLanguage(lang.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedLanguages.includes(lang.value)
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    Select the languages you want to practice
                  </p>
                </div>

                <FormSelect
                  name="dailyGoal"
                  label="Daily Practice Goal"
                  options={dailyGoalOptions}
                  helperText="Set your daily coding goal"
                />

                <FormCheckbox
                  name="showHints"
                  label="Show Hints"
                  description="Display hints when solving challenges"
                />
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormCheckbox
                  name="emailNotifications"
                  label="Email Notifications"
                  description="Receive emails about your progress and new challenges"
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || !formState.isDirty}
                className="min-w-[120px]"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
