import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ChallengeWorkspace } from "./challenge-workspace";

interface ChallengePageProps {
  params: Promise<{ challengeId: string }>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { challengeId } = await params;

  // Fetch challenge
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId, isActive: true },
  });

  if (!challenge) {
    notFound();
  }

  // Fetch user's previous submissions for this challenge
  const previousSubmissions = await prisma.challengeSubmission.findMany({
    where: {
      userId: session.user.id,
      challengeId,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Check if user has solved this challenge
  const hasSolved = previousSubmissions.some((s) => s.status === "passed");

  // Get the last submission's code if exists
  const lastCode = previousSubmissions[0]?.code || "";
  const lastLanguage = previousSubmissions[0]?.language || "javascript";

  return (
    <ChallengeWorkspace
      challenge={challenge}
      hasSolved={hasSolved}
      previousCode={lastCode}
      previousLanguage={lastLanguage}
    />
  );
}
