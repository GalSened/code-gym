import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ repoId: string }>;
}

// GET /api/analyze/[repoId] - Get repository details
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;

    const repository = await prisma.repository.findUnique({
      where: {
        id: repoId,
        userId: session.user.id,
      },
      include: {
        files: {
          select: {
            id: true,
            path: true,
            name: true,
            extension: true,
            directory: true,
            size: true,
            language: true,
          },
          orderBy: {
            path: "asc",
          },
        },
        analyses: {
          select: {
            id: true,
            structure: true,
            buildSystem: true,
            frameworks: true,
            architecture: true,
            patterns: true,
            dependencies: true,
            entryPoints: true,
            summary: true,
            status: true,
            createdAt: true,
            completedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // Build file tree structure
    const fileTree = buildFileTree(repository.files);
    const latestAnalysis = repository.analyses[0] || null;

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
        syncedAt: repository.syncedAt?.toISOString() || null,
        analyzedAt: repository.analyzedAt?.toISOString() || null,
        createdAt: repository.createdAt.toISOString(),
        updatedAt: repository.updatedAt.toISOString(),
      },
      fileTree,
      fileCount: repository.files.length,
      analysis: latestAnalysis
        ? {
            id: latestAnalysis.id,
            structure: latestAnalysis.structure,
            buildSystem: latestAnalysis.buildSystem,
            frameworks: latestAnalysis.frameworks,
            architecture: latestAnalysis.architecture,
            patterns: latestAnalysis.patterns,
            dependencies: latestAnalysis.dependencies,
            entryPoints: latestAnalysis.entryPoints,
            summary: latestAnalysis.summary,
            status: latestAnalysis.status,
            createdAt: latestAnalysis.createdAt.toISOString(),
            completedAt: latestAnalysis.completedAt?.toISOString() || null,
          }
        : null,
    });
  } catch (error) {
    console.error("Get repository error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository" },
      { status: 500 }
    );
  }
}

// DELETE /api/analyze/[repoId] - Delete a repository
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;

    // Check ownership
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

    // Delete repository (cascades to files, analyses, conversations)
    await prisma.repository.delete({
      where: {
        id: repoId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Repository deleted successfully",
    });
  } catch (error) {
    console.error("Delete repository error:", error);
    return NextResponse.json(
      { error: "Failed to delete repository" },
      { status: 500 }
    );
  }
}

// Helper function to build file tree structure
interface FileInfo {
  id: string;
  path: string;
  name: string;
  extension: string | null;
  directory: string;
  size: number;
  language: string | null;
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
  file?: FileInfo;
}

function buildFileTree(files: FileInfo[]): TreeNode[] {
  const root: Map<string, TreeNode> = new Map();

  for (const file of files) {
    const parts = file.path.split("/");
    let currentPath = "";
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue; // Skip empty parts

      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!currentLevel.has(part)) {
        const node: TreeNode = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "directory",
        };

        if (isFile) {
          node.file = file;
        } else {
          node.children = [];
        }

        currentLevel.set(part, node);
      }

      if (!isFile) {
        const dirNode = currentLevel.get(part);
        if (dirNode && !dirNode.children) {
          dirNode.children = [];
        }
        // Convert children array to map for next iteration
        const childMap = new Map<string, TreeNode>();
        if (dirNode?.children) {
          for (const child of dirNode.children) {
            childMap.set(child.name, child);
          }
          // Update children array with map values
          dirNode.children = Array.from(childMap.values());
        }
        currentLevel = childMap;
      }
    }
  }

  // Convert to array and sort
  return sortTree(Array.from(root.values()));
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      children: node.children ? sortTree(node.children) : undefined,
    }))
    .sort((a, b) => {
      // Directories first
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
}
