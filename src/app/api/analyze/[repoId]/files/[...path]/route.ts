import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getGitHubToken,
  getFileContent,
  decodeFileContent,
} from "@/lib/services/github";
import { explainFile } from "@/lib/services/ai-analyzer";

interface RouteParams {
  params: Promise<{ repoId: string; path: string[] }>;
}

// GET /api/analyze/[repoId]/files/[...path] - Get file content
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId, path } = await params;
    const filePath = path.join("/");

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

    // Get file record
    const fileRecord = await prisma.repositoryFile.findUnique({
      where: {
        repositoryId_path: {
          repositoryId: repoId,
          path: filePath,
        },
      },
      include: {
        analysis: true,
        symbols: {
          orderBy: {
            startLine: "asc",
          },
        },
      },
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get GitHub token and fetch content
    const token = await getGitHubToken(session.user.id);
    const [owner = "", repo = ""] = repository.fullName.split("/");

    const content = await getFileContent(owner, repo, filePath, token);

    if (!content) {
      return NextResponse.json(
        { error: "Failed to fetch file content" },
        { status: 404 }
      );
    }

    const decodedContent = decodeFileContent(content.content, content.encoding);

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        path: fileRecord.path,
        name: fileRecord.name,
        extension: fileRecord.extension,
        directory: fileRecord.directory,
        size: content.size,
        language: fileRecord.language,
        content: decodedContent,
      },
      analysis: fileRecord.analysis
        ? {
            id: fileRecord.analysis.id,
            purpose: fileRecord.analysis.purpose,
            layer: fileRecord.analysis.layer,
            summary: fileRecord.analysis.summary,
            exports: fileRecord.analysis.exports,
            imports: fileRecord.analysis.imports,
          }
        : null,
      symbols: fileRecord.symbols.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        signature: s.signature,
        startLine: s.startLine,
        endLine: s.endLine,
        explanation: s.explanation,
        isExported: s.isExported,
      })),
    });
  } catch (error) {
    console.error("Get file content error:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch file content" },
      { status: 500 }
    );
  }
}

// POST /api/analyze/[repoId]/files/[...path] - Generate explanation for file
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId, path } = await params;
    const filePath = path.join("/");

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

    // Get file record
    const fileRecord = await prisma.repositoryFile.findUnique({
      where: {
        repositoryId_path: {
          repositoryId: repoId,
          path: filePath,
        },
      },
      include: {
        analysis: true,
      },
    });

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Return cached analysis if available
    if (fileRecord.analysis) {
      return NextResponse.json({
        success: true,
        analysis: {
          id: fileRecord.analysis.id,
          purpose: fileRecord.analysis.purpose,
          layer: fileRecord.analysis.layer,
          summary: fileRecord.analysis.summary,
          exports: fileRecord.analysis.exports,
          imports: fileRecord.analysis.imports,
        },
        cached: true,
      });
    }

    // Fetch file content
    const token = await getGitHubToken(session.user.id);
    const [owner = "", repo = ""] = repository.fullName.split("/");

    const content = await getFileContent(owner, repo, filePath, token);

    if (!content) {
      return NextResponse.json(
        { error: "Failed to fetch file content" },
        { status: 404 }
      );
    }

    const decodedContent = decodeFileContent(content.content, content.encoding);

    // Generate AI explanation
    const explanation = await explainFile(
      decodedContent,
      filePath,
      repository.description || undefined
    );

    // Save analysis
    const analysis = await prisma.fileAnalysis.create({
      data: {
        fileId: fileRecord.id,
        purpose: explanation.purpose,
        layer: explanation.layer,
        summary: explanation.summary,
        exports: explanation.exports,
        imports: explanation.imports,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        purpose: analysis.purpose,
        layer: analysis.layer,
        summary: analysis.summary,
        exports: analysis.exports,
        imports: analysis.imports,
      },
      cached: false,
    });
  } catch (error) {
    console.error("Explain file error:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
