export interface ArchitectureNode {
  id: string;
  label: string;
  type: "module" | "service" | "config" | "entry" | "util" | "database" | "external";
  files: string[];
  description: string;
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ArchitectureMap {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  techStack: Record<string, string>;
  summary: string;
  entryPoints?: string[];
  keyPatterns?: string[];
}

export interface Walkthrough {
  id: string;
  repoId: string;
  title?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedMinutes?: number;
  question: string;
  steps: WalkthroughStep[];
  prerequisites?: string[];
  relatedModules?: string[];
  generatedAt: string;
}

export interface WalkthroughStep {
  stepNumber: number;
  file: string;
  lineRange?: { start: number; end: number };
  lineStart?: number;
  lineEnd?: number;
  title: string;
  explanation: string;
  codeSnippet?: string;
  nextStepHint?: string;
}

export interface Convention {
  category: "Architecture" | "Error Handling" | "Naming" | "Testing" | "Styling" | "API Design" | "State Management" | "Security" | "Other";
  pattern: string;
  description: string;
  examples: string[];
  confidence: number;
  severity?: "must-follow" | "should-follow" | "nice-to-have";
  doExample?: string;
  dontExample?: string;
}

export interface QAResponse {
  answer: string;
  relevantFiles: { path: string; lineRange?: { start: number; end: number } }[];
  relatedQuestions?: string[];
}

// --- Environment Setup Types ---

export interface SetupStep {
  order: number;
  category: "runtime" | "package-manager" | "database" | "cache" | "env-vars" | "docker" | "build" | "test" | "other";
  title: string;
  command?: string;
  description: string;
  source: string;
  required: boolean;
  platform: "all" | "windows" | "macos" | "linux";
  verifyCommand?: string;
  expectedOutput?: string;
}

export interface SetupConflict {
  severity: "error" | "warning";
  description: string;
  sources: string[];
  resolution: string;
  files?: string[];
}

export interface MissingPiece {
  severity: "error" | "warning" | "info" | "critical" | "important";
  description: string;
  evidence: string;
  suggestion: string;
  what?: string;
}

export interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  source: string;
  defaultValue?: string;
  sensitive: boolean;
}

export interface DockerSupport {
  hasDockerfile: boolean;
  hasCompose: boolean;
  composeServices?: string[];
  quickStart?: string;
  services?: string[];
  instructions?: string;
}

export interface EnvSetupGuide {
  setupSteps: SetupStep[];
  conflicts: SetupConflict[];
  missingPieces: MissingPiece[];
  envVariables: EnvVariable[];
  dockerSupport: DockerSupport;
  estimatedSetupTime: string;
  requiredTools: string[];
  summary: string;
}

// --- Animated Flow Types ---

export interface AnimationSequence {
  id: string;
  title: string;
  description: string;
  category: "request-flow" | "data-pipeline" | "auth-flow" | "module-explainer" | "custom";
  steps: AnimationStep[];
  estimatedDuration: number; // seconds
}

export interface AnimationStep {
  stepNumber: number;
  nodeId: string;
  label: string;
  explanation: string;
  highlightEdges?: string[]; // edge IDs to highlight
  duration: number; // ms to stay on this step
  fresherExplanation?: string;
}

// --- Multi-Language Types ---

export type SupportedLanguage = "en" | "hi" | "ta" | "te" | "kn" | "bn" | "mr";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export interface TranslatedContent {
  language: SupportedLanguage;
  originalText: string;
  translatedText: string;
  isFresherMode: boolean;
}

// --- Embedding Types ---

export interface EmbeddingResult {
  path: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
}

export interface SemanticSearchResult {
  path: string;
  content: string;
  score: number;
  lineRange?: { start: number; end: number };
}

export interface AnalysisResult {
  repoId: string;
  analysisType: "architecture" | "conventions" | "walkthrough" | "env-setup";
  version: number;
  content: ArchitectureMap | Convention[] | Walkthrough | EnvSetupGuide;
  generatedAt: string;
  modelUsed: string;
}

// --- Skill Tracker / Progress Types ---

export type SkillArea = "architecture" | "api" | "auth" | "database" | "frontend" | "infrastructure" | "testing" | "devops" | "other";

export interface SkillScore {
  area: SkillArea;
  score: number; // 0-100
  modulesExplored: number;
  totalModules: number;
  lastActivity: string;
}

export interface ProgressEvent {
  id: string;
  userId: string;
  repoId: string;
  eventType: "walkthrough_viewed" | "qa_asked" | "module_explored" | "convention_viewed" | "env_setup_viewed" | "animated_viewed";
  targetId?: string; // walkthrough ID, module ID, etc.
  targetLabel?: string;
  area?: SkillArea;
  timestamp: string;
  durationMs?: number;
}

export interface DeveloperProgress {
  userId: string;
  repoId: string;
  overallScore: number; // 0-100
  skills: SkillScore[];
  totalTimeSpentMs: number;
  walkthroughsCompleted: number;
  questionsAsked: number;
  modulesExplored: number;
  conventionsViewed: number;
  firstActivity: string;
  lastActivity: string;
  timeline: ProgressSnapshot[];
}

export interface ProgressSnapshot {
  timestamp: string;
  overallScore: number;
  eventDescription: string;
}

export interface TeamProgress {
  repoId: string;
  members: DeveloperProgress[];
  averageScore: number;
  averageTimeToOnboard: number; // ms
  topAreas: SkillScore[];
  weakAreas: SkillScore[];
}
