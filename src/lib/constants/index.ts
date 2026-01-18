// ==========================================
// CODE GYM - CONSTANTS
// ==========================================

// XP Rewards
export const XP_REWARDS = {
  CHALLENGE: {
    easy: 10,
    medium: 25,
    hard: 50,
  },
  BUG: {
    easy: 15,
    medium: 25,
    hard: 40,
  },
  LESSON: {
    concept: 5,
    exercise: 15,
    quiz: 10,
  },
  DAILY_HUNT_BONUS: 50,
  STREAK_BONUS: {
    7: 100,
    30: 500,
    100: 2000,
    365: 10000,
  },
} as const;

// Level Titles
export const LEVEL_TITLES: Record<number, string> = {
  1: "Code Newbie",
  5: "Syntax Explorer",
  10: "Bug Squasher",
  15: "Algorithm Apprentice",
  20: "Pattern Seeker",
  25: "Code Warrior",
  30: "Debug Master",
  40: "Architecture Artisan",
  50: "Code Sensei",
  60: "System Sage",
  70: "Tech Titan",
  80: "Code Wizard",
  90: "Digital Architect",
  100: "Code Legend",
};

// Calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Calculate XP needed for next level
export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

// Get title for level
export function getTitleForLevel(level: number): string {
  const levels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  for (const l of levels) {
    if (level >= l) {
      return LEVEL_TITLES[l] ?? "Code Newbie";
    }
  }
  return "Code Newbie";
}

// Supported Programming Languages
export const SUPPORTED_LANGUAGES = [
  { id: "python", name: "Python", version: "3.10", extension: ".py" },
  { id: "javascript", name: "JavaScript", version: "18.15", extension: ".js" },
  { id: "typescript", name: "TypeScript", version: "5.0", extension: ".ts" },
  { id: "java", name: "Java", version: "19", extension: ".java" },
  { id: "cpp", name: "C++", version: "17", extension: ".cpp" },
  { id: "go", name: "Go", version: "1.21", extension: ".go" },
  { id: "rust", name: "Rust", version: "1.73", extension: ".rs" },
] as const;

// Challenge Categories
export const CHALLENGE_CATEGORIES = [
  { id: "arrays", name: "Arrays", nameHe: "מערכים" },
  { id: "strings", name: "Strings", nameHe: "מחרוזות" },
  { id: "hash-maps", name: "Hash Maps", nameHe: "טבלאות גיבוב" },
  { id: "linked-lists", name: "Linked Lists", nameHe: "רשימות מקושרות" },
  { id: "trees", name: "Trees", nameHe: "עצים" },
  { id: "graphs", name: "Graphs", nameHe: "גרפים" },
  { id: "dynamic-programming", name: "Dynamic Programming", nameHe: "תכנות דינמי" },
  { id: "sorting", name: "Sorting", nameHe: "מיון" },
  { id: "searching", name: "Searching", nameHe: "חיפוש" },
  { id: "recursion", name: "Recursion", nameHe: "רקורסיה" },
  { id: "bit-manipulation", name: "Bit Manipulation", nameHe: "מניפולציית ביטים" },
  { id: "math", name: "Math", nameHe: "מתמטיקה" },
] as const;

// Bug Types
export const BUG_TYPES = [
  { id: "logic", name: "Logic Bug", nameHe: "באג לוגי", color: "#3b82f6" },
  { id: "performance", name: "Performance Bug", nameHe: "באג ביצועים", color: "#f59e0b" },
  { id: "security", name: "Security Bug", nameHe: "באג אבטחה", color: "#ef4444" },
  { id: "edge_case", name: "Edge Case Bug", nameHe: "באג מקרי קצה", color: "#8b5cf6" },
] as const;

// Achievement Tiers
export const ACHIEVEMENT_TIERS = {
  bronze: { name: "Bronze", color: "#cd7f32", minLevel: 1 },
  silver: { name: "Silver", color: "#c0c0c0", minLevel: 10 },
  gold: { name: "Gold", color: "#ffd700", minLevel: 25 },
  platinum: { name: "Platinum", color: "#e5e4e2", minLevel: 50 },
  diamond: { name: "Diamond", color: "#b9f2ff", minLevel: 75 },
} as const;

// Academy Phase Names
export const ACADEMY_PHASES = [
  { id: 1, name: "Planning & Discovery", nameHe: "תכנון וגילוי" },
  { id: 2, name: "Architecture & Design", nameHe: "ארכיטקטורה ועיצוב" },
  { id: 3, name: "Core Implementation", nameHe: "מימוש ליבה" },
  { id: 4, name: "Advanced Features", nameHe: "תכונות מתקדמות" },
  { id: 5, name: "Polish & UX", nameHe: "ליטוש וחווית משתמש" },
  { id: 6, name: "Testing & Quality", nameHe: "בדיקות ואיכות" },
  { id: 7, name: "Deployment & Launch", nameHe: "הפצה והשקה" },
] as const;

// Code Execution Limits
export const EXECUTION_LIMITS = {
  TIMEOUT_MS: 10000,
  MAX_OUTPUT_SIZE: 65536,
  MAX_MEMORY_KB: 256000,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    VERIFY_EMAIL: "/api/auth/verify-email",
    RESET_PASSWORD: "/api/auth/reset-password",
    REFRESH: "/api/auth/refresh",
  },
  USER: {
    PROFILE: "/api/user/profile",
    PREFERENCES: "/api/user/preferences",
    STATS: "/api/user/stats",
  },
  MASTERY: {
    CHALLENGES: "/api/mastery/challenges",
    RUN: "/api/mastery/run",
    SUBMIT: "/api/mastery/submit",
    HINTS: "/api/mastery/hints",
  },
  BUILD: {
    PROJECTS: "/api/build/projects",
    MILESTONES: "/api/build/milestones",
    SUBMIT: "/api/build/submit",
  },
  HUNT: {
    BUGS: "/api/hunt/bugs",
    DAILY: "/api/hunt/daily",
    SUBMIT: "/api/hunt/submit",
  },
  ACADEMY: {
    PATHS: "/api/academy/paths",
    PHASES: "/api/academy/phases",
    LESSONS: "/api/academy/lessons",
    PROGRESS: "/api/academy/progress",
  },
  MENTOR: {
    CHAT: "/api/mentor/chat",
    HINT: "/api/mentor/hint",
    REVIEW: "/api/mentor/review",
  },
  EXECUTE: "/api/execute",
} as const;

// App Routes
export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  MASTERY: "/mastery",
  BUILD: "/build",
  HUNT: "/hunt",
  ACADEMY: "/academy",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ACHIEVEMENTS: "/achievements",
} as const;
