import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  parseGitHubUrl,
  getGitHubToken,
  getRepository,
  getRepositoryLanguages,
  checkRepositoryAccess,
} from "@/lib/services/github";

// GET /api/analyze - List user's repositories
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            files: true,
            analyses: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      repositories: repositories.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        url: repo.url,
        description: repo.description,
        defaultBranch: repo.defaultBranch,
        language: repo.language,
        languages: repo.languages,
        stars: repo.stars,
        isPrivate: repo.isPrivate,
        status: repo.status,
        syncedAt: repo.syncedAt?.toISOString() || null,
        analyzedAt: repo.analyzedAt?.toISOString() || null,
        createdAt: repo.createdAt.toISOString(),
        fileCount: repo._count.files,
        hasAnalysis: repo._count.analyses > 0,
      })),
    });
  } catch (error) {
    console.error("Get repositories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}

// POST /api/analyze - Import a new repository
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "GitHub URL is required" },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Use format: https://github.com/owner/repo" },
        { status: 400 }
      );
    }

    // Check if repository already imported
    const existing = await prisma.repository.findUnique({
      where: {
        userId_fullName: {
          userId: session.user.id,
          fullName: parsed.fullName,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Repository already imported", repositoryId: existing.id },
        { status: 409 }
      );
    }

    // Get GitHub token for private repos
    const token = await getGitHubToken(session.user.id);

    // Check if user has access to the repository
    const access = await checkRepositoryAccess(parsed.owner, parsed.repo, token);

    if (!access.hasAccess) {
      return NextResponse.json(
        {
          error: access.isPrivate
            ? "Cannot access private repository. Please connect your GitHub account."
            : "Repository not found or inaccessible",
        },
        { status: 404 }
      );
    }

    // Fetch repository metadata
    const repoData = await getRepository(parsed.owner, parsed.repo, token);
    const languages = await getRepositoryLanguages(parsed.owner, parsed.repo, token);

    // Create repository record
    const repository = await prisma.repository.create({
      data: {
        userId: session.user.id,
        name: repoData.name,
        fullName: repoData.full_name,
        url: repoData.html_url,
        description: repoData.description,
        defaultBranch: repoData.default_branch,
        language: repoData.language,
        languages: languages,
        stars: repoData.stargazers_count,
        isPrivate: repoData.private,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      repository: {
        id: repository.id,
        name: repository.name,
        fullName: repository.fullName,
        url: repository.url,
        description: repository.description,
        defaultBranch: repository.defaultBranch,
        language: repository.language,
        languages: repository.languages,
        stars: repository.stars,
        isPrivate: repository.isPrivate,
        status: repository.status,
      },
    });
  } catch (error) {
    console.error("Import repository error:", error);

    // Handle specific GitHub API errors
    if (error instanceof Error) {
      if (error.message.includes("Not Found")) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to import repository" },
      { status: 500 }
    );
  }
}
