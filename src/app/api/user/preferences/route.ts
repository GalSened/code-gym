import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["en", "he"]).optional(),
  preferredLanguages: z.array(z.string()).optional(),
  emailNotifications: z.boolean().optional(),
  showHints: z.boolean().optional(),
  dailyGoal: z.number().min(5).max(240).optional(),
});

// GET /api/user/preferences - Get user preferences
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({
      success: true,
      preferences: {
        theme: preferences.theme,
        language: preferences.language,
        preferredLanguages: preferences.preferredLanguages,
        emailNotifications: preferences.emailNotifications,
        showHints: preferences.showHints,
        dailyGoal: preferences.dailyGoal,
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePreferencesSchema.parse(body);

    // Update or create preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        userId: session.user.id,
        ...validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        theme: preferences.theme,
        language: preferences.language,
        preferredLanguages: preferences.preferredLanguages,
        emailNotifications: preferences.emailNotifications,
        showHints: preferences.showHints,
        dailyGoal: preferences.dailyGoal,
      },
    });
  } catch (error) {
    console.error("Update preferences error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
