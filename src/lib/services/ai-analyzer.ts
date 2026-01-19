import Groq from "groq-sdk";

// Lazy-initialize Groq client to avoid build-time errors
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

// Default model to use
const DEFAULT_MODEL = "openai/gpt-oss-120b";

// Types for analysis results
export interface FileExplanation {
  purpose: string;
  layer: string;
  summary: string;
  exports: string[];
  imports: string[];
  keyFunctions: string[];
}

export interface SymbolExplanation {
  name: string;
  type: string;
  purpose: string;
  parameters?: string[];
  returnType?: string;
  sideEffects?: string[];
}

export interface RepositoryAnalysis {
  summary: string;
  architecture: string;
  patterns: string[];
  frameworks: string[];
  buildSystem: string | null;
  entryPoints: string[];
  layers: {
    name: string;
    description: string;
    files: string[];
  }[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Generate an explanation for a code file
 */
export async function explainFile(
  content: string,
  path: string,
  repoContext?: string
): Promise<FileExplanation> {
  const systemPrompt = `You are an expert code analyst. Analyze the given code file and provide a structured explanation.
Your response must be valid JSON with this exact structure:
{
  "purpose": "Brief description of what this file does",
  "layer": "The architectural layer (e.g., 'API Route', 'Component', 'Service', 'Utility', 'Config', 'Model', 'Hook')",
  "summary": "A 2-3 sentence summary explaining the file's role and key functionality",
  "exports": ["List of exported items"],
  "imports": ["List of key dependencies"],
  "keyFunctions": ["List of important functions/methods with brief descriptions"]
}

Be concise but informative. Focus on helping a developer understand this file quickly.`;

  const userPrompt = `Analyze this code file:

File path: ${path}
${repoContext ? `Repository context: ${repoContext}` : ""}

Code:
\`\`\`
${content.slice(0, 15000)}
\`\`\`

Provide your analysis as valid JSON.`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      purpose: "Unable to analyze file",
      layer: "Unknown",
      summary: response,
      exports: [],
      imports: [],
      keyFunctions: [],
    };
  } catch (error) {
    console.error("Error explaining file:", error);
    throw new Error("Failed to analyze file");
  }
}

/**
 * Generate an explanation for a code symbol (function, class, etc.)
 */
export async function explainSymbol(
  symbolCode: string,
  symbolName: string,
  symbolType: string,
  fileContext?: string
): Promise<SymbolExplanation> {
  const systemPrompt = `You are an expert code analyst. Analyze the given code symbol and provide a clear explanation.
Your response must be valid JSON with this exact structure:
{
  "name": "Symbol name",
  "type": "Symbol type (function, class, interface, etc.)",
  "purpose": "Clear explanation of what this symbol does and why it exists",
  "parameters": ["List of parameters with types if applicable"],
  "returnType": "Return type if applicable",
  "sideEffects": ["Any side effects like API calls, state mutations, etc."]
}

Focus on helping a developer understand this code quickly. Explain the 'why' not just the 'what'.`;

  const userPrompt = `Analyze this ${symbolType}:

Name: ${symbolName}
${fileContext ? `File context: ${fileContext}` : ""}

Code:
\`\`\`
${symbolCode.slice(0, 8000)}
\`\`\`

Provide your analysis as valid JSON.`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "";

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      name: symbolName,
      type: symbolType,
      purpose: response,
    };
  } catch (error) {
    console.error("Error explaining symbol:", error);
    throw new Error("Failed to analyze symbol");
  }
}

/**
 * Analyze repository architecture and patterns
 */
export async function analyzeRepository(
  fileTree: string[],
  sampleFiles: { path: string; content: string }[]
): Promise<RepositoryAnalysis> {
  const systemPrompt = `You are an expert software architect. Analyze the given repository structure and sample files to understand its architecture.
Your response must be valid JSON with this exact structure:
{
  "summary": "2-3 sentence summary of what this repository is and does",
  "architecture": "The architectural pattern used (e.g., 'Layered/MVC', 'Hexagonal', 'Microservices', 'Monolithic', 'Event-driven')",
  "patterns": ["Design patterns used (e.g., 'Repository Pattern', 'Factory', 'Singleton', 'Observer')"],
  "frameworks": ["Main frameworks and libraries detected"],
  "buildSystem": "Build system used (e.g., 'npm/package.json', 'maven', 'gradle', null if unknown)",
  "entryPoints": ["Main entry points to the application"],
  "layers": [
    {
      "name": "Layer name",
      "description": "What this layer does",
      "files": ["Example file paths in this layer"]
    }
  ]
}

Be specific and accurate. Base your analysis on the actual file structure and code samples provided.`;

  const userPrompt = `Analyze this repository:

File structure (truncated):
${fileTree.slice(0, 200).join("\n")}

Sample files:
${sampleFiles
  .map(
    (f) => `
--- ${f.path} ---
${f.content.slice(0, 3000)}
`
  )
  .join("\n")}

Provide your analysis as valid JSON.`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || "";

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      summary: response,
      architecture: "Unknown",
      patterns: [],
      frameworks: [],
      buildSystem: null,
      entryPoints: [],
      layers: [],
    };
  } catch (error) {
    console.error("Error analyzing repository:", error);
    throw new Error("Failed to analyze repository");
  }
}

/**
 * Chat about the repository with context
 */
export async function chatAboutRepo(
  messages: ChatMessage[],
  context: {
    repoName: string;
    repoDescription?: string;
    currentFile?: { path: string; content: string };
    repoStructure?: string[];
    analysisContext?: string;
  }
): Promise<string> {
  const systemPrompt = `You are an AI coding assistant helping a developer understand and learn from a GitHub repository.

Repository: ${context.repoName}
${context.repoDescription ? `Description: ${context.repoDescription}` : ""}
${context.analysisContext ? `\nRepository Analysis:\n${context.analysisContext}` : ""}
${context.currentFile ? `\nCurrently viewing: ${context.currentFile.path}` : ""}

Your role is to:
1. Answer questions about the codebase clearly and accurately
2. Explain code concepts, patterns, and architecture
3. Help the developer understand how different parts connect
4. Suggest improvements or best practices when appropriate
5. Be educational - help them learn, don't just give answers

Be concise but thorough. Use code examples when helpful.`;

  const contextMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  // Add file context if viewing a specific file
  if (context.currentFile) {
    contextMessages.push({
      role: "system",
      content: `Current file content (${context.currentFile.path}):\n\`\`\`\n${context.currentFile.content.slice(0, 10000)}\n\`\`\``,
    });
  }

  // Add conversation history
  contextMessages.push(...messages);

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: contextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error("Error in chat:", error);
    throw new Error("Failed to generate response");
  }
}

/**
 * Generate a quick summary for a file (for file tree display)
 */
export async function getFileQuickSummary(
  content: string,
  path: string
): Promise<string> {
  const systemPrompt = `You are a code analyst. Provide a one-line summary (max 100 chars) of what this file does.
Just respond with the summary text, nothing else.`;

  const userPrompt = `File: ${path}
Code:
${content.slice(0, 5000)}`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content || "Code file";
  } catch (error) {
    console.error("Error getting quick summary:", error);
    return "Code file";
  }
}

/**
 * Detect architectural patterns from code structure
 */
export function detectPatterns(fileTree: string[]): string[] {
  const patterns: string[] = [];

  // Check for common patterns based on directory structure
  const dirs = new Set(
    fileTree
      .map((p) => p.split("/")[0]?.toLowerCase())
      .filter(Boolean)
  );

  // Next.js / App Router
  if (dirs.has("app") || dirs.has("pages")) {
    patterns.push("Next.js App Router");
  }

  // MVC pattern
  if (
    (dirs.has("models") || dirs.has("model")) &&
    (dirs.has("views") || dirs.has("view")) &&
    (dirs.has("controllers") || dirs.has("controller"))
  ) {
    patterns.push("MVC");
  }

  // Repository pattern
  if (dirs.has("repositories") || dirs.has("repository")) {
    patterns.push("Repository Pattern");
  }

  // Service layer
  if (dirs.has("services") || dirs.has("service")) {
    patterns.push("Service Layer");
  }

  // Component-based
  if (dirs.has("components")) {
    patterns.push("Component-based Architecture");
  }

  // API routes
  if (fileTree.some((p) => p.includes("/api/"))) {
    patterns.push("API Routes");
  }

  // Hooks pattern (React)
  if (dirs.has("hooks")) {
    patterns.push("React Hooks");
  }

  // State management
  if (dirs.has("store") || dirs.has("stores") || dirs.has("redux")) {
    patterns.push("Centralized State Management");
  }

  return patterns;
}

/**
 * Detect frameworks from package.json or file structure
 */
export function detectFrameworks(
  fileTree: string[],
  packageJson?: Record<string, unknown>
): string[] {
  const frameworks: string[] = [];

  if (packageJson) {
    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    } as Record<string, string>;

    // Check for common frameworks
    if (deps.next) frameworks.push("Next.js");
    if (deps.react) frameworks.push("React");
    if (deps.vue) frameworks.push("Vue.js");
    if (deps.angular || deps["@angular/core"]) frameworks.push("Angular");
    if (deps.svelte) frameworks.push("Svelte");
    if (deps.express) frameworks.push("Express.js");
    if (deps.fastify) frameworks.push("Fastify");
    if (deps.nestjs || deps["@nestjs/core"]) frameworks.push("NestJS");
    if (deps.prisma || deps["@prisma/client"]) frameworks.push("Prisma");
    if (deps.tailwindcss) frameworks.push("Tailwind CSS");
    if (deps.typescript) frameworks.push("TypeScript");
  }

  // File-based detection
  const pathSet = new Set(fileTree.map((p) => p.toLowerCase()));

  if (pathSet.has("next.config.js") || pathSet.has("next.config.ts")) {
    if (!frameworks.includes("Next.js")) frameworks.push("Next.js");
  }
  if (pathSet.has("tailwind.config.js") || pathSet.has("tailwind.config.ts")) {
    if (!frameworks.includes("Tailwind CSS")) frameworks.push("Tailwind CSS");
  }
  if (pathSet.has("prisma/schema.prisma")) {
    if (!frameworks.includes("Prisma")) frameworks.push("Prisma");
  }

  return frameworks;
}
