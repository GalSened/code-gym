import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/db";
import { verifyPassword } from "./password";
import { authConfig } from "./config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // TODO: Re-enable email verification once email sending is implemented
        // if (!user.emailVerified) {
        //   throw new Error("Please verify your email before signing in");
        // }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.username,
          image: user.avatarUrl,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // For OAuth providers, create/update user preferences and stats if needed
      if (account?.provider !== "credentials" && user.id) {
        const existingPrefs = await prisma.userPreferences.findUnique({
          where: { userId: user.id },
        });

        if (!existingPrefs) {
          await prisma.userPreferences.create({
            data: {
              userId: user.id,
              language: "en",
              theme: "system",
              preferredLanguages: ["javascript", "python"],
              emailNotifications: true,
              showHints: true,
            },
          });
        }

        const existingStats = await prisma.userStats.findUnique({
          where: { userId: user.id },
        });

        if (!existingStats) {
          await prisma.userStats.create({
            data: {
              userId: user.id,
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
          });
        }
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Create default preferences and stats for new users (OAuth)
      if (user.id) {
        // Generate username for OAuth users from email
        let username = user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_-]/g, "") || `user_${user.id.slice(0, 8)}`;

        // Ensure username is unique by appending random suffix if needed
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser && existingUser.id !== user.id) {
          username = `${username}_${Math.random().toString(36).slice(2, 6)}`;
        }

        // Update user with generated username and copy name/image to app fields
        await prisma.user.update({
          where: { id: user.id },
          data: {
            username,
            displayName: user.name || username,
            avatarUrl: user.image,
          },
        });

        await prisma.userPreferences.create({
          data: {
            userId: user.id,
            language: "en",
            theme: "system",
            preferredLanguages: ["javascript", "python"],
            emailNotifications: true,
            showHints: true,
          },
        });

        await prisma.userStats.create({
          data: {
            userId: user.id,
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
        });
      }
    },
  },
});

// Re-export password utilities
export { hashPassword, verifyPassword, validatePassword } from "./password";
