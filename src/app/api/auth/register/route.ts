import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/auth";
import { generateId } from "@/lib/utils";

interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, username, displayName } = body;

    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error: "Username must be 3-20 characters and can only contain letters, numbers, _ and -",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ success: false, error: passwordError }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: "This username is already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        displayName: displayName || username,
        passwordHash,
        preferences: {
          create: {
            language: "en",
            theme: "system",
            preferredLanguages: ["javascript", "python"],
            emailNotifications: true,
            showHints: true,
          },
        },
        stats: {
          create: {
            totalXp: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            challengesSolved: 0,
            projectsCompleted: 0,
            bugsFixed: 0,
            lessonsCompleted: 0,
            totalTimeSpent: 0,
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    // Create email verification token
    const verificationToken = generateId(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: verificationToken,
        expires,
      },
    });

    // TODO: Send verification email
    // await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          message:
            "Account created successfully. Please check your email to verify your account.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
