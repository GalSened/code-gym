import { z } from "zod";

// Profile update schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .optional()
    .nullable(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().nullable(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// User preferences schema
export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["en", "he"]),
  emailNotifications: z.boolean(),
  dailyReminders: z.boolean(),
  weeklyDigest: z.boolean(),
  achievementAlerts: z.boolean(),
  preferredDifficulty: z.enum(["easy", "medium", "hard", "all"]),
  codeEditorTheme: z.enum(["vs-dark", "light", "hc-black", "monokai"]),
  fontSize: z.number().min(10).max(24),
});

export type UpdatePreferencesFormData = z.infer<typeof updatePreferencesSchema>;

// Avatar update schema
export const updateAvatarSchema = z.object({
  image: z.string().url("Please provide a valid image URL"),
});

export type UpdateAvatarFormData = z.infer<typeof updateAvatarSchema>;
