import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getGitHubToken,
  getRepositoryTree,
  filterCodeFiles,
  getFileExtension,
  getDirectory,
  getFileName,
  detectLanguage,
} from "@/lib/services/github";

interface RouteParams {
  params: Promise<{ repoId: string }>;
}

// POST /api/analyze/[repoId]/sync - Sync repository files from GitHub
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;

    // Get repository
    const repository = await prisma.repository.findUnique({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // Update status to syncing
    await prisma.repository.update({
      where: { id: repoId },
      data: { status: "syncing" },
    });

    try {
      // Get GitHub token
      const token = await getGitHubToken(session.user.id);

      // Parse owner/repo from fullName
      const [owner = "", repo = ""] = repository.fullName.split("/");

      // Fetch repository tree
      const tree = await getRepositoryTree(
        owner,
        repo,
        repository.defaultBranch,
        token
      );

      // Filter to code files only
      const codeFiles = filterCodeFiles(tree);

      // Delete existing files
      await prisma.repositoryFile.deleteMany({
        where: { repositoryId: repoId },
      });

      // Create new file records
      const fileRecords = codeFiles.map((item) => ({
        repositoryId: repoId,
        path: item.path,
        name: getFileName(item.path),
        extension: getFileExtension(item.path),
        directory: getDirectory(item.path),
        size: item.size || 0,
        language: detectLanguage(getFileExtension(item.path)),
        contentHash: item.sha,
      }));

      // Batch insert files
      if (fileRecords.length > 0) {
        await prisma.repositoryFile.createMany({
          data: fileRecords,
        });
      }

      // Update repository status
      await prisma.repository.update({
        where: { id: repoId },
        data: {
          status: "ready",
          syncedAt: new Date(),
        },
      });

      // Get file count by language
      const languageCounts = fileRecords.reduce(
        (acc, file) => {
          if (file.language) {
            acc[file.language] = (acc[file.language] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      return NextResponse.json({
        success: true,
        message: "Repository synced successfully",
        stats: {
          totalFiles: fileRecords.length,
          languageCounts,
          syncedAt: new Date().toISOString(),
        },
      });
    } catch (syncError) {
      // Update status to error
      await prisma.repository.update({
        where: { id: repoId },
        data: { status: "error" },
      });

      throw syncError;
    }
  } catch (error) {
    console.error("Sync repository error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Not Found")) {
        return NextResponse.json(
          { error: "Repository not found on GitHub. It may have been deleted." },
          { status: 404 }
        );
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
      if (error.message.includes("Bad credentials")) {
        return NextResponse.json(
          { error: "GitHub authentication failed. Please reconnect your GitHub account." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to sync repository" },
      { status: 500 }
    );
  }
}
