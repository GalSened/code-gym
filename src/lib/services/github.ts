import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/db";

// Types for GitHub API responses
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  private: boolean;
  owner: {
    login: string;
  };
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: string;
}

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  fullName: string;
}

/**
 * Parse a GitHub URL to extract owner and repo
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - github.com/owner/repo
 * - owner/repo
 */
export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
  // Remove trailing .git if present
  const cleanUrl = url.trim().replace(/\.git$/, "");

  // Try different patterns
  const patterns = [
    /^(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)\/?$/,
    /^([^/]+)\/([^/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1] && match[2]) {
      const owner = match[1];
      const repo = match[2];
      return {
        owner,
        repo,
        fullName: `${owner}/${repo}`,
      };
    }
  }

  return null;
}

/**
 * Get GitHub OAuth token for a user from the Account table
 */
export async function getGitHubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "github",
    },
    select: {
      access_token: true,
    },
  });

  return account?.access_token || null;
}

/**
 * Create an authenticated Octokit instance
 * Falls back to unauthenticated if no token provided (for public repos)
 */
export function createOctokit(token?: string | null): Octokit {
  return new Octokit({
    auth: token || undefined,
  });
}

/**
 * Fetch repository metadata from GitHub
 */
export async function getRepository(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubRepository> {
  const octokit = createOctokit(token);

  const { data } = await octokit.repos.get({
    owner,
    repo,
  });

  return {
    id: data.id,
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    html_url: data.html_url,
    default_branch: data.default_branch,
    language: data.language,
    stargazers_count: data.stargazers_count,
    private: data.private,
    owner: {
      login: data.owner.login,
    },
  };
}

/**
 * Fetch repository languages with byte counts
 */
export async function getRepositoryLanguages(
  owner: string,
  repo: string,
  token?: string | null
): Promise<Record<string, number>> {
  const octokit = createOctokit(token);

  const { data } = await octokit.repos.listLanguages({
    owner,
    repo,
  });

  return data;
}

/**
 * Fetch the complete file tree for a repository
 */
export async function getRepositoryTree(
  owner: string,
  repo: string,
  branch: string,
  token?: string | null
): Promise<GitHubTreeItem[]> {
  const octokit = createOctokit(token);

  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true",
  });

  return data.tree.map((item) => ({
    path: item.path || "",
    mode: item.mode || "",
    type: item.type as "blob" | "tree",
    sha: item.sha || "",
    size: item.size,
    url: item.url || "",
  }));
}

/**
 * Fetch content of a single file
 */
export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string | null
): Promise<GitHubFileContent | null> {
  const octokit = createOctokit(token);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    // getContent can return an array for directories
    if (Array.isArray(data)) {
      return null;
    }

    if (data.type !== "file") {
      return null;
    }

    return {
      name: data.name,
      path: data.path,
      sha: data.sha,
      size: data.size,
      content: data.content || "",
      encoding: data.encoding || "base64",
    };
  } catch (error) {
    console.error(`Failed to fetch file content for ${path}:`, error);
    return null;
  }
}

/**
 * Decode base64 file content from GitHub
 */
export function decodeFileContent(content: string, encoding: string): string {
  if (encoding === "base64") {
    return Buffer.from(content, "base64").toString("utf-8");
  }
  return content;
}

/**
 * Get file extension from path
 */
export function getFileExtension(path: string): string | null {
  const parts = path.split(".");
  if (parts.length > 1) {
    const ext = parts[parts.length - 1];
    return ext ? ext.toLowerCase() : null;
  }
  return null;
}

/**
 * Get directory from path
 */
export function getDirectory(path: string): string {
  const parts = path.split("/");
  if (parts.length > 1) {
    return parts.slice(0, -1).join("/");
  }
  return "";
}

/**
 * Get filename from path
 */
export function getFileName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

/**
 * Detect programming language from file extension
 */
export function detectLanguage(extension: string | null): string | null {
  if (!extension) return null;

  const languageMap: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    py: "Python",
    rb: "Ruby",
    java: "Java",
    go: "Go",
    rs: "Rust",
    cpp: "C++",
    c: "C",
    cs: "C#",
    php: "PHP",
    swift: "Swift",
    kt: "Kotlin",
    scala: "Scala",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    less: "LESS",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    md: "Markdown",
    sql: "SQL",
    sh: "Shell",
    bash: "Shell",
    zsh: "Shell",
  };

  return languageMap[extension] || null;
}

/**
 * Filter tree items to only include relevant code files
 */
export function filterCodeFiles(tree: GitHubTreeItem[]): GitHubTreeItem[] {
  // Extensions to include
  const codeExtensions = new Set([
    "ts",
    "tsx",
    "js",
    "jsx",
    "py",
    "rb",
    "java",
    "go",
    "rs",
    "cpp",
    "c",
    "h",
    "hpp",
    "cs",
    "php",
    "swift",
    "kt",
    "scala",
    "html",
    "css",
    "scss",
    "less",
    "json",
    "yaml",
    "yml",
    "md",
    "sql",
    "sh",
    "bash",
    "vue",
    "svelte",
  ]);

  // Directories to exclude
  const excludeDirs = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    ".nuxt",
    "__pycache__",
    "venv",
    ".venv",
    "vendor",
    "target",
    ".idea",
    ".vscode",
  ]);

  return tree.filter((item) => {
    if (item.type !== "blob") return false;

    // Check if path contains excluded directory
    const pathParts = item.path.split("/");
    for (const part of pathParts) {
      if (excludeDirs.has(part)) return false;
    }

    // Check extension
    const ext = getFileExtension(item.path);
    if (!ext) return false;

    return codeExtensions.has(ext);
  });
}

/**
 * Check if user has access to a repository
 */
export async function checkRepositoryAccess(
  owner: string,
  repo: string,
  token?: string | null
): Promise<{ hasAccess: boolean; isPrivate: boolean }> {
  const octokit = createOctokit(token);

  try {
    const { data } = await octokit.repos.get({
      owner,
      repo,
    });

    return {
      hasAccess: true,
      isPrivate: data.private,
    };
  } catch {
    // 404 means no access or doesn't exist
    return {
      hasAccess: false,
      isPrivate: false,
    };
  }
}
