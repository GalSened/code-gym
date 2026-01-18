// ==========================================
// CODE GYM - TYPE DEFINITIONS
// ==========================================

// ==========================================
// USER TYPES
// ==========================================

export type Difficulty = "easy" | "medium" | "hard";
export type SubmissionStatus = "pending" | "passed" | "failed" | "error";
export type LessonType = "concept" | "exercise" | "quiz";
export type BugType = "logic" | "performance" | "security" | "edge_case";
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  userId: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  challengesSolved: number;
  projectsCompleted: number;
  bugsFixed: number;
  lessonsCompleted: number;
  totalTimeSpent: number;
  lastActiveAt: Date;
}

export interface UserPreferences {
  userId: string;
  language: "en" | "he";
  theme: "light" | "dark" | "system";
  preferredLanguages: string[];
  emailNotifications: boolean;
  showHints: boolean;
}

// ==========================================
// MASTERY MODE TYPES
// ==========================================

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  titleHe: string | null;
  description: string;
  descriptionHe: string | null;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  xpReward: number;
  timeLimit: number | null;
  constraints: string;
  examples: ChallengeExample[];
  hints: string[];
  architectInsight: string | null;
  starterCode: Record<string, string>;
  solutions: Record<string, string>;
  testCases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface ChallengeSubmission {
  id: string;
  userId: string;
  challengeId: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  executionTime: number | null;
  memoryUsed: number | null;
  testsPassed: number;
  testsTotal: number;
  hintsUsed: number;
  xpAwarded: number;
  createdAt: Date;
}

// ==========================================
// BUILD MODE TYPES
// ==========================================

export interface Project {
  id: string;
  slug: string;
  title: string;
  titleHe: string | null;
  description: string;
  descriptionHe: string | null;
  difficulty: Difficulty;
  techStack: string[];
  estimatedHours: number;
  xpReward: number;
  skills: string[];
  milestones: ProjectMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  orderIndex: number;
  title: string;
  titleHe: string | null;
  description: string;
  descriptionHe: string | null;
  instructions: string;
  requirements: string[];
  starterFiles: Record<string, string>;
  testCriteria: string[];
  xpReward: number;
}

export interface ProjectSubmission {
  id: string;
  userId: string;
  projectId: string;
  milestoneId: string;
  files: Record<string, string>;
  status: SubmissionStatus;
  aiReview: string | null;
  xpAwarded: number;
  createdAt: Date;
}

// ==========================================
// HUNT MODE TYPES
// ==========================================

export interface Bug {
  id: string;
  slug: string;
  title: string;
  titleHe: string | null;
  description: string;
  descriptionHe: string | null;
  difficulty: Difficulty;
  type: BugType;
  language: string;
  buggyCode: string;
  correctCode: string;
  hint: string | null;
  explanation: string;
  explanationHe: string | null;
  xpReward: number;
  testCases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BugSubmission {
  id: string;
  userId: string;
  bugId: string;
  fixedCode: string;
  status: SubmissionStatus;
  xpAwarded: number;
  createdAt: Date;
}

export interface DailyHunt {
  id: string;
  date: Date;
  bugs: Bug[];
  bonusXp: number;
}

// ==========================================
// ACADEMY MODE TYPES
// ==========================================

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  titleHe: string | null;
  description: string;
  descriptionHe: string | null;
  difficulty: Difficulty;
  estimatedHours: number;
  skills: string[];
  phases: LearningPhase[];
  totalXp: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPhase {
  id: string;
  pathId: string;
  orderIndex: number;
  title: string;
  titleHe: string | null;
  description: string;
  lessons: LearningLesson[];
  deliverable: string | null;
  xpReward: number;
}

export interface LearningLesson {
  id: string;
  phaseId: string;
  orderIndex: number;
  title: string;
  titleHe: string | null;
  type: LessonType;
  content: string;
  contentHe: string | null;
  xpReward: number;
  exercise?: LessonExercise;
  quiz?: LessonQuiz;
}

export interface LessonExercise {
  instructions: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
}

export interface LessonQuiz {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserLearningProgress {
  id: string;
  userId: string;
  pathId: string;
  currentPhaseId: string;
  currentLessonId: string;
  completedLessons: string[];
  completedPhases: string[];
  startedAt: Date;
  completedAt: Date | null;
}

// ==========================================
// GAMIFICATION TYPES
// ==========================================

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  titleHe: string | null;
  description: string;
  descriptionHe: string | null;
  icon: string;
  tier: AchievementTier;
  category: string;
  requirement: AchievementRequirement;
  xpReward: number;
}

export interface AchievementRequirement {
  type: string;
  value: number;
  conditions?: Record<string, unknown>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

export interface DailyActivity {
  id: string;
  userId: string;
  date: Date;
  challengesSolved: number;
  bugsFixed: number;
  lessonsCompleted: number;
  xpEarned: number;
  timeSpent: number;
}

export interface SkillProgress {
  id: string;
  userId: string;
  skill: string;
  level: number;
  xp: number;
}

// ==========================================
// AI MENTOR TYPES
// ==========================================

export interface MentorConversation {
  id: string;
  userId: string;
  context: MentorContext;
  messages: MentorMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorContext {
  type: "challenge" | "project" | "bug" | "lesson" | "general";
  id?: string;
}

export interface MentorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

// ==========================================
// API TYPES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CodeExecutionRequest {
  language: string;
  code: string;
  stdin?: string;
  timeout?: number;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsedKb: number;
}

// ==========================================
// UI COMPONENT TYPES
// ==========================================

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
