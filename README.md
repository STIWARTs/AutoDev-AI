<p align="center">
  <img src="https://img.shields.io/badge/AI%20for%20Bharat-Hackathon%202026-orange?style=for-the-badge" alt="AI for Bharat" />
  <img src="https://img.shields.io/badge/Track-Learning%20%26%20Developer%20Productivity-blue?style=for-the-badge" alt="Track" />
  <img src="https://img.shields.io/badge/Category-Student-green?style=for-the-badge" alt="Student Track" />
</p>

<h1 align="center">AutoDev</h1>
<h3 align="center">AI-Powered Codebase Onboarding Platform</h3>
<p align="center"><i>Onboard new developers in hours, not weeks. In their own language.</i></p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AWS-Bedrock-orange?logo=amazon-aws" alt="AWS Bedrock" />
  <img src="https://img.shields.io/badge/React%20Flow-Visualization-purple" alt="React Flow" />
  <img src="https://img.shields.io/badge/Probot-GitHub%20App-black?logo=github" alt="Probot" />
  <img src="https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code" alt="VS Code" />
</p>

---

## The Problem

> **New developers waste 2-4 weeks understanding unfamiliar codebases.**

- India has **4.3M developers** — 83% of graduates struggle without mentors
- Service companies constantly rotate devs across projects — onboarding is a massive bottleneck
- Existing tools (CodeRabbit, Greptile, Qodo) focus on **code review**, not **learning**
- No tool explains code in **Indian languages** — Hindi, Tamil, Telugu, Kannada, Bengali, Marathi

## The Solution

**AutoDev** is the first platform purpose-built for **developer onboarding as learning** — not just code search or PR review. Install it on any GitHub repo and get:

| What You Get | How It Helps |
|---|---|
| **Animated Architecture Maps** | Watch request flows light up node-by-node — understand how the system actually works |
| **Environment Setup Autopilot** | AI-generated setup guide that flags conflicts and missing docs — Day 1 in 10 minutes, not 2 days |
| **Multi-Language Explanations** | "Explain auth like I'm a fresher" — in Hindi, Tamil, Telugu, or English |
| **Learning Progress Dashboard** | Track understanding: "0% to 80% in 2 hours" with skill radar charts |
| **Guided Walkthroughs** | Step-by-step code tours auto-generated from analysis |
| **Codebase Q&A** | Ask questions in natural language, get answers with file references |
| **Convention Detection** | Visual cards showing coding patterns and standards used in the repo |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER ONBOARDING FLOW                      │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌───────────────┐     ┌──────────────────────────────┐
  │  GitHub   │────>│  AutoDev      │────>│  AWS Bedrock                 │
  │  Repo     │     │  GitHub App   │     │  (Claude 3.5 Sonnet + Haiku) │
  │           │     │  (Probot)     │     │  (Titan Embeddings)          │
  └──────────┘     └───────┬───────┘     └──────────────┬───────────────┘
                           │                             │
                    Fetches repo                   AI Analysis:
                    contents                       - Architecture mapping
                           │                       - Convention detection
                           v                       - Walkthrough generation
                    ┌──────────────┐               - Environment scanning
                    │  S3 Bucket   │               - Multi-language i18n
                    │  (Raw Files) │                        │
                    └──────┬───────┘                        │
                           │                                v
                           │                    ┌───────────────────┐
                           └───────────────────>│    DynamoDB       │
                                                │  (Analysis Store) │
                                                └────────┬──────────┘
                                                         │
                          ┌──────────────────────────────┼──────────────────┐
                          │                              │                  │
                          v                              v                  v
                 ┌─────────────────┐        ┌────────────────┐    ┌──────────────┐
                 │  Web Dashboard  │        │  VS Code       │    │  GitHub PR   │
                 │  (Next.js 14)  │        │  Extension     │    │  Comments    │
                 │                 │        │                │    │              │
                 │ - Animated Map  │        │ - Codebase     │    │ - Onboarding │
                 │ - Walkthroughs  │        │   Explorer     │    │   impact     │
                 │ - Q&A Chat      │        │ - Q&A Panel    │    │   analysis   │
                 │ - Setup Guide   │        │ - CodeLens     │    │              │
                 │ - Progress      │        │ - Walkthroughs │    │              │
                 │ - Language Pick  │        │                │    │              │
                 └─────────────────┘        └────────────────┘    └──────────────┘
```

### Step-by-Step Flow

```
1. INSTALL        Developer installs AutoDev GitHub App on their repo
                  ↓
2. FETCH          GitHub App fetches repo contents via GitHub API → stores in S3
                  ↓
3. ANALYZE        Backend sends code to AWS Bedrock (Claude 3.5 Sonnet):
                  → Architecture mapping (components, dependencies, data flow)
                  → Convention detection (coding patterns, naming, structure)
                  → Environment scanning (setup requirements, conflicts)
                  → Walkthrough generation (step-by-step code tours)
                  ↓
4. STORE          Results stored in DynamoDB + S3
                  ↓
5. DELIVER        Developer accesses onboarding via 3 channels:
                  → Web Dashboard: animated maps, walkthroughs, Q&A, progress
                  → VS Code Extension: inline explorer, Q&A panel, CodeLens
                  → GitHub PR Comments: onboarding impact analysis
                  ↓
6. LEARN          Developer asks questions in their preferred language
                  → Progress tracked: modules explored, Q&As asked, time spent
                  → Skill radar shows growth: Auth 70%, API 40%, DB 90%
                  → "0% → 80% codebase understanding in 2 hours"
```

---

## What Makes AutoDev Different

Every competitor helps developers **DO** work. AutoDev helps developers **LEARN**.

```
┌──────────────────────────────────────────────────────────────────┐
│                    COMPETITOR LANDSCAPE                           │
├──────────────────┬───────────────────────┬───────────────────────┤
│   Tool           │   What They Do        │   Focus               │
├──────────────────┼───────────────────────┼───────────────────────┤
│   CodeRabbit     │   Review PRs faster   │   ❌ Doing            │
│   Qodo           │   Find bugs in PRs    │   ❌ Doing            │
│   Greptile       │   Search codebase     │   ❌ Doing            │
│   Sourcegraph    │   Navigate code       │   ❌ Doing            │
│   CodeScene      │   Measure code health │   ❌ Doing            │
├──────────────────┼───────────────────────┼───────────────────────┤
│   AutoDev        │   LEARN a codebase    │   ✅ Learning         │
└──────────────────┴───────────────────────┴───────────────────────┘
```

### Features No Competitor Has

| Feature | AutoDev | CodeRabbit | Qodo | Greptile | Swimm | CodeScene |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Animated Visual Walkthroughs** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Environment Setup Autopilot** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Multi-Language (Indian)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Learning Progress Dashboard** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Skill Radar Charts** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **All-in-One Onboarding** | ✅ | ❌ | ❌ | ❌ | Partial | ❌ |

---

## Key Features

### 1. Animated Architecture Maps

Interactive React Flow diagrams where nodes **light up in sequence** showing how requests flow through the system.

```
  [User Click] ──→ [API Gateway] ──→ [Auth Middleware] ──→ [JWT Validation]
       🟢               🟢                 🟢                   🟢
                                                                  │
  [Response] ←── [Controller] ←── [Service Layer] ←── [DB Lookup] ←┘
      🟢              🟢               🟢                🟢

  ● Nodes highlight one-by-one with animated edges
  ● Click any node to pause and get AI explanation
  ● Per-module walkthroughs: "Auth System", "Data Pipeline", "Frontend Layer"
  ● Auto-generated from codebase analysis
```

### 2. Environment Setup Autopilot

AI scans the repo and generates a **verified setup guide** — not a stale README.

```
┌─────────────────────────────────────────────────────┐
│  Environment Setup Autopilot                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ✅ Node.js 18.x required (.nvmrc detected)         │
│  ✅ pnpm 8.x required (packageManager field)        │
│  ⚠️  CONFLICT: README says Node 16, package.json    │
│     engines requires Node 18                         │
│  ✅ Docker Compose detected (3 services)             │
│  ❌ MISSING: .env.example exists but no Redis        │
│     setup docs (docker-compose uses Redis)           │
│  ✅ 8 setup steps generated                          │
│                                                      │
│  Estimated setup time: 10 minutes                    │
│  (vs. average 1-3 days without AutoDev)              │
└─────────────────────────────────────────────────────┘
```

### 3. Multi-Language Explanations (Bharat-First)

Code explanations in **Hindi, Tamil, Telugu, Kannada, Bengali, Marathi** — because 83% of Indian graduates learn better in their native language.

```
┌─────────────────────────────────────────────────────┐
│  🌐 Language: Hindi                          [▼]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Q: "Auth module kaise kaam karta hai?"              │
│                                                      │
│  A: "Yeh authentication module JWT tokens ka         │
│  use karta hai. Jab user login karta hai,            │
│  server ek token generate karta hai jo               │
│  24 ghante tak valid rehta hai. Har API              │
│  request mein yeh token header mein bheja            │
│  jaata hai aur middleware verify karta hai."          │
│                                                      │
│  📁 Related files: src/middleware/auth.ts,           │
│     src/services/jwt.ts                              │
└─────────────────────────────────────────────────────┘
```

### 4. Learning Progress Dashboard

Track developer understanding with **measurable outcomes**.

```
┌─────────────────────────────────────────────────────┐
│  Learning Progress — Rahul (joined 2 hours ago)      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Overall Understanding: ████████████░░░░ 75%         │
│                                                      │
│  Module Breakdown (Skill Radar):                     │
│    Authentication  ████████████████░░ 85%            │
│    API Routes      ██████████████░░░░ 70%            │
│    Database Layer  ████████████░░░░░░ 60%            │
│    Frontend        ██████████░░░░░░░░ 50%            │
│    Infrastructure  ████░░░░░░░░░░░░░░ 20%            │
│                                                      │
│  ⏱  Time spent: 2h 15m                              │
│  💬 Questions asked: 12                              │
│  📖 Walkthroughs completed: 4/7                      │
│  🎯 Ready for first contribution: Auth module        │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTODEV ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   CLIENT LAYER                                                       │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────┐            │
│   │  Next.js 14  │  │  VS Code     │  │  GitHub App    │            │
│   │  Dashboard   │  │  Extension   │  │  (Probot)      │            │
│   │  React Flow  │  │  React       │  │  Webhooks      │            │
│   │  Tailwind    │  │  Webviews    │  │                │            │
│   └──────┬───────┘  └──────┬───────┘  └───────┬────────┘            │
│          │                 │                   │                     │
│   ───────┼─────────────────┼───────────────────┼──────── REST API   │
│          │                 │                   │                     │
│   API LAYER                                                          │
│   ┌─────────────────────────────────────────────────────┐           │
│   │  Express.js + TypeScript                             │           │
│   │  (Lambda via serverless-http)                        │           │
│   │                                                      │           │
│   │  Routes:                                             │           │
│   │  /api/repos      → Repository management             │           │
│   │  /api/analysis   → Trigger & retrieve analysis       │           │
│   │  /api/qa         → Natural language Q&A              │           │
│   │  /api/walkthroughs → Guided code tours               │           │
│   │  /api/conventions  → Detected patterns               │           │
│   │  /api/env-setup    → Environment autopilot           │           │
│   │  /api/progress     → Learning progress tracking      │           │
│   └──────────────────────┬──────────────────────────────┘           │
│                          │                                           │
│   AI LAYER               │                                           │
│   ┌──────────────────────┴──────────────────────────────┐           │
│   │  AWS Bedrock                                         │           │
│   │  ┌─────────────────┐  ┌──────────────┐  ┌─────────┐│           │
│   │  │ Claude 3.5      │  │ Claude 3     │  │ Titan   ││           │
│   │  │ Sonnet          │  │ Haiku        │  │ Embed   ││           │
│   │  │ (Architecture,  │  │ (Conventions,│  │ V2      ││           │
│   │  │  Walkthroughs,  │  │  Env Setup,  │  │(Semantic││           │
│   │  │  Complex Q&A)   │  │  i18n, Quick)│  │ Search) ││           │
│   │  └─────────────────┘  └──────────────┘  └─────────┘│           │
│   └─────────────────────────────────────────────────────┘           │
│                                                                      │
│   DATA LAYER                                                         │
│   ┌─────────────────────┐  ┌─────────────────────┐                  │
│   │  DynamoDB            │  │  S3                  │                  │
│   │  - repos             │  │  - repo-files        │                  │
│   │  - analyses          │  │  - analysis-results  │                  │
│   │  - qa-cache (TTL)    │  │                      │                  │
│   │  - progress          │  │                      │                  │
│   │  - walkthroughs      │  │                      │                  │
│   └─────────────────────┘  └─────────────────────┘                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14, React Flow, Tailwind CSS | Web dashboard with animated maps, Q&A, progress |
| **VS Code** | TypeScript, React Webviews | IDE-integrated onboarding experience |
| **GitHub App** | Probot Framework | Auto-analyze repos on installation, PR comments |
| **Backend** | Express + TypeScript (Lambda) | REST API, analysis orchestration |
| **AI** | AWS Bedrock (Claude 3.5 Sonnet, Haiku, Titan) | Architecture analysis, Q&A, translations |
| **Database** | DynamoDB | Repos, analyses, cache, progress tracking |
| **Storage** | S3 | Raw repo files, analysis results |
| **Infra** | API Gateway + Lambda (SAM) | Serverless deployment |

---

## Project Structure

```
autodev/
├── packages/
│   ├── backend/                    # Express API + Lambda handlers
│   │   ├── src/
│   │   │   ├── routes/             # API endpoints (repos, analysis, qa, walkthroughs, etc.)
│   │   │   ├── services/           # Bedrock, DynamoDB, S3, analysis orchestrator
│   │   │   ├── prompts/            # AI prompt templates (architecture, walkthrough, conventions)
│   │   │   └── middleware/         # Auth, error handling
│   │   └── package.json
│   │
│   ├── frontend/                   # Next.js 14 dashboard
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── dashboard/      # Repo list, detail pages
│   │   │   │   │   └── [repoId]/   # Per-repo: map, Q&A, walkthroughs, progress
│   │   │   │   └── page.tsx        # Landing page
│   │   │   └── components/         # ArchitectureMap, AnimatedMap, SkillRadar, etc.
│   │   └── package.json
│   │
│   ├── github-app/                 # Probot GitHub App
│   │   ├── src/
│   │   │   ├── handlers/           # Installation, PR, push event handlers
│   │   │   └── services/           # Repo fetcher (GitHub API → S3)
│   │   └── package.json
│   │
│   ├── vscode-extension/           # VS Code extension
│   │   ├── src/
│   │   │   ├── panels/             # CodebaseExplorer, QAPanel, WalkthroughPanel
│   │   │   ├── providers/          # CodeLens, tree views
│   │   │   └── api/                # Backend API client
│   │   └── package.json
│   │
│   └── shared/                     # Shared TypeScript types
│       └── src/types/              # Repo, Analysis, User type definitions
│
├── infrastructure/                 # AWS SAM/CDK templates
│   └── template.yaml              # API Gateway + Lambda + DynamoDB + S3
│
├── SPEC.md                        # Milestone-based task specification
├── pnpm-workspace.yaml            # Monorepo workspace config
├── tsconfig.base.json             # Shared TypeScript config
└── package.json                   # Root package with workspace scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- AWS account with Bedrock access (us-east-1)
- GitHub account (for GitHub App)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/autodev.git
cd autodev

# Install all dependencies
pnpm install

# Build shared types
pnpm --filter @autodev/shared build
```

### Environment Setup

```bash
# Copy the env template
cp .env.example .env

# Fill in your credentials:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_REGION=us-east-1
# - GITHUB_APP_ID
# - GITHUB_PRIVATE_KEY
# - GITHUB_WEBHOOK_SECRET
```

### Running Locally

```bash
# Start backend (port 3001)
pnpm --filter @autodev/backend dev

# Start frontend (port 3000)
pnpm --filter @autodev/frontend dev

# Start GitHub App (port 3002)
pnpm --filter @autodev/github-app dev

# Or run everything at once
pnpm dev
```

### AWS Services Setup

1. **Bedrock** → Enable Claude 3.5 Sonnet, Claude 3 Haiku, Titan Embeddings V2
2. **DynamoDB** → 5 tables (repos, analyses, qa-cache, progress, walkthroughs)
3. **S3** → 2 buckets (repo-files, analysis-results)
4. **Lambda + API Gateway** → Deploy via SAM template

See [.ai-context/Guide/aws-setup-and-costs.md](.ai-context/Guide/aws-setup-and-costs.md) for detailed setup instructions.

---

## Demo

> **"A fresher joins a company. In 10 minutes: animated system map, AI explanations in their language, verified setup guide, and a learning path. 2 weeks → 2 hours."**

### Demo Flow

1. **Install** → GitHub App on any repo → auto-analysis starts
2. **Explore** → Animated architecture map lights up showing system flow
3. **Ask** → "Explain auth like I'm a fresher" → **in Hindi**
4. **Setup** → Environment Autopilot: "8 steps detected, 2 conflicts found"
5. **Track** → Progress dashboard: "Understanding: 0% → 45% in 10 minutes"

### Demo Mode (No AWS Required)

AutoDev includes a **fully offline demo mode** with pre-canned data for 3 sample repos:

```bash
# Start backend + frontend
pnpm --filter backend dev &
pnpm --filter frontend dev

# Open demo dashboard
open http://localhost:3000/dashboard?demo=true
```

**How it works:**
- Add `?demo=true` to the dashboard URL → loads 3 demo repositories
- Click any demo repo → all pages (architecture, walkthroughs, Q&A, progress, etc.) serve pre-built data from `/api/demo/*`
- No AWS credentials, DynamoDB, or S3 needed
- Guided walkthrough at [localhost:3000/demo](http://localhost:3000/demo)

**Demo repos:** `express-shop` (Node.js), `react-dashboard` (React), `python-ml-api` (Python)

**Endpoints:**
| Endpoint | Purpose |
|---|---|
| `GET /health` | Service health check |
| `GET /api/warmup` | Pre-warm services, check readiness |
| `GET /api/demo/repos` | List demo repositories |
| `GET /api/demo/analysis/:owner/:repo/architecture` | Architecture data |
| `GET /api/demo/animated/:owner/:repo/sequences` | Animated flow sequences |
| `POST /api/demo/qa/:owner/:repo` | AI Q&A (canned responses) |
| `GET /api/demo/progress/:owner/:repo/team` | Team progress + leaderboard |

---

## Supported Languages

| Language | Code | Status |
|---|---|---|
| English | `en` | ✅ Default |
| Hindi | `hi` | ✅ Supported |
| Tamil | `ta` | ✅ Supported |
| Telugu | `te` | ✅ Supported |
| Kannada | `kn` | ✅ Supported |
| Bengali | `bn` | ✅ Supported |
| Marathi | `mr` | ✅ Supported |

---

## Milestones

| Milestone | Status | Description |
|---|---|---|
| M1: Foundation | ✅ Done | Monorepo, all 5 packages, AWS infra template |
| M2: Core Integration | ✅ Done | Bedrock AI, GitHub App, React Flow maps |
| M3: MVP End-to-End | ✅ Done | Q&A, analysis pipeline, VS Code extension |
| M4: Walkthroughs + Env Setup | ✅ Done | Guided tours, conventions, setup autopilot |
| M5: Animated Maps + i18n | ✅ Done | Animated walkthroughs, multi-language support |
| M6: Progress Dashboard | ✅ Done | Skill radar, learning tracking, team view |
| M7: Demo Day | ✅ Done | Polish, demo mode, guided demo script, health check |

---

## Why This Matters for India

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│   4.3M developers in India                                    │
│   83% of graduates struggle without mentors                   │
│   Service companies rotate devs every 6-12 months             │
│   Average onboarding time: 2-4 weeks per project              │
│                                                               │
│   With AutoDev:                                               │
│   → Onboarding: 2 weeks → 2 hours                            │
│   → Setup: 2 days → 10 minutes                               │
│   → Language barrier: removed (Hindi, Tamil, Telugu...)        │
│   → Mentor dependency: replaced with AI mentor                │
│   → Progress: measurable, trackable, quantifiable             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Built With

<p>
  <img src="https://img.shields.io/badge/Amazon%20Bedrock-Claude%203.5%20Sonnet-orange?logo=amazon-aws" />
  <img src="https://img.shields.io/badge/Amazon%20Bedrock-Claude%203%20Haiku-orange?logo=amazon-aws" />
  <img src="https://img.shields.io/badge/Amazon%20Bedrock-Titan%20Embeddings-orange?logo=amazon-aws" />
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Express.js-4.x-green?logo=express" />
  <img src="https://img.shields.io/badge/React%20Flow-11.x-purple" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.x-blue?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Probot-GitHub%20App-black?logo=github" />
  <img src="https://img.shields.io/badge/DynamoDB-NoSQL-blue?logo=amazon-dynamodb" />
  <img src="https://img.shields.io/badge/AWS%20Lambda-Serverless-orange?logo=aws-lambda" />
  <img src="https://img.shields.io/badge/pnpm-Monorepo-yellow?logo=pnpm" />
</p>

---

## Team

Built for the **AI for Bharat Hackathon 2026** — Student Track
Problem Statement: *AI for Learning & Developer Productivity*

---

## License

MIT
