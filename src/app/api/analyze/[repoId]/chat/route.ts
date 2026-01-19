import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  getGitHubToken,
  getFileContent,
  decodeFileContent,
} from "@/lib/services/github";
import { chatAboutRepo, ChatMessage } from "@/lib/services/ai-analyzer";

interface RouteParams {
  params: Promise<{ repoId: string }>;
}

// GET /api/analyze/[repoId]/chat - Get chat history
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;
    const { searchParams } = new URL(request.url);
    const contextType = searchParams.get("contextType") || "repository";
    const contextPath = searchParams.get("contextPath");

    // Verify repository access
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

    // Get conversation
    const conversation = await prisma.analyzeConversation.findFirst({
      where: {
        userId: session.user.id,
        repositoryId: repoId,
        contextType,
        contextPath: contextPath || null,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      conversation: conversation
        ? {
            id: conversation.id,
            contextType: conversation.contextType,
            contextPath: conversation.contextPath,
            messages: conversation.messages,
            createdAt: conversation.createdAt.toISOString(),
            updatedAt: conversation.updatedAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

// POST /api/analyze/[repoId]/chat - Send a message
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;
    const body = await request.json();
    const { message, contextType = "repository", contextPath } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get repository with analysis
    const repository = await prisma.repository.findUnique({
      where: {
        id: repoId,
        userId: session.user.id,
      },
      include: {
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        files: {
          select: { path: true },
          take: 100,
        },
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // Get or create conversation
    let conversation = await prisma.analyzeConversation.findFirst({
      where: {
        userId: session.user.id,
        repositoryId: repoId,
        contextType,
        contextPath: contextPath || null,
      },
    });

    const existingMessages = (conversation?.messages as unknown as ChatMessage[]) || [];

    // Get file content if viewing a specific file
    let currentFile: { path: string; content: string } | undefined;
    if (contextType === "file" && contextPath) {
      try {
        const token = await getGitHubToken(session.user.id);
        const [owner = "", repo = ""] = repository.fullName.split("/");
        const fileContent = await getFileContent(owner, repo, contextPath, token);
        if (fileContent) {
          currentFile = {
            path: contextPath,
            content: decodeFileContent(fileContent.content, fileContent.encoding),
          };
        }
      } catch {
        // Continue without file content
      }
    }

    // Build context for AI
    const latestAnalysis = repository.analyses[0];
    const analysisContext = latestAnalysis
      ? `Architecture: ${latestAnalysis.architecture || "Unknown"}
Frameworks: ${latestAnalysis.frameworks?.join(", ") || "None detected"}
Patterns: ${latestAnalysis.patterns?.join(", ") || "None detected"}
Summary: ${latestAnalysis.summary || "No summary available"}`
      : undefined;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };

    // Generate AI response
    const aiResponse = await chatAboutRepo(
      [...existingMessages.slice(-10), userMessage], // Keep last 10 messages for context
      {
        repoName: repository.fullName,
        repoDescription: repository.description || undefined,
        currentFile,
        repoStructure: repository.files.map((f) => f.path),
        analysisContext,
      }
    );

    // Create assistant message
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: aiResponse,
    };

    // Update or create conversation
    const newMessages = [...existingMessages, userMessage, assistantMessage];

    if (conversation) {
      await prisma.analyzeConversation.update({
        where: { id: conversation.id },
        data: {
          messages: newMessages as unknown as Prisma.InputJsonValue,
        },
      });
    } else {
      conversation = await prisma.analyzeConversation.create({
        data: {
          userId: session.user.id,
          repositoryId: repoId,
          contextType,
          contextPath: contextPath || null,
          messages: newMessages as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        role: "assistant",
        content: aiResponse,
      },
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Chat error:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

// DELETE /api/analyze/[repoId]/chat - Clear chat history
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;
    const { searchParams } = new URL(request.url);
    const contextType = searchParams.get("contextType");
    const contextPath = searchParams.get("contextPath");

    // Verify repository access
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

    // Build where clause
    const where: {
      userId: string;
      repositoryId: string;
      contextType?: string;
      contextPath?: string | null;
    } = {
      userId: session.user.id,
      repositoryId: repoId,
    };

    if (contextType) {
      where.contextType = contextType;
      where.contextPath = contextPath || null;
    }

    // Delete conversation(s)
    await prisma.analyzeConversation.deleteMany({ where });

    return NextResponse.json({
      success: true,
      message: "Chat history cleared",
    });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    );
  }
}
