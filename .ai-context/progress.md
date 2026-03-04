# Project Progress
> Updated by AI at end of every session. Open this to see project state without launching any AI tool.

**Last Updated:** 2026-03-02
**Status:** 🟢 ALL 7 MILESTONES COMPLETE — Demo Day Ready

---

## ✅ Completed
- Project template initialized
- CLAUDE.md filled with AutoDev project details, tech stack, key files
- SPEC.md created with 7 milestones and definitions of done
- Monorepo scaffolded with pnpm workspaces (5 packages)
- `packages/shared/` — TypeScript types (Repo, User, ArchitectureMap, Walkthrough, Convention, QAResponse)
- `packages/backend/` — Express API on :3001 with route stubs (repos, analysis, qa) + Bedrock/DynamoDB/S3 service clients
- `packages/frontend/` — Next.js 14 on :3000 with landing page, dashboard, repo detail, Q&A chat pages (Tailwind CSS)
- `packages/github-app/` — Probot app with installation, push, PR handlers + repo content fetcher
- `packages/vscode-extension/` — Extension with CodebaseExplorer, QAPanel, API client
- `infrastructure/template.yaml` — AWS SAM template (API Gateway, 3 Lambdas, 4 DynamoDB tables, S3 bucket)
- All packages compile, backend starts on :3001, frontend starts on :3000
- **Milestone 2: Core Integration**
  - `bedrock.ts` — Two-pass architecture analysis (file tree + configs → key source files)
  - `s3.ts` — Code index upload with "latest" alias, typed analysis output retrieval
  - `dynamodb.ts` — getRepoById, updateRepoStatus, listAllRepos
  - `prompts/architecture.ts` — System + two user prompts with JSON schema for 7 node types
  - `analysisOrchestrator.ts` — Full pipeline: S3 fetch → Bedrock two-pass → DynamoDB + S3 store
  - `routes/internal.ts` — POST /api/internal/ingest for GitHub App to push repo files
  - GitHub App handlers (installation.ts, push.ts) wired to fetch repo + POST to backend
  - `ArchitectureMap.tsx` — React Flow component with auto-layout, 7 node types, legend, minimap
  - Dashboard, repo detail, Q&A pages fully wired with real API calls, polling, error states
  - VS Code CodebaseExplorer renders architecture data; QAPanel calls real Bedrock Q&A API
- **Milestone 3: MVP Routes** (completed alongside M2)
  - `repos.ts` — List repos, get by owner/repo, trigger analysis
  - `analysis.ts` — Get architecture/conventions/walkthroughs, trigger analysis
  - `qa.ts` — Full Q&A pipeline with SHA-256 cache + Bedrock + file references
- **Milestone 4: Walkthroughs + Conventions + Env Setup**
  - `prompts/walkthrough.ts` — 4 prompt exports for walkthrough generation
  - `prompts/conventions.ts` — 2 prompt exports for convention detection
  - `prompts/envSetup.ts` — 2 prompt exports for environment analysis
  - `services/envAnalyzer.ts` — File categorizer + Bedrock-powered env setup analyzer
  - `shared/types/analysis.ts` — EnvSetupGuide, SetupStep, SetupConflict, MissingPiece, EnvVariable, DockerSupport types
  - `routes/walkthroughs.ts` — List, generate custom, get by ID
  - `routes/conventions.ts` — List, trigger detection (fire-and-forget)
  - `routes/envSetup.ts` — Get guide, trigger analysis (fire-and-forget)
  - `analysisOrchestrator.ts` — Cascade trigger (conventions + walkthroughs + env-setup after architecture)
  - `pullRequest.ts` — Full onboarding impact comment on PRs
  - `WalkthroughViewer.tsx` — Step viewer with progress, code snippets, navigation
  - `ConventionCard.tsx` — Convention cards with do/don't examples, category grouping
  - `EnvSetupGuide.tsx` — Interactive setup checklist with conflicts, env vars, Docker
  - Frontend pages: walkthroughs, conventions, env-setup (all with sidebar nav)
  - VS Code `WalkthroughPanel.ts` — webview with list, generation, step-by-step navigation
  - Sidebar updated with Conventions + Env Setup links
- **Milestone 5: Animated Walkthroughs + Multi-Language + Semantic Search**
  - `shared/types/analysis.ts` — AnimationSequence, AnimationStep, SupportedLanguage, LanguageOption, TranslatedContent, EmbeddingResult, SemanticSearchResult types
  - `services/cache.ts` — Generic DynamoDB-backed cache with TTL, SHA-256 keys, cacheThroughAsync
  - `services/i18n.ts` — Multi-language translation via Bedrock Haiku (7 Indic languages), batch support
  - `services/embeddings.ts` — Titan v2 embeddings, chunking, batch processing
  - `services/semanticSearch.ts` — Cosine similarity search, S3-cached embeddings, searchCodebase
  - `prompts/animatedFlow.ts` — Animation sequence + node explanation prompts
  - `routes/animated.ts` — GET sequences, POST generate, POST explain-node
  - `routes/i18n.ts` — GET languages, POST translate, POST batch
  - `routes/qa.ts` — Integrated semantic search (10 results w/ fallback) + i18n translation
  - `index.ts` — 9 total route mounts (added animated + i18n)
  - `AnimatedArchitectureMap.tsx` — React Flow animated component (playback, step nav, glow effects, explanations)
  - `LanguageSelector.tsx` — Language picker w/ 7 languages, fresher mode toggle, compact/full variant
  - `animated/page.tsx` — Full animated walkthrough page with language selection, node explanations
  - All 6 sidebar navigations updated with "Animated Map" link
  - `providers/CodeLensProvider.ts` — Architecture annotations on source files (type emoji, description, connections)
  - `api/client.ts` — 6 new API functions (animation sequences, node explanations, i18n)
  - `extension.ts` — Registered CodeLensProvider, showNodeDetail/selectLanguage/refreshCodeLens commands
  - `package.json` — 3 new commands + configuration (repoId, language, fresherMode settings)
- **Milestone 6: Learning Progress + Skill Tracker + Tests**
  - `shared/types/analysis.ts` — SkillArea (9 areas), SkillScore, ProgressEvent, DeveloperProgress, ProgressSnapshot, TeamProgress
  - `services/progressTracker.ts` (383 lines) — MODULE_AREA_MAP, classifyArea, getAreasFromArchitecture, recordProgressEvent, getProgressEvents, computeSkillScores, computeDeveloperProgress, getRepoUserIds, computeTeamProgress
  - `routes/skillTracker.ts` — 5 endpoints (POST event, GET progress, GET events, GET team, GET leaderboard)
  - `SkillRadar.tsx` — SVG radar chart with area labels, score polygons, color legend
  - `ProgressTimeline.tsx` — Score display, gradient bar, SVG area chart, event list
  - `ModuleCompletionGrid.tsx` — 4-col summary stats, module cards with progress bars, icons
  - `progress/page.tsx` — Learning progress dashboard with all 3 components, 30s auto-refresh
  - `team/page.tsx` — Team progress with leaderboard, selected member detail
  - All 8 sidebar pages updated with "My Progress" and "Team" nav links
  - Backend tests: 29 tests (vitest) — classifyArea, getAreasFromArchitecture, computeSkillScores, computeDeveloperProgress, edge cases
  - Frontend tests: 15 tests (vitest + @testing-library/react) — SkillRadar, ProgressTimeline, ModuleCompletionGrid
- **Milestone 7: Demo Day**
  - `routes/demo.ts` (~670 lines) — Full demo data API with 3 sample repos, all routes matching frontend patterns
  - `lib/api.ts` (44 lines) — `useIsDemo()`, `getApiBase(repoId)`, `apiUrl()`, `API_BASE` utility
  - All 8 dashboard sub-pages wired for demo mode via `getApiBase(decodedRepoId)`
  - `dashboard/page.tsx` — Demo mode toggle with `?demo=true` query param
  - `demo/page.tsx` (~260 lines) — Guided 5-step demo walkthrough page
  - `page.tsx` — Polished landing page with hero, features, how-it-works, stats
  - `GET /api/warmup` — Pre-warm endpoint with service readiness checks
  - README updated with all milestones ✅ Done + Demo Mode section
  - 3 demo repos: express-shop (Node.js), react-dashboard (React), python-ml-api (Python)

## 🔄 In Progress
- (none)

## 📋 Up Next
- (all milestones complete)

---

## 🧠 Key Decisions
- **Product**: AI-powered codebase onboarding (not PR review like CodeRabbit)
- **Name**: AutoDev
- **Monorepo**: pnpm workspaces with 5 packages
- **AI Models**: Bedrock Claude 3.5 Sonnet (analysis), Claude 3 Haiku (Q&A), Titan (embeddings)
- **Two-pass analysis**: Pass 1 scans file tree + configs, Pass 2 reads key files
- **File limits**: 500 files max, 100KB per file, skip binaries/lockfiles
- **Frontend**: Manually scaffolded Next.js 14 (create-next-app had interactive prompt issues)
- **Q&A caching**: SHA-256 hash of (repoId + question) → DynamoDB with 1-hour TTL
- **VS Code config**: `autodev.repoId` setting for repo identification

## ⚠️ Blockers
- [none currently]

## 📁 Important Files
| File | Purpose |
|------|---------|
| CLAUDE.md | AI context — project details and conventions |
| SPEC.md | 7 milestones with definitions of done |
| .ai-context/prompt_log.md | Task history |
| .ai-context/progress.md | This file — project state summary |
| packages/backend/src/index.ts | Express app entry point |
| packages/backend/src/services/ | Bedrock, DynamoDB, S3, analysisOrchestrator |
| packages/backend/src/prompts/ | AI prompts (architecture, walkthrough, conventions, envSetup, animatedFlow) |
| packages/backend/src/routes/ | API routes (repos, analysis, qa, internal, walkthroughs, conventions, envSetup, animated, i18n, skillTracker) |
| packages/backend/src/services/progressTracker.ts | Learning progress + skill scoring engine |
| packages/backend/src/routes/skillTracker.ts | Progress API (5 endpoints) |
| packages/backend/src/__tests__/progressTracker.test.ts | 29 backend tests |
| packages/frontend/src/components/SkillRadar.tsx | SVG radar chart component |
| packages/frontend/src/components/ProgressTimeline.tsx | Score display + area chart |
| packages/frontend/src/components/ModuleCompletionGrid.tsx | Module cards + summary stats |
| packages/frontend/src/app/dashboard/[repoId]/progress/page.tsx | Learning progress dashboard |
| packages/frontend/src/app/dashboard/[repoId]/team/page.tsx | Team progress + leaderboard |
| packages/frontend/src/__tests__/ | 15 frontend component tests |
| packages/backend/src/services/envAnalyzer.ts | Environment setup analysis service |
| packages/backend/src/services/cache.ts | DynamoDB-backed TTL cache service |
| packages/backend/src/services/i18n.ts | Multi-language translation service |
| packages/backend/src/services/embeddings.ts | Titan v2 embeddings service |
| packages/backend/src/services/semanticSearch.ts | Cosine similarity semantic search |
| packages/frontend/src/app/ | Next.js pages (dashboard, walkthroughs, conventions, env-setup, animated) |
| packages/frontend/src/components/ | ArchitectureMap, AnimatedArchitectureMap, LanguageSelector, WalkthroughViewer, ConventionCard, EnvSetupGuide |
| packages/github-app/src/ | Probot webhook handlers (installation, push, PR onboarding) |
| packages/vscode-extension/src/ | VS Code extension (CodebaseExplorer, QAPanel, WalkthroughPanel, CodeLensProvider) |
| infrastructure/template.yaml | AWS SAM template |
| packages/backend/src/routes/demo.ts | Demo data API (3 repos, all routes, no AWS) |
| packages/frontend/src/lib/api.ts | Demo mode utility (getApiBase, useIsDemo) |
| packages/frontend/src/app/demo/page.tsx | Guided 5-step demo walkthrough page |
