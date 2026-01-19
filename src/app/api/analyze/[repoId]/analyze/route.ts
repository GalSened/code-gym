import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getGitHubToken,
  getFileContent,
  decodeFileContent,
} from "@/lib/services/github";
import {
  analyzeRepository,
  detectPatterns,
  detectFrameworks,
} from "@/lib/services/ai-analyzer";

interface RouteParams {
  params: Promise<{ repoId: string }>;
}

// POST /api/analyze/[repoId]/analyze - Trigger AI analysis
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId } = await params;

    // Get repository with files
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
            size: true,
          },
          orderBy: {
            path: "asc",
          },
        },
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    if (repository.files.length === 0) {
      return NextResponse.json(
        { error: "Repository has no files. Please sync first." },
        { status: 400 }
      );
    }

    // Create analysis record
    const analysis = await prisma.repositoryAnalysis.create({
      data: {
        repositoryId: repoId,
        structure: {},
        frameworks: [],
        patterns: [],
        entryPoints: [],
        status: "pending",
      },
    });

    try {
      // Get GitHub token
      const token = await getGitHubToken(session.user.id);
      const [owner = "", repo = ""] = repository.fullName.split("/");

      // Get file tree for pattern detection
      const filePaths = repository.files.map((f) => f.path);

      // Detect patterns from structure
      const detectedPatterns = detectPatterns(filePaths);

      // Find key files to sample for analysis
      const keyFiles = findKeyFiles(repository.files);

      // Fetch content for key files
      const sampleFiles: { path: string; content: string }[] = [];
      let packageJson: Record<string, unknown> | undefined;

      for (const file of keyFiles.slice(0, 5)) {
        // Limit to 5 files
        try {
          const content = await getFileContent(owner, repo, file.path, token);
          if (content) {
            const decoded = decodeFileContent(content.content, content.encoding);
            sampleFiles.push({ path: file.path, content: decoded });

            // Parse package.json if found
            if (file.name === "package.json") {
              try {
                packageJson = JSON.parse(decoded);
              } catch {
                // Ignore parse errors
              }
            }
          }
        } catch {
          // Continue with other files if one fails
        }
      }

      // Detect frameworks
      const frameworks = detectFrameworks(filePaths, packageJson);

      // Run AI analysis
      const aiAnalysis = await analyzeRepository(filePaths, sampleFiles);

      // Determine entry points
      const entryPoints = findEntryPoints(repository.files);

      // Build structure summary
      const structure = buildStructureSummary(repository.files);

      // Extract dependencies from package.json
      const dependencies = packageJson
        ? {
            dependencies: Object.keys(
              (packageJson.dependencies as Record<string, string>) || {}
            ),
            devDependencies: Object.keys(
              (packageJson.devDependencies as Record<string, string>) || {}
            ),
          }
        : undefined;

      // Determine build system
      const buildSystem = detectBuildSystem(repository.files);

      // Update analysis record
      await prisma.repositoryAnalysis.update({
        where: { id: analysis.id },
        data: {
          structure,
          buildSystem,
          frameworks: [...new Set([...frameworks, ...aiAnalysis.frameworks])],
          architecture: aiAnalysis.architecture,
          patterns: [...new Set([...detectedPatterns, ...aiAnalysis.patterns])],
          dependencies,
          entryPoints,
          summary: aiAnalysis.summary,
          status: "completed",
          completedAt: new Date(),
        },
      });

      // Update repository
      await prisma.repository.update({
        where: { id: repoId },
        data: { analyzedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        analysis: {
          id: analysis.id,
          structure,
          buildSystem,
          frameworks: [...new Set([...frameworks, ...aiAnalysis.frameworks])],
          architecture: aiAnalysis.architecture,
          patterns: [...new Set([...detectedPatterns, ...aiAnalysis.patterns])],
          dependencies,
          entryPoints,
          summary: aiAnalysis.summary,
          status: "completed",
          layers: aiAnalysis.layers,
        },
      });
    } catch (analysisError) {
      // Update analysis status to error
      await prisma.repositoryAnalysis.update({
        where: { id: analysis.id },
        data: { status: "error" },
      });

      throw analysisError;
    }
  } catch (error) {
    console.error("Analyze repository error:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}

// Helper functions

interface FileInfo {
  id: string;
  path: string;
  name: string;
  extension: string | null;
  size: number;
}

function findKeyFiles(files: FileInfo[]): FileInfo[] {
  const keyFileNames = [
    "package.json",
    "README.md",
    "readme.md",
    "index.ts",
    "index.js",
    "main.ts",
    "main.js",
    "app.ts",
    "app.js",
    "server.ts",
    "server.js",
  ];

  const keyFiles: FileInfo[] = [];

  // Find exact matches first
  for (const fileName of keyFileNames) {
    const file = files.find((f) => f.name === fileName);
    if (file) {
      keyFiles.push(file);
    }
  }

  // Add route files (Next.js)
  const routeFiles = files.filter(
    (f) =>
      f.name === "route.ts" ||
      f.name === "route.js" ||
      f.name === "page.tsx" ||
      f.name === "page.jsx"
  );
  keyFiles.push(...routeFiles.slice(0, 3));

  // Add component files
  const componentFiles = files.filter(
    (f) =>
      f.path.includes("/components/") &&
      (f.extension === "tsx" || f.extension === "jsx")
  );
  keyFiles.push(...componentFiles.slice(0, 2));

  return keyFiles;
}

function findEntryPoints(files: FileInfo[]): string[] {
  const entryPoints: string[] = [];

  const entryPatterns = [
    /^src\/index\.(ts|js|tsx|jsx)$/,
    /^src\/main\.(ts|js|tsx|jsx)$/,
    /^src\/app\.(ts|js|tsx|jsx)$/,
    /^index\.(ts|js|tsx|jsx)$/,
    /^main\.(ts|js|tsx|jsx)$/,
    /^app\.(ts|js|tsx|jsx)$/,
    /^src\/app\/layout\.(ts|tsx)$/,
    /^src\/app\/page\.(ts|tsx)$/,
    /^pages\/_app\.(ts|tsx|js|jsx)$/,
    /^pages\/index\.(ts|tsx|js|jsx)$/,
    /^server\.(ts|js)$/,
  ];

  for (const file of files) {
    for (const pattern of entryPatterns) {
      if (pattern.test(file.path)) {
        entryPoints.push(file.path);
        break;
      }
    }
  }

  return entryPoints;
}

function buildStructureSummary(
  files: FileInfo[]
): Record<string, { count: number; extensions: string[] }> {
  const structure: Record<string, { count: number; extensions: Set<string> }> =
    {};

  for (const file of files) {
    const topDir = file.path.split("/")[0] || "root";

    if (!structure[topDir]) {
      structure[topDir] = { count: 0, extensions: new Set() };
    }

    structure[topDir].count++;
    if (file.extension) {
      structure[topDir].extensions.add(file.extension);
    }
  }

  // Convert Sets to arrays
  const result: Record<string, { count: number; extensions: string[] }> = {};
  for (const [dir, data] of Object.entries(structure)) {
    result[dir] = {
      count: data.count,
      extensions: Array.from(data.extensions),
    };
  }

  return result;
}

function detectBuildSystem(files: FileInfo[]): string | null {
  const fileNames = new Set(files.map((f) => f.name));

  if (fileNames.has("package.json")) {
    if (fileNames.has("yarn.lock")) return "yarn";
    if (fileNames.has("pnpm-lock.yaml")) return "pnpm";
    if (fileNames.has("bun.lockb")) return "bun";
    return "npm";
  }

  if (fileNames.has("Cargo.toml")) return "cargo";
  if (fileNames.has("go.mod")) return "go modules";
  if (fileNames.has("pom.xml")) return "maven";
  if (fileNames.has("build.gradle") || fileNames.has("build.gradle.kts"))
    return "gradle";
  if (fileNames.has("requirements.txt") || fileNames.has("setup.py"))
    return "pip";
  if (fileNames.has("Gemfile")) return "bundler";

  return null;
}
