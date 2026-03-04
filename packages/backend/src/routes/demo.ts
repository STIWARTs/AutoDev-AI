import { Router, type Router as RouterType } from "express";

export const demoRoutes: RouterType = Router();

// ─── Pre-Analyzed Demo Repos ───

const DEMO_REPOS = [
  {
    repoId: "demo/express-shop",
    userId: "demo-user",
    repoUrl: "https://github.com/demo/express-shop",
    defaultBranch: "main",
    lastAnalyzedAt: new Date().toISOString(),
    analysisStatus: "completed" as const,
    fileCount: 87,
    techStack: {
      runtime: "Node.js 18",
      framework: "Express.js",
      database: "PostgreSQL",
      orm: "Prisma",
      testing: "Jest",
      styling: "N/A (API only)",
    },
  },
  {
    repoId: "demo/react-dashboard",
    userId: "demo-user",
    repoUrl: "https://github.com/demo/react-dashboard",
    defaultBranch: "main",
    lastAnalyzedAt: new Date().toISOString(),
    analysisStatus: "completed" as const,
    fileCount: 134,
    techStack: {
      runtime: "Node.js 18",
      framework: "Next.js 14",
      database: "Supabase",
      orm: "N/A",
      testing: "Vitest",
      styling: "Tailwind CSS",
    },
  },
  {
    repoId: "demo/python-ml-api",
    userId: "demo-user",
    repoUrl: "https://github.com/demo/python-ml-api",
    defaultBranch: "main",
    lastAnalyzedAt: new Date().toISOString(),
    analysisStatus: "completed" as const,
    fileCount: 52,
    techStack: {
      runtime: "Python 3.11",
      framework: "FastAPI",
      database: "MongoDB",
      orm: "Motor (async)",
      testing: "pytest",
      styling: "N/A",
    },
  },
];

const DEMO_ARCHITECTURES: Record<string, object> = {
  "demo/express-shop": {
    nodes: [
      { id: "entry", label: "Server Entry", type: "entry", files: ["src/index.ts"], description: "Express server bootstrap — loads middleware, mounts routes, connects to database." },
      { id: "auth", label: "Auth Module", type: "module", files: ["src/middleware/auth.ts", "src/services/jwt.ts"], description: "JWT-based authentication. Issues tokens on login, validates on every protected route." },
      { id: "routes", label: "API Routes", type: "module", files: ["src/routes/products.ts", "src/routes/orders.ts", "src/routes/users.ts"], description: "REST API endpoints — products CRUD, order management, user profiles." },
      { id: "services", label: "Business Logic", type: "service", files: ["src/services/productService.ts", "src/services/orderService.ts"], description: "Core business logic layer. Handles pricing, inventory checks, order validation." },
      { id: "db", label: "PostgreSQL", type: "database", files: ["src/db/prisma.ts", "prisma/schema.prisma"], description: "Prisma ORM with PostgreSQL. Handles products, orders, users, inventory tables." },
      { id: "cache", label: "Redis Cache", type: "external", files: ["src/services/cache.ts"], description: "Redis for session storage and product catalog caching. TTL-based invalidation." },
      { id: "payments", label: "Payment Gateway", type: "external", files: ["src/services/stripe.ts"], description: "Stripe integration for payment processing, webhooks for order confirmation." },
      { id: "config", label: "Config", type: "config", files: [".env.example", "src/config.ts"], description: "Environment configuration — DB URL, JWT secret, Stripe keys, Redis URL." },
    ],
    edges: [
      { source: "entry", target: "auth", label: "middleware" },
      { source: "entry", target: "routes", label: "mount" },
      { source: "routes", target: "auth", label: "protect" },
      { source: "routes", target: "services", label: "delegate" },
      { source: "services", target: "db", label: "query" },
      { source: "services", target: "cache", label: "cache" },
      { source: "services", target: "payments", label: "charge" },
      { source: "auth", target: "cache", label: "sessions" },
      { source: "entry", target: "config", label: "load" },
    ],
    techStack: { runtime: "Node.js 18", framework: "Express.js", database: "PostgreSQL", orm: "Prisma", testing: "Jest", cache: "Redis", payments: "Stripe" },
    summary: "Express.js e-commerce API with JWT auth, Prisma ORM, Redis caching, and Stripe payments. Clean 3-layer architecture (routes → services → database).",
    entryPoints: ["src/index.ts"],
    keyPatterns: ["Repository pattern", "Middleware chain", "Service layer", "DTO validation"],
  },
  "demo/react-dashboard": {
    nodes: [
      { id: "app", label: "App Router", type: "entry", files: ["src/app/layout.tsx", "src/app/page.tsx"], description: "Next.js 14 App Router entry. Root layout with auth provider, global styles." },
      { id: "pages", label: "Page Routes", type: "module", files: ["src/app/dashboard/page.tsx", "src/app/settings/page.tsx", "src/app/analytics/page.tsx"], description: "App pages — dashboard overview, analytics charts, user settings." },
      { id: "components", label: "UI Components", type: "module", files: ["src/components/Chart.tsx", "src/components/DataTable.tsx", "src/components/Sidebar.tsx"], description: "Reusable UI components — charts (Recharts), data tables, sidebar navigation." },
      { id: "hooks", label: "Custom Hooks", type: "util", files: ["src/hooks/useAuth.ts", "src/hooks/useData.ts", "src/hooks/useRealtime.ts"], description: "React hooks for auth state, data fetching (SWR), and real-time subscriptions." },
      { id: "api", label: "API Layer", type: "service", files: ["src/lib/api.ts", "src/app/api/route.ts"], description: "API client + Next.js API routes. Handles Supabase queries and auth tokens." },
      { id: "supabase", label: "Supabase", type: "database", files: ["src/lib/supabase.ts"], description: "Supabase client for auth, database, and real-time subscriptions." },
      { id: "state", label: "State Management", type: "util", files: ["src/store/dashboardStore.ts"], description: "Zustand store for dashboard filters, date ranges, and UI preferences." },
      { id: "auth", label: "Auth (Supabase)", type: "module", files: ["src/app/login/page.tsx", "src/middleware.ts"], description: "Supabase Auth with middleware route protection and OAuth providers." },
    ],
    edges: [
      { source: "app", target: "pages", label: "route" },
      { source: "app", target: "auth", label: "protect" },
      { source: "pages", target: "components", label: "render" },
      { source: "pages", target: "hooks", label: "use" },
      { source: "hooks", target: "api", label: "fetch" },
      { source: "api", target: "supabase", label: "query" },
      { source: "hooks", target: "state", label: "manage" },
      { source: "auth", target: "supabase", label: "verify" },
    ],
    techStack: { runtime: "Node.js 18", framework: "Next.js 14", database: "Supabase/PostgreSQL", testing: "Vitest", styling: "Tailwind CSS", state: "Zustand", charts: "Recharts" },
    summary: "Next.js 14 analytics dashboard with Supabase backend, real-time data subscriptions, Zustand state management, and Recharts visualizations.",
    entryPoints: ["src/app/layout.tsx"],
    keyPatterns: ["App Router conventions", "Server components", "Custom hooks pattern", "Zustand slices"],
  },
  "demo/python-ml-api": {
    nodes: [
      { id: "main", label: "FastAPI App", type: "entry", files: ["app/main.py"], description: "FastAPI application entry point. Configures CORS, mounts routers, connects to MongoDB." },
      { id: "routes", label: "API Endpoints", type: "module", files: ["app/routes/predict.py", "app/routes/models.py", "app/routes/health.py"], description: "REST endpoints — model prediction, model management, health checks." },
      { id: "ml", label: "ML Pipeline", type: "service", files: ["app/ml/predictor.py", "app/ml/preprocessor.py"], description: "Machine learning pipeline — data preprocessing, feature extraction, model inference." },
      { id: "models", label: "Model Store", type: "external", files: ["app/services/model_store.py"], description: "Model artifact storage on S3. Handles model versioning, loading, and caching." },
      { id: "db", label: "MongoDB", type: "database", files: ["app/db/mongo.py", "app/db/schemas.py"], description: "MongoDB with Motor async driver. Stores predictions, user data, model metadata." },
      { id: "auth", label: "API Key Auth", type: "module", files: ["app/middleware/auth.py"], description: "API key authentication middleware. Rate limiting per key." },
      { id: "config", label: "Config", type: "config", files: ["app/config.py", ".env.example"], description: "Pydantic settings — MongoDB URI, S3 bucket, model paths, rate limits." },
    ],
    edges: [
      { source: "main", target: "routes", label: "mount" },
      { source: "main", target: "auth", label: "middleware" },
      { source: "routes", target: "ml", label: "inference" },
      { source: "routes", target: "db", label: "store" },
      { source: "ml", target: "models", label: "load" },
      { source: "auth", target: "db", label: "verify key" },
      { source: "main", target: "config", label: "load" },
    ],
    techStack: { runtime: "Python 3.11", framework: "FastAPI", database: "MongoDB", ml: "scikit-learn", storage: "AWS S3", testing: "pytest" },
    summary: "FastAPI ML prediction API with scikit-learn models, MongoDB storage, S3 model artifacts, and API key authentication with rate limiting.",
    entryPoints: ["app/main.py"],
    keyPatterns: ["Dependency injection", "Pydantic models", "Async/await pattern", "Repository pattern"],
  },
};

const DEMO_CONVENTIONS: Record<string, object[]> = {
  "demo/express-shop": [
    { category: "Architecture", pattern: "Three-layer architecture", description: "All business logic goes through Routes → Services → Database. Controllers never access DB directly.", examples: ["routes/products.ts → productService.ts → prisma.ts"], confidence: 0.95, severity: "must-follow", doExample: "router.post('/products', (req, res) => productService.create(req.body))", dontExample: "router.post('/products', (req, res) => prisma.product.create(req.body))" },
    { category: "Error Handling", pattern: "Async error wrapper", description: "Every async route handler is wrapped in try/catch with consistent error response format.", examples: ["try { ... } catch(err) { res.status(500).json({ error: err.message }) }"], confidence: 0.9, severity: "must-follow" },
    { category: "Naming", pattern: "camelCase for variables, PascalCase for types", description: "Consistent JavaScript naming conventions throughout the codebase.", examples: ["productService", "OrderStatus", "getUserById"], confidence: 0.95, severity: "should-follow" },
    { category: "Testing", pattern: "Integration tests per route", description: "Each route file has a corresponding .test.ts with supertest integration tests.", examples: ["routes/products.test.ts", "routes/orders.test.ts"], confidence: 0.85, severity: "should-follow" },
    { category: "API Design", pattern: "RESTful resource naming", description: "API endpoints follow REST conventions. Plural nouns, proper HTTP methods.", examples: ["GET /products", "POST /orders", "PATCH /users/:id"], confidence: 0.9, severity: "must-follow" },
  ],
  "demo/react-dashboard": [
    { category: "Architecture", pattern: "Component-hook separation", description: "UI components are pure renderers. Logic lives in custom hooks (useAuth, useData, etc.).", examples: ["Chart.tsx uses useData() hook", "Sidebar.tsx uses useAuth() hook"], confidence: 0.9, severity: "must-follow" },
    { category: "Styling", pattern: "Tailwind utility classes", description: "All styling via Tailwind CSS utilities. No custom CSS files except globals.css.", examples: ["className=\"flex items-center gap-4 p-6 bg-gray-900\""], confidence: 0.95, severity: "must-follow" },
    { category: "State Management", pattern: "Zustand for global, useState for local", description: "Global state in Zustand store. Component-local state in useState/useReducer.", examples: ["dashboardStore.ts", "const [open, setOpen] = useState(false)"], confidence: 0.85, severity: "should-follow" },
    { category: "Naming", pattern: "use* prefix for hooks", description: "All custom hooks prefixed with 'use'. Components in PascalCase.", examples: ["useAuth", "useRealtime", "DataTable"], confidence: 0.95, severity: "must-follow" },
  ],
  "demo/python-ml-api": [
    { category: "Architecture", pattern: "Dependency injection", description: "FastAPI Depends() for database connections, auth, and model loading. No global state.", examples: ["def predict(model: MLModel = Depends(get_model))"], confidence: 0.9, severity: "must-follow" },
    { category: "Naming", pattern: "snake_case everywhere", description: "Python PEP 8 naming: snake_case for functions/variables, PascalCase for classes.", examples: ["get_prediction", "ModelStore", "prediction_router"], confidence: 0.95, severity: "must-follow" },
    { category: "API Design", pattern: "Pydantic request/response models", description: "Every endpoint has typed Pydantic models for request body and response.", examples: ["class PredictRequest(BaseModel): features: list[float]"], confidence: 0.9, severity: "must-follow" },
  ],
};

const DEMO_WALKTHROUGHS: Record<string, object[]> = {
  "demo/express-shop": [
    {
      id: "wt-auth-flow",
      repoId: "demo/express-shop",
      title: "Authentication Flow",
      description: "How JWT authentication works from login to protected route access.",
      difficulty: "beginner",
      estimatedMinutes: 8,
      question: "How does authentication work?",
      steps: [
        { stepNumber: 1, file: "src/routes/auth.ts", title: "Login Endpoint", explanation: "User submits email & password to POST /auth/login. Route delegates to authService.", codeSnippet: "router.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  const token = await authService.login(email, password);\n  res.json({ token });\n});" },
        { stepNumber: 2, file: "src/services/authService.ts", title: "Password Verification", explanation: "Service looks up user in DB, compares bcrypt hash. If valid, generates JWT.", codeSnippet: "const user = await prisma.user.findUnique({ where: { email } });\nconst valid = await bcrypt.compare(password, user.passwordHash);\nif (!valid) throw new UnauthorizedError();" },
        { stepNumber: 3, file: "src/services/jwt.ts", title: "Token Generation", explanation: "JWT signed with RS256 algorithm. Contains userId, role, and 24h expiry.", codeSnippet: "jwt.sign({ userId: user.id, role: user.role }, privateKey, {\n  algorithm: 'RS256',\n  expiresIn: '24h'\n});" },
        { stepNumber: 4, file: "src/middleware/auth.ts", title: "Token Validation Middleware", explanation: "Every protected route passes through this middleware. Extracts token from Authorization header, verifies signature.", codeSnippet: "const token = req.headers.authorization?.split(' ')[1];\nconst payload = jwt.verify(token, publicKey);\nreq.user = payload;" },
      ],
      prerequisites: ["Basic Express.js knowledge", "Understanding of HTTP headers"],
      relatedModules: ["auth", "cache"],
      generatedAt: new Date().toISOString(),
    },
    {
      id: "wt-order-flow",
      repoId: "demo/express-shop",
      title: "Order Processing Pipeline",
      description: "How an order flows from cart checkout to payment confirmation.",
      difficulty: "intermediate",
      estimatedMinutes: 12,
      question: "How does order processing work?",
      steps: [
        { stepNumber: 1, file: "src/routes/orders.ts", title: "Create Order", explanation: "POST /orders with cart items. Validates inventory and creates order record." },
        { stepNumber: 2, file: "src/services/orderService.ts", title: "Inventory Check", explanation: "Checks product stock levels. Reserves inventory with DB transaction." },
        { stepNumber: 3, file: "src/services/stripe.ts", title: "Payment Intent", explanation: "Creates Stripe PaymentIntent and returns client secret to frontend." },
        { stepNumber: 4, file: "src/routes/webhooks.ts", title: "Stripe Webhook", explanation: "Receives payment confirmation. Updates order status to 'paid'." },
      ],
      prerequisites: ["Auth flow walkthrough"],
      relatedModules: ["services", "payments", "db"],
      generatedAt: new Date().toISOString(),
    },
  ],
  "demo/react-dashboard": [
    {
      id: "wt-data-flow",
      repoId: "demo/react-dashboard",
      title: "Data Fetching & Real-time Updates",
      description: "How data flows from Supabase to charts with real-time subscriptions.",
      difficulty: "beginner",
      estimatedMinutes: 10,
      question: "How does data fetching work?",
      steps: [
        { stepNumber: 1, file: "src/hooks/useData.ts", title: "Custom Data Hook", explanation: "useData() hook wraps SWR for automatic caching, revalidation, and error handling." },
        { stepNumber: 2, file: "src/lib/api.ts", title: "API Client", explanation: "Typed API client that calls Supabase queries with proper auth headers." },
        { stepNumber: 3, file: "src/hooks/useRealtime.ts", title: "Real-time Subscriptions", explanation: "Supabase real-time channels push updates when data changes in PostgreSQL." },
        { stepNumber: 4, file: "src/components/Chart.tsx", title: "Chart Rendering", explanation: "Recharts components receive data from hooks and render with smooth animations." },
      ],
      prerequisites: ["React hooks basics"],
      relatedModules: ["hooks", "api", "components"],
      generatedAt: new Date().toISOString(),
    },
  ],
  "demo/python-ml-api": [
    {
      id: "wt-predict",
      repoId: "demo/python-ml-api",
      title: "ML Prediction Pipeline",
      description: "How a prediction request flows through preprocessing, inference, and storage.",
      difficulty: "intermediate",
      estimatedMinutes: 10,
      question: "How does the prediction pipeline work?",
      steps: [
        { stepNumber: 1, file: "app/routes/predict.py", title: "Prediction Endpoint", explanation: "POST /predict accepts feature vector. Uses FastAPI dependency injection to load model." },
        { stepNumber: 2, file: "app/ml/preprocessor.py", title: "Feature Preprocessing", explanation: "Normalizes input features, handles missing values, applies feature engineering." },
        { stepNumber: 3, file: "app/ml/predictor.py", title: "Model Inference", explanation: "Loaded scikit-learn model runs predict(). Supports multiple model versions." },
        { stepNumber: 4, file: "app/db/mongo.py", title: "Result Storage", explanation: "Prediction result + metadata stored in MongoDB for analytics and audit trail." },
      ],
      prerequisites: ["Basic ML concepts", "Python async/await"],
      relatedModules: ["ml", "routes", "db"],
      generatedAt: new Date().toISOString(),
    },
  ],
};

const DEMO_ENV_SETUP: Record<string, object> = {
  "demo/express-shop": {
    setupSteps: [
      { order: 1, category: "runtime", title: "Install Node.js 18", command: "nvm install 18 && nvm use 18", description: "Project requires Node.js 18 (detected from .nvmrc and engines field).", source: ".nvmrc", required: true, platform: "all", verifyCommand: "node --version", expectedOutput: "v18." },
      { order: 2, category: "package-manager", title: "Install pnpm", command: "npm install -g pnpm@8", description: "pnpm 8 required (packageManager field in package.json).", source: "package.json", required: true, platform: "all" },
      { order: 3, category: "package-manager", title: "Install dependencies", command: "pnpm install", description: "Install all project dependencies.", source: "package.json", required: true, platform: "all" },
      { order: 4, category: "database", title: "Start PostgreSQL", command: "docker compose up -d postgres", description: "Start PostgreSQL container defined in docker-compose.yml.", source: "docker-compose.yml", required: true, platform: "all" },
      { order: 5, category: "cache", title: "Start Redis", command: "docker compose up -d redis", description: "Start Redis container for session management and caching.", source: "docker-compose.yml", required: true, platform: "all" },
      { order: 6, category: "env-vars", title: "Configure environment", command: "cp .env.example .env", description: "Copy environment template and fill in required values.", source: ".env.example", required: true, platform: "all" },
      { order: 7, category: "database", title: "Run database migrations", command: "pnpm prisma migrate dev", description: "Apply Prisma schema migrations to PostgreSQL.", source: "prisma/schema.prisma", required: true, platform: "all" },
      { order: 8, category: "build", title: "Start development server", command: "pnpm dev", description: "Start Express server with hot-reload on port 3000.", source: "package.json", required: true, platform: "all" },
    ],
    conflicts: [
      { severity: "warning", description: "README says Node 16, but package.json engines requires Node 18", sources: ["README.md", "package.json"], resolution: "Use Node 18 as specified in .nvmrc — the README is outdated." },
      { severity: "warning", description: "Redis connection URL format differs between .env.example and docker-compose", sources: [".env.example", "docker-compose.yml"], resolution: "Use redis://localhost:6379 (docker-compose default)." },
    ],
    missingPieces: [
      { severity: "error", description: "No Stripe webhook secret documented", evidence: "src/routes/webhooks.ts references STRIPE_WEBHOOK_SECRET", suggestion: "Add STRIPE_WEBHOOK_SECRET to .env.example. Get it from Stripe dashboard → Developers → Webhooks." },
      { severity: "info", description: "Seed data script exists but not documented", evidence: "scripts/seed.ts present", suggestion: "Run 'pnpm prisma db seed' after migrations to populate test data." },
    ],
    envVariables: [
      { name: "DATABASE_URL", required: true, description: "PostgreSQL connection string", source: ".env.example", sensitive: true },
      { name: "JWT_SECRET", required: true, description: "Secret key for JWT signing", source: ".env.example", sensitive: true },
      { name: "REDIS_URL", required: true, description: "Redis connection URL", source: ".env.example", defaultValue: "redis://localhost:6379", sensitive: false },
      { name: "STRIPE_SECRET_KEY", required: true, description: "Stripe API secret key", source: ".env.example", sensitive: true },
      { name: "STRIPE_WEBHOOK_SECRET", required: true, description: "Stripe webhook endpoint secret", source: "src/routes/webhooks.ts", sensitive: true },
      { name: "PORT", required: false, description: "Server port", source: ".env.example", defaultValue: "3000", sensitive: false },
    ],
    dockerSupport: {
      hasDockerfile: true,
      hasCompose: true,
      composeServices: ["app", "postgres", "redis"],
      quickStart: "docker compose up -d",
    },
    estimatedSetupTime: "10 minutes",
    requiredTools: ["Node.js 18", "pnpm 8", "Docker"],
    summary: "Express.js e-commerce API. Requires Node 18, pnpm, PostgreSQL, and Redis. Docker Compose available for database services. 8 setup steps with 2 documentation conflicts detected.",
  },
  "demo/react-dashboard": {
    setupSteps: [
      { order: 1, category: "runtime", title: "Install Node.js 18", command: "nvm install 18", description: "Node 18 required.", source: "package.json", required: true, platform: "all" },
      { order: 2, category: "package-manager", title: "Install dependencies", command: "npm install", description: "Install all project dependencies.", source: "package.json", required: true, platform: "all" },
      { order: 3, category: "env-vars", title: "Configure Supabase", command: "cp .env.local.example .env.local", description: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.", source: ".env.local.example", required: true, platform: "all" },
      { order: 4, category: "build", title: "Start dev server", command: "npm run dev", description: "Start Next.js dev server on port 3000.", source: "package.json", required: true, platform: "all" },
    ],
    conflicts: [],
    missingPieces: [
      { severity: "info", description: "Supabase project setup not documented", evidence: "Uses Supabase but no setup guide", suggestion: "Create a Supabase project at supabase.com and copy the URL + anon key to .env.local." },
    ],
    envVariables: [
      { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, description: "Supabase project URL", source: ".env.local.example", sensitive: false },
      { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, description: "Supabase anonymous key", source: ".env.local.example", sensitive: false },
    ],
    dockerSupport: { hasDockerfile: false, hasCompose: false },
    estimatedSetupTime: "5 minutes",
    requiredTools: ["Node.js 18", "npm"],
    summary: "Next.js 14 dashboard. Simple setup — just npm install and configure Supabase credentials. No Docker required.",
  },
  "demo/python-ml-api": {
    setupSteps: [
      { order: 1, category: "runtime", title: "Install Python 3.11", command: "pyenv install 3.11.0 && pyenv local 3.11.0", description: "Python 3.11 required (.python-version detected).", source: ".python-version", required: true, platform: "all" },
      { order: 2, category: "package-manager", title: "Create virtual environment", command: "python -m venv venv && source venv/bin/activate", description: "Isolate project dependencies in a virtual environment.", source: "requirements.txt", required: true, platform: "all" },
      { order: 3, category: "package-manager", title: "Install dependencies", command: "pip install -r requirements.txt", description: "Install all Python dependencies.", source: "requirements.txt", required: true, platform: "all" },
      { order: 4, category: "database", title: "Start MongoDB", command: "docker compose up -d mongodb", description: "Start MongoDB container.", source: "docker-compose.yml", required: true, platform: "all" },
      { order: 5, category: "env-vars", title: "Configure environment", command: "cp .env.example .env", description: "Set MongoDB URI, S3 bucket, and model path.", source: ".env.example", required: true, platform: "all" },
      { order: 6, category: "build", title: "Start FastAPI server", command: "uvicorn app.main:app --reload", description: "Start FastAPI with auto-reload on port 8000.", source: "README.md", required: true, platform: "all" },
    ],
    conflicts: [
      { severity: "warning", description: "requirements.txt pins scikit-learn==1.2.0 but code uses 1.3 features", sources: ["requirements.txt", "app/ml/predictor.py"], resolution: "Update scikit-learn to >=1.3.0 in requirements.txt." },
    ],
    missingPieces: [],
    envVariables: [
      { name: "MONGODB_URI", required: true, description: "MongoDB connection string", source: ".env.example", defaultValue: "mongodb://localhost:27017/ml_api", sensitive: false },
      { name: "MODEL_PATH", required: true, description: "Path to ML model artifacts", source: ".env.example", sensitive: false },
      { name: "API_KEY_SALT", required: true, description: "Salt for API key hashing", source: ".env.example", sensitive: true },
    ],
    dockerSupport: { hasDockerfile: true, hasCompose: true, composeServices: ["app", "mongodb"], quickStart: "docker compose up -d" },
    estimatedSetupTime: "8 minutes",
    requiredTools: ["Python 3.11", "pip", "Docker"],
    summary: "FastAPI ML API. Requires Python 3.11, MongoDB (Docker), and model artifacts. 6 setup steps, 1 dependency version conflict detected.",
  },
};

const DEMO_ANIMATED_SEQUENCES: Record<string, object[]> = {
  "demo/express-shop": [
    {
      id: "seq-auth-flow",
      title: "Authentication Flow",
      description: "How a user login request travels through the system",
      category: "auth-flow",
      steps: [
        { stepNumber: 1, nodeId: "entry", label: "Request Arrives", explanation: "HTTP POST /auth/login hits the Express server", duration: 2000 },
        { stepNumber: 2, nodeId: "routes", label: "Route Matching", explanation: "Express router matches /auth/login to the auth route handler", duration: 2000 },
        { stepNumber: 3, nodeId: "services", label: "Auth Service", explanation: "authService.login() verifies credentials against the database", duration: 2500 },
        { stepNumber: 4, nodeId: "db", label: "User Lookup", explanation: "Prisma queries PostgreSQL to find user by email", duration: 2000 },
        { stepNumber: 5, nodeId: "auth", label: "JWT Generation", explanation: "JWT token signed with RS256 and 24h expiry", duration: 2000 },
        { stepNumber: 6, nodeId: "cache", label: "Session Cache", explanation: "Session stored in Redis for fast validation on subsequent requests", duration: 1500 },
      ],
      estimatedDuration: 12,
    },
    {
      id: "seq-order-flow",
      title: "Order Processing",
      description: "How an order flows from cart to payment confirmation",
      category: "request-flow",
      steps: [
        { stepNumber: 1, nodeId: "entry", label: "Checkout Request", explanation: "User clicks checkout — POST /orders with cart items", duration: 2000 },
        { stepNumber: 2, nodeId: "auth", label: "Auth Check", explanation: "JWT middleware validates the user's token", duration: 1500 },
        { stepNumber: 3, nodeId: "routes", label: "Order Route", explanation: "Request routed to order handler", duration: 1500 },
        { stepNumber: 4, nodeId: "services", label: "Inventory Check", explanation: "Service layer checks stock levels for all items", duration: 2000 },
        { stepNumber: 5, nodeId: "db", label: "Reserve Stock", explanation: "Database transaction reserves inventory", duration: 2000 },
        { stepNumber: 6, nodeId: "payments", label: "Stripe Charge", explanation: "Stripe PaymentIntent created with order total", duration: 2500 },
      ],
      estimatedDuration: 12,
    },
  ],
  "demo/react-dashboard": [
    {
      id: "seq-data-load",
      title: "Dashboard Data Loading",
      description: "How data flows from Supabase to rendered charts",
      category: "data-pipeline",
      steps: [
        { stepNumber: 1, nodeId: "app", label: "Page Load", explanation: "User navigates to /dashboard — Next.js renders the page", duration: 2000 },
        { stepNumber: 2, nodeId: "pages", label: "Dashboard Page", explanation: "Dashboard page component mounts and triggers data hooks", duration: 1500 },
        { stepNumber: 3, nodeId: "hooks", label: "useData Hook", explanation: "SWR hook checks cache, then fetches fresh data", duration: 2000 },
        { stepNumber: 4, nodeId: "api", label: "API Request", explanation: "Typed API client calls Supabase with auth headers", duration: 2000 },
        { stepNumber: 5, nodeId: "supabase", label: "Database Query", explanation: "Supabase PostgreSQL returns analytics data", duration: 2000 },
        { stepNumber: 6, nodeId: "components", label: "Chart Render", explanation: "Recharts components animate the data into visual charts", duration: 2000 },
      ],
      estimatedDuration: 12,
    },
  ],
  "demo/python-ml-api": [
    {
      id: "seq-predict",
      title: "Prediction Request",
      description: "How a prediction request flows through the ML pipeline",
      category: "request-flow",
      steps: [
        { stepNumber: 1, nodeId: "main", label: "API Request", explanation: "POST /predict with feature vector arrives at FastAPI", duration: 2000 },
        { stepNumber: 2, nodeId: "auth", label: "API Key Check", explanation: "Middleware validates API key and checks rate limit", duration: 1500 },
        { stepNumber: 3, nodeId: "routes", label: "Predict Route", explanation: "Pydantic model validates request body types", duration: 1500 },
        { stepNumber: 4, nodeId: "ml", label: "ML Inference", explanation: "Preprocessor normalizes features, model runs prediction", duration: 2500 },
        { stepNumber: 5, nodeId: "models", label: "Model Load", explanation: "Model artifact loaded from S3 (cached in memory)", duration: 2000 },
        { stepNumber: 6, nodeId: "db", label: "Store Result", explanation: "Prediction + metadata stored in MongoDB for analytics", duration: 1500 },
      ],
      estimatedDuration: 11,
    },
  ],
};

const DEMO_PROGRESS: Record<string, object> = {
  "demo/express-shop": {
    userId: "demo-user",
    repoId: "demo/express-shop",
    overallScore: 72,
    skills: [
      { area: "architecture", score: 85, modulesExplored: 5, totalModules: 8, lastActivity: new Date(Date.now() - 600_000).toISOString() },
      { area: "auth", score: 90, modulesExplored: 2, totalModules: 2, lastActivity: new Date(Date.now() - 300_000).toISOString() },
      { area: "api", score: 75, modulesExplored: 3, totalModules: 3, lastActivity: new Date(Date.now() - 900_000).toISOString() },
      { area: "database", score: 60, modulesExplored: 1, totalModules: 2, lastActivity: new Date(Date.now() - 1200_000).toISOString() },
      { area: "testing", score: 45, modulesExplored: 1, totalModules: 2, lastActivity: new Date(Date.now() - 1800_000).toISOString() },
      { area: "infrastructure", score: 30, modulesExplored: 0, totalModules: 2, lastActivity: new Date(Date.now() - 3600_000).toISOString() },
      { area: "frontend", score: 0, modulesExplored: 0, totalModules: 0, lastActivity: "" },
      { area: "devops", score: 20, modulesExplored: 0, totalModules: 1, lastActivity: new Date(Date.now() - 5400_000).toISOString() },
      { area: "other", score: 50, modulesExplored: 1, totalModules: 2, lastActivity: new Date(Date.now() - 2400_000).toISOString() },
    ],
    totalTimeSpentMs: 7_200_000,
    walkthroughsCompleted: 4,
    questionsAsked: 12,
    modulesExplored: 6,
    conventionsViewed: 5,
    firstActivity: new Date(Date.now() - 7_200_000).toISOString(),
    lastActivity: new Date(Date.now() - 300_000).toISOString(),
    timeline: [
      { timestamp: new Date(Date.now() - 7_200_000).toISOString(), overallScore: 0, eventDescription: "Started onboarding" },
      { timestamp: new Date(Date.now() - 6_000_000).toISOString(), overallScore: 15, eventDescription: "Viewed architecture map" },
      { timestamp: new Date(Date.now() - 5_400_000).toISOString(), overallScore: 25, eventDescription: "Completed Auth walkthrough" },
      { timestamp: new Date(Date.now() - 4_200_000).toISOString(), overallScore: 35, eventDescription: "Asked 3 Q&A questions" },
      { timestamp: new Date(Date.now() - 3_600_000).toISOString(), overallScore: 45, eventDescription: "Explored API routes module" },
      { timestamp: new Date(Date.now() - 2_400_000).toISOString(), overallScore: 55, eventDescription: "Completed Order flow walkthrough" },
      { timestamp: new Date(Date.now() - 1_200_000).toISOString(), overallScore: 65, eventDescription: "Explored database layer" },
      { timestamp: new Date(Date.now() - 300_000).toISOString(), overallScore: 72, eventDescription: "Viewed conventions + asked 5 more questions" },
    ],
  },
};

// ─── API Routes ───

// GET /api/demo/repos — list demo repos
demoRoutes.get("/repos", (_req, res) => {
  res.json({ repos: DEMO_REPOS });
});

// GET /api/demo/repos/:owner/:repo — single demo repo
demoRoutes.get("/repos/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const repo = DEMO_REPOS.find((r) => r.repoId === repoId);
  if (!repo) { res.status(404).json({ error: "Demo repo not found" }); return; }
  res.json(repo);
});

// GET /api/demo/analysis/:owner/:repo/architecture
demoRoutes.get("/analysis/:owner/:repo/architecture", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const arch = DEMO_ARCHITECTURES[repoId];
  if (!arch) { res.status(404).json({ error: "Demo architecture not found" }); return; }
  // Frontend expects data.content or data.nodes
  res.json({ content: arch });
});

// GET /api/demo/analysis/:owner/:repo/conventions
demoRoutes.get("/analysis/:owner/:repo/conventions", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  res.json({ conventions: DEMO_CONVENTIONS[repoId] ?? [] });
});

// GET /api/demo/conventions/:owner/:repo — alias for frontend pattern
demoRoutes.get("/conventions/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  res.json({ conventions: DEMO_CONVENTIONS[repoId] ?? [] });
});

// GET /api/demo/walkthroughs/:owner/:repo
demoRoutes.get("/walkthroughs/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  res.json({ walkthroughs: DEMO_WALKTHROUGHS[repoId] ?? [] });
});

// GET /api/demo/env-setup/:owner/:repo
demoRoutes.get("/env-setup/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const guide = DEMO_ENV_SETUP[repoId];
  if (!guide) { res.status(404).json({ error: "Demo env setup not found" }); return; }
  // Frontend expects data.envSetup
  res.json({ envSetup: guide });
});

// GET /api/demo/animated/:owner/:repo — frontend fetches this pattern
demoRoutes.get("/animated/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  res.json({ sequences: DEMO_ANIMATED_SEQUENCES[repoId] ?? [] });
});

// GET /api/demo/animated/:owner/:repo/sequences — alternate pattern
demoRoutes.get("/animated/:owner/:repo/sequences", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  res.json({ sequences: DEMO_ANIMATED_SEQUENCES[repoId] ?? [] });
});

// POST /api/demo/animated/:owner/:repo/generate — return pre-existing sequences
demoRoutes.post("/animated/:owner/:repo/generate", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  res.json({ sequences: DEMO_ANIMATED_SEQUENCES[repoId] ?? [] });
});

// POST /api/demo/animated/:owner/:repo/explain-node — pre-canned node explanation
demoRoutes.post("/animated/:owner/:repo/explain-node", (req, res) => {
  const { nodeId } = req.body;
  const explanations: Record<string, string> = {
    "api-gateway": "The API Gateway is the entry point for all HTTP requests. It handles routing, rate limiting, and request validation before dispatching to the appropriate service handler.",
    "auth-service": "The Authentication Service manages user identity. It handles login/logout, JWT token generation and verification, password hashing with bcrypt, and session management via Redis.",
    "product-catalog": "The Product Catalog service manages the inventory of items. It handles CRUD operations for products, categories, and pricing with full-text search via PostgreSQL tsvector.",
    "order-engine": "The Order Engine orchestrates the checkout flow: cart validation → inventory reservation → payment processing → order confirmation. It uses database transactions to ensure atomicity.",
    "payment-processor": "The Payment Processor integrates with Stripe for secure payment handling. It creates PaymentIntents, handles webhooks for async confirmation, and manages refund flows.",
    "database-layer": "The Database Layer uses Prisma ORM with PostgreSQL. It provides type-safe queries, migration management, and connection pooling for production workloads.",
    "cache-layer": "The Cache Layer uses Redis for high-performance data caching. It caches session data, product listings, and frequently accessed queries with configurable TTL.",
  };
  res.json({ explanation: explanations[nodeId] || `The ${nodeId} module handles its designated functionality within the application architecture. It follows clean separation of concerns and communicates with other modules through well-defined interfaces.` });
});

// GET /api/demo/progress/:owner/:repo/team — team progress
demoRoutes.get("/progress/:owner/:repo/team", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const primary = DEMO_PROGRESS[repoId];

  const member2 = {
    userId: "priya-dev", repoId, overallScore: 58,
    skills: [
      { area: "architecture", score: 70, modulesExplored: 4, totalModules: 8, lastActivity: new Date(Date.now() - 1800_000).toISOString() },
      { area: "auth", score: 45, modulesExplored: 1, totalModules: 2, lastActivity: new Date(Date.now() - 3600_000).toISOString() },
      { area: "api", score: 80, modulesExplored: 3, totalModules: 3, lastActivity: new Date(Date.now() - 600_000).toISOString() },
      { area: "database", score: 55, modulesExplored: 1, totalModules: 2, lastActivity: new Date(Date.now() - 2400_000).toISOString() },
      { area: "testing", score: 35, modulesExplored: 0, totalModules: 2, lastActivity: "" },
    ],
    totalTimeSpentMs: 5_400_000, walkthroughsCompleted: 3, questionsAsked: 8,
    modulesExplored: 4, conventionsViewed: 3,
    firstActivity: new Date(Date.now() - 5_400_000).toISOString(),
    lastActivity: new Date(Date.now() - 600_000).toISOString(), timeline: [],
  };

  const member3 = {
    userId: "arjun-new", repoId, overallScore: 25,
    skills: [
      { area: "architecture", score: 40, modulesExplored: 2, totalModules: 8, lastActivity: new Date(Date.now() - 3600_000).toISOString() },
      { area: "auth", score: 20, modulesExplored: 0, totalModules: 2, lastActivity: "" },
      { area: "api", score: 30, modulesExplored: 1, totalModules: 3, lastActivity: new Date(Date.now() - 7200_000).toISOString() },
    ],
    totalTimeSpentMs: 1_800_000, walkthroughsCompleted: 1, questionsAsked: 3,
    modulesExplored: 2, conventionsViewed: 1,
    firstActivity: new Date(Date.now() - 1_800_000).toISOString(),
    lastActivity: new Date(Date.now() - 3600_000).toISOString(), timeline: [],
  };

  const members = primary ? [primary, member2, member3] : [member2, member3];

  res.json({
    repoId, members,
    averageScore: Math.round(members.reduce((s: number, m: any) => s + m.overallScore, 0) / members.length),
    averageTimeToOnboard: 4_800_000,
    topAreas: [{ area: "auth", score: 52 }, { area: "api", score: 62 }],
    weakAreas: [{ area: "testing", score: 27 }, { area: "infrastructure", score: 10 }],
  });
});

// GET /api/demo/progress/:owner/:repo/leaderboard
demoRoutes.get("/progress/:owner/:repo/leaderboard", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  res.json({
    leaderboard: [
      { rank: 1, userId: "demo-user", overallScore: 72, totalTimeSpentMs: 7_200_000, walkthroughsCompleted: 5, questionsAsked: 12, modulesExplored: 6, strongestArea: "auth" },
      { rank: 2, userId: "priya-dev", overallScore: 58, totalTimeSpentMs: 5_400_000, walkthroughsCompleted: 3, questionsAsked: 8, modulesExplored: 4, strongestArea: "api" },
      { rank: 3, userId: "arjun-new", overallScore: 25, totalTimeSpentMs: 1_800_000, walkthroughsCompleted: 1, questionsAsked: 3, modulesExplored: 2, strongestArea: "architecture" },
    ],
  });
});

// GET /api/demo/progress/:owner/:repo/:userId — individual progress
demoRoutes.get("/progress/:owner/:repo/:userId", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const progress = DEMO_PROGRESS[repoId];
  if (!progress) {
    res.json({ userId: req.params.userId, repoId, overallScore: 0, skills: [], totalTimeSpentMs: 0, walkthroughsCompleted: 0, questionsAsked: 0, modulesExplored: 0, conventionsViewed: 0, firstActivity: "", lastActivity: "", timeline: [] });
    return;
  }
  res.json(progress);
});

// POST /api/demo/qa/:owner/:repo — demo Q&A matching frontend pattern
demoRoutes.post("/qa/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { question } = req.body;
  handleDemoQA(res, question, repoId);
});

// POST /api/demo/qa — demo Q&A (legacy pattern)
demoRoutes.post("/qa", (req, res) => {
  const { question, repoId } = req.body;
  handleDemoQA(res, question, repoId);
});

function handleDemoQA(res: any, question: string, repoId: string) {
  const q = (question || "").toLowerCase();

  let answer = "This is a great question! In this codebase, the implementation follows a clean architecture pattern. Let me walk you through the key files and concepts.";
  let relevantFiles: object[] = [];
  let relatedQuestions: string[] = [];

  if (repoId === "demo/express-shop") {
    if (q.includes("auth")) {
      answer = "Authentication in this Express shop uses JWT tokens with RS256 signing. When a user logs in via POST /auth/login, the server verifies their password against a bcrypt hash stored in PostgreSQL, then generates a JWT with a 24-hour expiry. Every protected route passes through the auth middleware (src/middleware/auth.ts) which extracts the token from the Authorization header and verifies its signature. Sessions are cached in Redis for fast lookup.";
      relevantFiles = [{ path: "src/middleware/auth.ts" }, { path: "src/services/jwt.ts" }, { path: "src/services/authService.ts" }];
      relatedQuestions = ["How does session management work?", "What happens when a token expires?", "How are roles enforced?"];
    } else if (q.includes("order") || q.includes("payment")) {
      answer = "Orders flow through a pipeline: cart items → inventory check → Stripe payment → confirmation. The orderService runs a Prisma transaction to reserve inventory atomically, then creates a Stripe PaymentIntent. A webhook listener (src/routes/webhooks.ts) handles asynchronous payment confirmation from Stripe and updates the order status.";
      relevantFiles = [{ path: "src/services/orderService.ts" }, { path: "src/services/stripe.ts" }, { path: "src/routes/webhooks.ts" }];
      relatedQuestions = ["How does inventory management work?", "What happens if payment fails?", "How are refunds handled?"];
    } else if (q.includes("database") || q.includes("prisma")) {
      answer = "The database layer uses Prisma ORM with PostgreSQL. The schema (prisma/schema.prisma) defines tables for users, products, orders, and inventory. All database access goes through the service layer — routes never query Prisma directly. Migrations are managed with 'prisma migrate dev'.";
      relevantFiles = [{ path: "prisma/schema.prisma" }, { path: "src/db/prisma.ts" }];
      relatedQuestions = ["How do migrations work?", "What indexes are defined?", "How is data seeded?"];
    } else {
      answer = "This Express.js e-commerce API follows a clean 3-layer architecture: Routes → Services → Database. It uses JWT authentication, Prisma ORM with PostgreSQL, Redis for caching, and Stripe for payments. The codebase has 87 files organized into clear modules: auth, products, orders, and payments.";
      relevantFiles = [{ path: "src/index.ts" }, { path: "src/routes/" }, { path: "src/services/" }];
      relatedQuestions = ["How does authentication work?", "How are orders processed?", "What is the database schema?"];
    }
  } else if (repoId === "demo/react-dashboard") {
    answer = "This Next.js 14 dashboard uses the App Router pattern with server and client components. Data fetching uses SWR hooks (src/hooks/useData.ts) with Supabase as the backend. Real-time updates come through Supabase channels. State is managed with Zustand for global state and useState for local component state.";
    relevantFiles = [{ path: "src/app/dashboard/page.tsx" }, { path: "src/hooks/useData.ts" }, { path: "src/lib/supabase.ts" }];
    relatedQuestions = ["How does real-time sync work?", "How is authentication handled?", "What charts library is used?"];
  } else if (repoId === "demo/python-ml-api") {
    answer = "This FastAPI ML API serves predictions via a clean pipeline: request validation (Pydantic) → preprocessing → model inference → result storage. Models are loaded from S3 and cached in memory. MongoDB stores prediction results for analytics. API key authentication with rate limiting protects endpoints.";
    relevantFiles = [{ path: "app/main.py" }, { path: "app/ml/predictor.py" }, { path: "app/routes/predict.py" }];
    relatedQuestions = ["How are models versioned?", "What preprocessing steps are applied?", "How does rate limiting work?"];
  }

  res.json({ answer, relevantFiles, relatedQuestions });
}

// POST /api/demo/i18n/translate — demo translation
demoRoutes.post("/i18n/translate", (req, res) => {
  const { text, targetLanguage } = req.body;

  const translations: Record<string, string> = {
    hi: "यह authentication module JWT tokens का उपयोग करता है। जब user login करता है, server एक token generate करता है जो 24 घंटे तक valid रहता है। हर API request में यह token header में भेजा जाता है और middleware verify करता है।",
    ta: "இந்த authentication module JWT tokens பயன்படுத்துகிறது. பயனர் உள்நுழையும்போது, சர்வர் 24 மணி நேரம் செல்லுபடியாகும் ஒரு token உருவாக்குகிறது.",
    te: "ఈ authentication module JWT tokens ఉపయోగిస్తుంది. వినియోగదారు లాగిన్ చేసినప్పుడు, సర్వర్ 24 గంటల వరకు చెల్లుబాటు అయ్యే టోకెన్‌ను జనరేట్ చేస్తుంది.",
    kn: "ಈ authentication module JWT tokens ಬಳಸುತ್ತದೆ. ಬಳಕೆದಾರ ಲಾಗಿನ್ ಮಾಡಿದಾಗ, ಸರ್ವರ್ 24 ಗಂಟೆಗಳ ಕಾಲ ಮಾನ್ಯವಾದ ಟೋಕನ್ ಅನ್ನು ರಚಿಸುತ್ತದೆ.",
    bn: "এই authentication module JWT tokens ব্যবহার করে। ব্যবহারকারী লগিন করলে, সার্ভার ২৪ ঘণ্টা পর্যন্ত বৈধ একটি token তৈরি করে।",
    mr: "हे authentication module JWT tokens वापरते. जेव्हा वापरकर्ता लॉगिन करतो, सर्व्हर 24 तासांसाठी वैध token तयार करतो.",
  };

  const translated = translations[targetLanguage] || text;
  res.json({ language: targetLanguage, originalText: text, translatedText: translated, isFresherMode: false });
});

// GET /api/demo/i18n/languages
demoRoutes.get("/i18n/languages", (_req, res) => {
  res.json({
    languages: [
      { code: "en", name: "English", nativeName: "English" },
      { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
      { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
      { code: "te", name: "Telugu", nativeName: "తెలుగు" },
      { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
      { code: "bn", name: "Bengali", nativeName: "বাংলা" },
      { code: "mr", name: "Marathi", nativeName: "मराठी" },
    ],
  });
});

// POST /api/demo/repos/analyze — instant success for demo
demoRoutes.post("/repos/analyze", (req, res) => {
  const { repoId } = req.body;
  res.json({ repoId, status: "completed", message: "Demo repo already analyzed" });
});

// POST /api/demo/conventions/:owner/:repo — return existing conventions
demoRoutes.post("/conventions/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  res.json({ conventions: DEMO_CONVENTIONS[repoId] ?? [] });
});

// POST /api/demo/walkthroughs/:owner/:repo — generate demo walkthrough
demoRoutes.post("/walkthroughs/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { question } = req.body;
  const q = (question || "").toLowerCase();

  let title = "Code Walkthrough";
  let steps: object[] = [];

  if (repoId === "demo/express-shop") {
    if (q.includes("auth") || q.includes("login")) {
      title = "Authentication Flow Walkthrough";
      steps = [
        { title: "User Login Request", description: "POST /auth/login receives email & password. Express validates input via Joi schema.", file: "src/routes/auth.ts", lineRange: { start: 15, end: 32 } },
        { title: "Password Verification", description: "AuthService hashes the input with bcrypt and compares against the stored hash in PostgreSQL.", file: "src/services/authService.ts", lineRange: { start: 28, end: 45 } },
        { title: "JWT Token Generation", description: "On success, a JWT is signed with RS256 algorithm, containing userId and role. Token expires in 24h.", file: "src/services/jwt.ts", lineRange: { start: 10, end: 25 } },
        { title: "Auth Middleware", description: "Protected routes use authMiddleware which extracts Bearer token, verifies it, and attaches user to req.", file: "src/middleware/auth.ts", lineRange: { start: 1, end: 30 } },
      ];
    } else {
      title = "Order Processing Pipeline";
      steps = [
        { title: "Cart Checkout", description: "User submits cart items via POST /orders. The orderService validates items and checks inventory.", file: "src/services/orderService.ts", lineRange: { start: 45, end: 70 } },
        { title: "Payment Processing", description: "Stripe PaymentIntent is created for the order total. The client-side confirms the payment.", file: "src/services/stripe.ts", lineRange: { start: 20, end: 50 } },
        { title: "Webhook Confirmation", description: "Stripe webhook confirms payment success. Order status moves from 'pending' to 'confirmed'.", file: "src/routes/webhooks.ts", lineRange: { start: 10, end: 35 } },
      ];
    }
  } else {
    title = `Walkthrough: ${question || "General Overview"}`;
    steps = [
      { title: "Entry Point", description: "The application starts from the main entry file, initializing all required services and middleware.", file: "src/index.ts", lineRange: { start: 1, end: 20 } },
      { title: "Core Logic", description: "Business logic is organized into service modules with clear separation of concerns.", file: "src/services/", lineRange: { start: 1, end: 50 } },
    ];
  }

  const walkthrough = {
    id: `wt-demo-${Date.now()}`,
    repoId,
    title,
    steps,
    createdAt: new Date().toISOString(),
  };

  res.json({ walkthrough });
});

// POST /api/demo/env-setup/:owner/:repo — return existing env setup
demoRoutes.post("/env-setup/:owner/:repo", (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const guide = DEMO_ENV_SETUP[repoId];
  if (!guide) { res.status(404).json({ error: "Demo env setup not found" }); return; }
  res.json({ envSetup: guide });
});
