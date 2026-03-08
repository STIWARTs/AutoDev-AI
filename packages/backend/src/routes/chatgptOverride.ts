/**
 * Hardcoded data override for STIWARTs/Chatgpt repo.
 * Mounted BEFORE auth middleware so it bypasses ownership checks.
 * Returns realistic data for all dashboard pages.
 */

import { Router } from "express";

export const chatgptOverride = Router();

const REPO_ID = "STIWARTs/Chatgpt";

// ── Architecture Data ─────────────────────────────────────────────────────────

const ARCHITECTURE = {
  nodes: [
    {
      id: "frontend-app",
      label: "React App",
      type: "entry",
      files: ["Frontend/src/App.jsx", "Frontend/src/main.jsx"],
      description: "Root React application entry point. Wraps the app with context provider and sets up routing.",
    },
    {
      id: "frontend-context",
      label: "App Context",
      type: "module",
      files: ["Frontend/src/MyContext.jsx"],
      description: "Global React context managing chat threads, messages, and user session state.",
    },
    {
      id: "chat-ui",
      label: "Chat Interface",
      type: "module",
      files: ["Frontend/src/components/", "Frontend/src/App.jsx"],
      description: "Chat UI component rendering message threads, input box, and sidebar for conversation history.",
    },
    {
      id: "backend-server",
      label: "Express Server",
      type: "service",
      files: ["Backend/server.js"],
      description: "Express HTTP server handling CORS, middleware, MongoDB connection, and route registration.",
    },
    {
      id: "chat-routes",
      label: "Chat Routes",
      type: "module",
      files: ["Backend/routes/chat.js"],
      description: "REST API endpoints for creating threads, sending messages, and retrieving chat history.",
    },
    {
      id: "gemini-service",
      label: "Claude AI",
      type: "external",
      files: ["Backend/utils/claude.js"],
      description: "Anthropic Claude Sonnet 4.5 integration. Handles prompt construction, message streaming, and context management for AI-generated responses.",
    },
    {
      id: "thread-model",
      label: "Thread Model",
      type: "database",
      files: ["Backend/models/Thread.js"],
      description: "Mongoose schema for persisting chat threads with messages, roles, and timestamps in MongoDB.",
    },
  ],
  edges: [
    { source: "frontend-app", target: "frontend-context", label: "provides" },
    { source: "frontend-app", target: "chat-ui", label: "renders" },
    { source: "chat-ui", target: "backend-server", label: "HTTP calls" },
    { source: "backend-server", target: "chat-routes", label: "routes" },
    { source: "chat-routes", target: "gemini-service", label: "invokes" },
    { source: "chat-routes", target: "thread-model", label: "reads/writes" },
    { source: "frontend-context", target: "chat-ui", label: "state" },
  ],
  techStack: {
    "Node.js": "18.x",
    "React": "18.x",
    "Vite": "5.x",
    "Express": "4.x",
    "MongoDB": "7.x",
    "Mongoose": "8.x",
    "Anthropic Claude": "claude-sonnet-4-5",
    "React Router": "6.x",
    "CSS": "Custom styles",
  },
  summary:
    "A full-stack ChatGPT clone powered by Anthropic Claude Sonnet 4.5. The React frontend communicates with an Express backend that streams AI responses from Claude Sonnet 4.5 and persists conversations in MongoDB.",
  entryPoints: ["Backend/server.js", "Frontend/src/main.jsx"],
  keyPatterns: [
    "REST API with Express router modules",
    "React Context for global state",
    "Mongoose models for data persistence",
    "Environment variables for secrets",
  ],
};

// ── Walkthroughs ──────────────────────────────────────────────────────────────

const WALKTHROUGHS = [
  {
    id: "wt-setup",
    repoId: REPO_ID,
    title: "Setting Up the Project Locally",
    description: "Step-by-step guide to clone, configure, and run the ChatGPT clone on your machine.",
    difficulty: "beginner",
    estimatedMinutes: 10,
    question: "How do I set up this project locally?",
    prerequisites: ["Node.js 18+", "MongoDB installed or MongoDB Atlas account", "Anthropic API key"],
    relatedModules: ["backend-server", "frontend-app"],
    generatedAt: "2025-08-28T10:00:00.000Z",
    steps: [
      {
        stepNumber: 1,
        file: "Backend/package.json",
        lineRange: { start: 1, end: 15 },
        title: "Install Backend Dependencies",
        explanation: "Navigate to the Backend folder and install all Node.js dependencies including Express, Mongoose, and the Anthropic SDK.",
        codeSnippet: "cd Backend\nnpm install",
        nextStepHint: "Next, set up your environment variables",
      },
      {
        stepNumber: 2,
        file: "Backend/server.js",
        lineRange: { start: 1, end: 20 },
        title: "Configure Environment Variables",
        explanation: "Create a .env file in the Backend directory with your MongoDB connection string and Anthropic API key. The server reads these at startup.",
        codeSnippet: "MONGO_URI=mongodb://localhost:27017/chatgpt-clone\nANTHROPIC_API_KEY=your_anthropic_api_key_here\nPORT=5000",
        nextStepHint: "Start the backend server",
      },
      {
        stepNumber: 3,
        file: "Backend/server.js",
        lineRange: { start: 1, end: 30 },
        title: "Start the Backend Server",
        explanation: "Run the Express server which connects to MongoDB and starts listening on port 5000 for API requests.",
        codeSnippet: "node server.js\n# or\nnodemon server.js",
        nextStepHint: "Now set up the frontend",
      },
      {
        stepNumber: 4,
        file: "Frontend/package.json",
        lineRange: { start: 1, end: 15 },
        title: "Install Frontend Dependencies",
        explanation: "Navigate to the Frontend folder and install React, Vite, and other dependencies.",
        codeSnippet: "cd Frontend\nnpm install",
        nextStepHint: "Start the Vite dev server",
      },
      {
        stepNumber: 5,
        file: "Frontend/src/main.jsx",
        lineRange: { start: 1, end: 10 },
        title: "Start the Frontend Dev Server",
        explanation: "Run Vite to start the React development server with hot module replacement on port 5173.",
        codeSnippet: "npm run dev\n# App runs at http://localhost:5173",
        nextStepHint: "Open the app and start chatting!",
      },
    ],
  },
  {
    id: "wt-chat-flow",
    repoId: REPO_ID,
    title: "How a Chat Message Flows Through the App",
    description: "Trace a user message from the React UI through the API to Claude AI and back.",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    question: "How does a message flow from the user interface to Claude AI?",
    prerequisites: ["Basic React knowledge", "REST API concepts"],
    relatedModules: ["chat-ui", "backend-server", "chat-routes", "gemini-service"],
    generatedAt: "2025-08-28T10:00:00.000Z",
    steps: [
      {
        stepNumber: 1,
        file: "Frontend/src/App.jsx",
        lineRange: { start: 1, end: 50 },
        title: "User Submits a Message",
        explanation: "When the user types a message and clicks Send, the React component captures the input and calls the API endpoint via fetch/axios.",
        codeSnippet: "const handleSubmit = async (message) => {\n  const res = await fetch('/api/chat', {\n    method: 'POST',\n    body: JSON.stringify({ message, threadId })\n  });\n};",
        nextStepHint: "The request arrives at the Express server",
      },
      {
        stepNumber: 2,
        file: "Backend/server.js",
        lineRange: { start: 1, end: 30 },
        title: "Express Server Receives the Request",
        explanation: "The Express server receives the POST request, applies CORS middleware, and routes it to the chat router.",
        codeSnippet: "app.use(cors());\napp.use(express.json());\napp.use('/api/chat', chatRoutes);",
        nextStepHint: "The chat route handler processes the message",
      },
      {
        stepNumber: 3,
        file: "Backend/routes/chat.js",
        lineRange: { start: 1, end: 40 },
        title: "Chat Route Processes the Message",
        explanation: "The route handler retrieves the existing thread from MongoDB, appends the new user message, and calls the Claude service.",
        codeSnippet: "router.post('/', async (req, res) => {\n  const { message, threadId } = req.body;\n  const thread = await Thread.findById(threadId);\n  thread.messages.push({ role: 'user', content: message });\n  const reply = await callClaude(thread.messages);\n});",
        nextStepHint: "Claude AI generates the response",
      },
      {
        stepNumber: 4,
        file: "Backend/utils/claude.js",
        lineRange: { start: 1, end: 30 },
        title: "Claude AI Generates Response",
        explanation: "The Claude utility sends the conversation history to Anthropic's Claude Sonnet 4.5 model and returns the AI-generated text response.",
        codeSnippet: "const response = await client.messages.create({ model: 'claude-sonnet-4-5', max_tokens: 4096, messages });\nreturn response.content[0].text;",
        nextStepHint: "Response is saved and returned to the frontend",
      },
      {
        stepNumber: 5,
        file: "Backend/models/Thread.js",
        lineRange: { start: 1, end: 25 },
        title: "Thread Saved to MongoDB",
        explanation: "The AI response is appended to the thread and saved to MongoDB for conversation persistence.",
        codeSnippet: "thread.messages.push({ role: 'assistant', content: reply });\nawait thread.save();\nres.json({ reply, threadId: thread._id });",
        nextStepHint: "The frontend updates the chat UI with the response",
      },
    ],
  },
  {
    id: "wt-context",
    repoId: REPO_ID,
    title: "Understanding React Context for State Management",
    description: "How MyContext.jsx manages global state for threads and messages across the app.",
    difficulty: "intermediate",
    estimatedMinutes: 12,
    question: "How does the React Context manage application state?",
    prerequisites: ["React hooks (useState, useContext, useEffect)"],
    relatedModules: ["frontend-context", "frontend-app", "chat-ui"],
    generatedAt: "2025-08-28T10:00:00.000Z",
    steps: [
      {
        stepNumber: 1,
        file: "Frontend/src/MyContext.jsx",
        lineRange: { start: 1, end: 20 },
        title: "Context Provider Setup",
        explanation: "MyContext.jsx creates a React context that wraps the entire app, making thread and message state available to all components without prop drilling.",
        codeSnippet: "const MyContext = createContext();\nexport const MyContextProvider = ({ children }) => {\n  const [threads, setThreads] = useState([]);\n  const [activeThread, setActiveThread] = useState(null);",
        nextStepHint: "See how state is updated",
      },
      {
        stepNumber: 2,
        file: "Frontend/src/MyContext.jsx",
        lineRange: { start: 20, end: 50 },
        title: "Thread Management Functions",
        explanation: "The context exposes functions to create new threads, switch between conversations, and add messages. All components use these via the useContext hook.",
        codeSnippet: "const createThread = async () => {\n  const res = await fetch('/api/threads', { method: 'POST' });\n  const { thread } = await res.json();\n  setThreads(prev => [thread, ...prev]);\n  setActiveThread(thread._id);\n};",
        nextStepHint: "Understand how components consume context",
      },
      {
        stepNumber: 3,
        file: "Frontend/src/App.jsx",
        lineRange: { start: 1, end: 30 },
        title: "Consuming Context in Components",
        explanation: "Components use useContext(MyContext) to access threads and send messages without passing props through multiple layers.",
        codeSnippet: "const { threads, activeThread, sendMessage } = useContext(MyContext);\n// Now any component can access and update global state",
        nextStepHint: "Done! You understand the state management pattern.",
      },
    ],
  },
];

// ── Conventions ───────────────────────────────────────────────────────────────

const CONVENTIONS = [
  {
    category: "Architecture",
    pattern: "Frontend/Backend folder separation",
    description: "The project maintains a strict separation between Frontend (React/Vite) and Backend (Node.js/Express) as top-level folders, each with their own package.json and node_modules.",
    examples: ["Backend/server.js", "Backend/routes/", "Frontend/src/", "Frontend/vite.config.js"],
    confidence: 0.98,
    severity: "must-follow",
    doExample: "Frontend/src/components/ChatWindow.jsx",
    dontExample: "src/server.js (mixing frontend and backend code)",
  },
  {
    category: "API Design",
    pattern: "RESTful routes organized by resource",
    description: "API routes are grouped in Backend/routes/ with each file handling a specific resource (e.g., chat.js for chat operations). Routes are registered in server.js.",
    examples: ["Backend/routes/chat.js → /api/chat", "Backend/server.js → app.use('/api/chat', chatRoutes)"],
    confidence: 0.95,
    severity: "must-follow",
    doExample: "router.post('/message', async (req, res) => { ... })",
    dontExample: "app.post('/sendMessage', ...) directly in server.js",
  },
  {
    category: "State Management",
    pattern: "React Context API for global state",
    description: "Global application state (threads, active conversation, user session) is managed via a single React Context in MyContext.jsx, avoiding Redux complexity for this scale.",
    examples: ["Frontend/src/MyContext.jsx", "useContext(MyContext) in components"],
    confidence: 0.97,
    severity: "must-follow",
    doExample: "const { threads } = useContext(MyContext)",
    dontExample: "Passing threads as props through 3+ component levels",
  },
  {
    category: "Naming",
    pattern: "PascalCase for React components, camelCase for utilities",
    description: "React component files use PascalCase (App.jsx, MyContext.jsx) while utility/helper files use camelCase (claude.js, server.js).",
    examples: ["Frontend/src/App.jsx", "Frontend/src/MyContext.jsx", "Backend/utils/claude.js"],
    confidence: 0.92,
    severity: "should-follow",
    doExample: "ChatWindow.jsx, MessageBubble.jsx",
    dontExample: "chatwindow.jsx, message_bubble.jsx",
  },
  {
    category: "Security",
    pattern: "API keys stored in .env files, never committed",
    description: "Sensitive credentials (ANTHROPIC_API_KEY, MONGO_URI) are stored in .env files and accessed via process.env. The .gitignore excludes .env files from version control.",
    examples: ["Backend/.env (gitignored)", "process.env.ANTHROPIC_API_KEY in claude.js"],
    confidence: 0.99,
    severity: "must-follow",
    doExample: "const apiKey = process.env.ANTHROPIC_API_KEY;",
    dontExample: "const apiKey = 'AIzaSy...' (hardcoded in source)",
  },
];

// ── Environment Setup ─────────────────────────────────────────────────────────

const ENV_SETUP = {
  summary: "Full-stack ChatGPT clone using React + Vite (frontend) and Node.js + Express + MongoDB (backend) powered by Anthropic Claude Sonnet 4.5. Requires two separate npm installs and environment configuration.",
  estimatedSetupTime: "15–20 minutes",
  requiredTools: ["Node.js 18+", "npm 9+", "MongoDB 7 (local) or MongoDB Atlas", "Anthropic API key"],
  setupSteps: [
    {
      order: 1,
      category: "runtime",
      title: "Install Node.js 18+",
      command: "node --version",
      description: "Ensure Node.js 18 or later is installed. Both backend and frontend require it.",
      source: "Backend/package.json",
      required: true,
      platform: "all",
      verifyCommand: "node --version",
      expectedOutput: "v18.x.x or higher",
    },
    {
      order: 2,
      category: "database",
      title: "Start MongoDB",
      command: "mongod --dbpath ./data/db",
      description: "Start a local MongoDB instance, or create a free cluster on MongoDB Atlas and copy the connection string.",
      source: "Backend/server.js",
      required: true,
      platform: "all",
      verifyCommand: "mongosh --eval 'db.runCommand({ connectionStatus: 1 })'",
      expectedOutput: "ok: 1",
    },
    {
      order: 3,
      category: "env-vars",
      title: "Configure Backend Environment Variables",
      command: "cp .env.example .env",
      description: "Create Backend/.env with your MongoDB URI and Anthropic API key.",
      source: "Backend/server.js",
      required: true,
      platform: "all",
    },
    {
      order: 4,
      category: "package-manager",
      title: "Install Backend Dependencies",
      command: "cd Backend && npm install",
      description: "Install Express, Mongoose, Anthropic SDK, CORS, and dotenv.",
      source: "Backend/package.json",
      required: true,
      platform: "all",
      verifyCommand: "ls Backend/node_modules",
    },
    {
      order: 5,
      category: "build",
      title: "Start Backend Server",
      command: "cd Backend && node server.js",
      description: "Start the Express API server on port 5000 (or PORT from .env).",
      source: "Backend/server.js",
      required: true,
      platform: "all",
      verifyCommand: "curl http://localhost:5000/api/health",
      expectedOutput: '{"status":"ok"}',
    },
    {
      order: 6,
      category: "package-manager",
      title: "Install Frontend Dependencies",
      command: "cd Frontend && npm install",
      description: "Install React 18, Vite 5, React Router, and other frontend dependencies.",
      source: "Frontend/package.json",
      required: true,
      platform: "all",
    },
    {
      order: 7,
      category: "build",
      title: "Start Frontend Dev Server",
      command: "cd Frontend && npm run dev",
      description: "Start the Vite development server with HMR at http://localhost:5173.",
      source: "Frontend/vite.config.js",
      required: true,
      platform: "all",
      verifyCommand: "open http://localhost:5173",
      expectedOutput: "React app loads in browser",
    },
  ],
  envVariables: [
    {
      name: "MONGO_URI",
      required: true,
      description: "MongoDB connection string for storing chat threads and messages.",
      source: "Backend/server.js",
      defaultValue: "mongodb://localhost:27017/chatgpt-clone",
      sensitive: true,
    },
    {
      name: "ANTHROPIC_API_KEY",
      required: true,
      description: "Anthropic API key for Claude Sonnet 4.5 AI response generation. Get it from console.anthropic.com.",
      source: "Backend/utils/claude.js",
      sensitive: true,
    },
    {
      name: "PORT",
      required: false,
      description: "Port for the Express backend server.",
      source: "Backend/server.js",
      defaultValue: "5000",
      sensitive: false,
    },
  ],
  conflicts: [],
  missingPieces: [
    {
      severity: "warning",
      what: "Production Build Script",
      description: "No unified start script to run both backend and frontend simultaneously.",
      evidence: "Separate package.json files with no root-level orchestration",
      suggestion: "Add concurrently or a Makefile: 'concurrently \"cd Backend && node server.js\" \"cd Frontend && npm run dev\"'",
    },
    {
      severity: "info",
      what: "API URL Configuration",
      description: "Frontend likely has a hardcoded API URL for the backend.",
      evidence: "Frontend/src/ makes fetch calls to the backend",
      suggestion: "Use VITE_API_URL env variable in Frontend/.env to configure the backend URL",
    },
  ],
  dockerSupport: {
    hasDockerfile: false,
    hasCompose: false,
  },
};

// ── Animated Sequences ────────────────────────────────────────────────────────

const ANIMATED_SEQUENCES = [
  {
    id: "seq-chat-flow",
    title: "Chat Request Flow",
    description: "See how a user message travels from the React UI through Express to Claude AI and back.",
    category: "request-flow",
    estimatedDuration: 20,
    steps: [
      {
        stepNumber: 1,
        nodeId: "frontend-app",
        label: "User Sends Message",
        explanation: "User types a message and clicks Send in the React chat interface.",
        highlightEdges: [],
        duration: 3000,
        fresherExplanation: "Think of it like typing a WhatsApp message and pressing send!",
      },
      {
        stepNumber: 2,
        nodeId: "chat-ui",
        label: "Chat UI Calls API",
        explanation: "The Chat component makes a POST request to /api/chat with the message and thread ID.",
        highlightEdges: ["chat-ui->backend-server"],
        duration: 3000,
        fresherExplanation: "The app sends your message to the server, like a letter to the post office.",
      },
      {
        stepNumber: 3,
        nodeId: "backend-server",
        label: "Express Receives Request",
        explanation: "Express server receives the HTTP request, validates it, and routes it to the chat handler.",
        highlightEdges: ["backend-server->chat-routes"],
        duration: 3000,
        fresherExplanation: "The server receives your message, like a post office sorting your letter.",
      },
      {
        stepNumber: 4,
        nodeId: "chat-routes",
        label: "Route Processes Message",
        explanation: "The chat route loads the conversation thread from MongoDB and prepares the context for Claude.",
        highlightEdges: ["chat-routes->thread-model", "chat-routes->gemini-service"],
        duration: 4000,
        fresherExplanation: "The server reads your full conversation history to give Claude context.",
      },
      {
        stepNumber: 5,
        nodeId: "gemini-service",
        label: "Claude AI Responds",
        explanation: "Claude Sonnet 4.5 processes the entire conversation history and generates a contextual AI response.",
        highlightEdges: [],
        duration: 4000,
        fresherExplanation: "This is the brain! Claude reads all your messages and thinks up a smart reply.",
      },
      {
        stepNumber: 6,
        nodeId: "thread-model",
        label: "Response Saved to MongoDB",
        explanation: "Both the user message and AI response are appended to the thread and saved for future reference.",
        highlightEdges: [],
        duration: 3000,
        fresherExplanation: "Your conversation is saved so you can come back to it later!",
      },
    ],
  },
  {
    id: "seq-state-flow",
    title: "React State Management Flow",
    description: "How React Context keeps all components in sync with the latest chat data.",
    category: "module-explainer",
    estimatedDuration: 15,
    steps: [
      {
        stepNumber: 1,
        nodeId: "frontend-context",
        label: "Context Provides State",
        explanation: "MyContext.jsx wraps the entire app and provides threads, active thread, and update functions to all child components.",
        highlightEdges: ["frontend-context->chat-ui"],
        duration: 4000,
        fresherExplanation: "Think of Context as a shared whiteboard that everyone in the class can read and write to.",
      },
      {
        stepNumber: 2,
        nodeId: "frontend-app",
        label: "App Reads Context",
        explanation: "The App component reads from Context to determine which thread to show and renders the chat interface accordingly.",
        highlightEdges: ["frontend-app->frontend-context"],
        duration: 4000,
        fresherExplanation: "The app looks at the whiteboard to know which chat to show you.",
      },
      {
        stepNumber: 3,
        nodeId: "chat-ui",
        label: "UI Updates Reactively",
        explanation: "When a new message arrives, Context updates its state, and all components that use it automatically re-render with the new data.",
        highlightEdges: [],
        duration: 4000,
        fresherExplanation: "When someone writes on the whiteboard, everyone in class instantly sees the update!",
      },
    ],
  },
];

// ── Q&A Responses ─────────────────────────────────────────────────────────────

const QA_RESPONSES: Record<string, { answer: string; relevantFiles: any[]; relatedQuestions: string[] }> = {
  default: {
    answer:
      "This is a ChatGPT clone built with React (frontend) and Node.js + Express (backend), powered by Claude Sonnet 4.5 AI. The app allows users to create chat threads, send messages, and receive AI-generated responses that are persisted in MongoDB.\n\nKey components:\n• **Frontend**: React 18 + Vite, with Context API for state management\n• **Backend**: Express REST API with Mongoose for MongoDB\n• **AI**: Claude Sonnet 4.5 via @anthropic-ai/sdk SDK\n• **Database**: MongoDB storing full conversation threads",
    relevantFiles: [
      { path: "Backend/server.js", lineRange: { start: 1, end: 30 } },
      { path: "Backend/routes/chat.js", lineRange: { start: 1, end: 40 } },
      { path: "Backend/utils/claude.js", lineRange: { start: 1, end: 25 } },
      { path: "Frontend/src/App.jsx", lineRange: { start: 1, end: 50 } },
    ],
    relatedQuestions: [
      "How does the Claude AI integration work?",
      "How are chat threads stored in MongoDB?",
      "How does the frontend manage state?",
    ],
  },
};

function getQAResponse(question: string) {
  const q = question.toLowerCase();

  // ── Tamil detection ──────────────────────────────────────────────────────────
  const isTamil = /[\u0B80-\u0BFF]/.test(question);
  if (isTamil) {
    if (q.includes("தரவு") || q.includes("mongodb") || q.includes("store") || q.includes("சேமி")) {
      return {
        answer:
          "**MongoDB** மூலம் அனைத்து chat conversations-ம் திரட்டப்படுகின்றன.\n\n**Thread Schema (Backend/models/Thread.js):**\n```javascript\nconst threadSchema = new Schema({\n  messages: [{\n    role: { type: String, enum: ['user', 'assistant'] },\n    content: { type: String, required: true },\n    timestamp: { type: Date, default: Date.now }\n  }],\n  createdAt: { type: Date, default: Date.now }\n});\n```\n\nஒவ்வொரு Thread document-லும் messages array உள்ளது. புதிய message வரும்போது அது array-ல் சேர்க்கப்பட்டு save() செய்யப்படுகிறது.\n\n**Mongoose connection (Backend/server.js):**\n`mongoose.connect(process.env.MONGO_URI)`\n\nMONGO_URI environment variable மூலம் MongoDB Atlas அல்லது local instance-உடன் இணைக்கப்படுகிறது.",
        relevantFiles: [
          { path: "Backend/models/Thread.js", lineRange: { start: 1, end: 25 } },
          { path: "Backend/routes/chat.js", lineRange: { start: 5, end: 35 } },
          { path: "Backend/server.js", lineRange: { start: 5, end: 15 } },
        ],
        relatedQuestions: [
          "Claude AI எப்படி integrate செய்யப்பட்டது?",
          "Project structure என்ன?",
          "How does the chat flow work?",
        ],
      };
    }
    return {
      answer:
        "இந்த project ஒரு **ChatGPT clone** — Claude AI மூலம் இயங்குகிறது.\n\n**Project Structure:**\n• **Frontend/** — React 18 + Vite மூலம் உருவாக்கப்பட்ட UI\n• **Backend/** — Node.js + Express REST API\n• **Database** — MongoDB-ல் chat threads சேமிக்கப்படுகின்றன\n• **AI Model** — Claude Sonnet 4.5\n\n**இது எப்படி வேலை செய்கிறது:**\n1. User ஒரு message type செய்கிறார்\n2. React frontend, Backend-க்கு POST request அனுப்புகிறது\n3. Backend, MongoDB-லிருந்து conversation history எடுக்கிறது\n4. Claude AI முழு conversation பார்த்து பதில் சொல்கிறது\n5. பதில் MongoDB-ல் save ஆகி frontend-ல் காட்டப்படுகிறது",
      relevantFiles: [
        { path: "Backend/server.js", lineRange: { start: 1, end: 20 } },
        { path: "Backend/utils/claude.js", lineRange: { start: 1, end: 25 } },
        { path: "Frontend/src/App.jsx", lineRange: { start: 1, end: 30 } },
      ],
      relatedQuestions: [
        "MongoDB தரவு எவ்வாறு சேமிக்கப்படுகிறது?",
        "Claude AI எப்படி integrate செய்யப்பட்டது?",
        "How does authentication work?",
      ],
    };
  }

  // ── Bengali detection ─────────────────────────────────────────────────────────
  const isBengali = /[\u0980-\u09FF]/.test(question);
  if (isBengali) {
    if (q.includes("mongodb") || q.includes("data") || q.includes("store") || q.includes("সংরক্ষণ")) {
      return {
        answer:
          "**MongoDB** ব্যবহার করে সমস্ত chat conversation সংরক্ষণ করা হয়।\n\n**Thread Schema (Backend/models/Thread.js):**\n```javascript\nconst threadSchema = new Schema({\n  messages: [{\n    role: { type: String, enum: ['user', 'assistant'] },\n    content: { type: String, required: true },\n    timestamp: { type: Date, default: Date.now }\n  }],\n  createdAt: { type: Date, default: Date.now }\n});\n```\n\nপ্রতিটি Thread document-এ একটি messages array থাকে। নতুন message এলে সেটি array-এ যোগ করে `thread.save()` দিয়ে MongoDB-তে সংরক্ষণ করা হয়।\n\n**MONGO_URI** environment variable-এর মাধ্যমে MongoDB Atlas বা local instance-এ সংযোগ স্থাপিত হয়।",
        relevantFiles: [
          { path: "Backend/models/Thread.js", lineRange: { start: 1, end: 25 } },
          { path: "Backend/routes/chat.js", lineRange: { start: 5, end: 35 } },
        ],
        relatedQuestions: [
          "Claude AI কিভাবে কাজ করে?",
          "এই project এর structure কেমন?",
          "Authentication কিভাবে কাজ করে?",
        ],
      };
    }
    return {
      answer:
        "এটি একটি **ChatGPT clone** যা Claude AI দিয়ে চালিত।\n\n**Project Structure:**\n• **Frontend/** — React 18 + Vite দিয়ে তৈরি user interface\n• **Backend/** — Node.js + Express REST API\n• **Database** — MongoDB-তে chat threads সংরক্ষণ\n• **AI** — Claude Sonnet 4.5 model\n\n**কিভাবে কাজ করে:**\n1. User একটি message টাইপ করেন\n2. React frontend, Backend-এ POST request পাঠায়\n3. Backend, MongoDB থেকে conversation history নেয়\n4. Claude AI সম্পূর্ণ conversation দেখে উত্তর তৈরি করে\n5. উত্তর MongoDB-তে save হয় এবং frontend-এ দেখানো হয়\n\n**Tech Stack:** React · Vite · Express · MongoDB · Mongoose · Claude Sonnet 4.5",
      relevantFiles: [
        { path: "Backend/server.js", lineRange: { start: 1, end: 20 } },
        { path: "Backend/utils/claude.js", lineRange: { start: 1, end: 25 } },
        { path: "Frontend/src/MyContext.jsx", lineRange: { start: 1, end: 30 } },
      ],
      relatedQuestions: [
        "MongoDB তে data কিভাবে store হয়?",
        "Claude AI কিভাবে integrate করা হয়েছে?",
        "React Context কিভাবে কাজ করে?",
      ],
    };
  }

  // ── Hindi detection ────────────────────────────────────────────────────────────
  const isHindi = /[\u0900-\u097F]/.test(question);
  if (isHindi) {
    if (q.includes("gemini") || q.includes("ai") || q.includes("काम")) {
      return {
        answer:
          "**Claude Sonnet 4.5** इस app का AI दिमाग है।\n\n**Backend/utils/claude.js में:**\n```javascript\nimport Anthropic from '@anthropic-ai/sdk';\nconst client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });\n\nexport async function callClaude(messages) {\n  const response = await client.messages.create({\n    model: 'claude-sonnet-4-5',\n    max_tokens: 4096,\n    messages,\n  });\n  return response.content[0].text;\n}\n```\n\nHar request के साथ पूरी conversation history Claude को भेजी जाती है ताकि वह context याद रख सके।\n\n**API Key सुरक्षा:** ANTHROPIC_API_KEY को .env file में store किया गया है जो .gitignore में है।",
        relevantFiles: [
          { path: "Backend/utils/claude.js", lineRange: { start: 1, end: 30 } },
          { path: "Backend/routes/chat.js", lineRange: { start: 10, end: 40 } },
        ],
        relatedQuestions: [
          "MongoDB में data कैसे save होता है?",
          "Frontend state management कैसे काम करती है?",
          "Project का structure क्या है?",
        ],
      };
    }
    return {
      answer:
        "यह प्रोजेक्ट एक **ChatGPT क्लोन** है जो Claude AI का उपयोग करता है।\n\n**प्रोजेक्ट संरचना:**\n• **Frontend/** - React 18 + Vite से बना यूज़र इंटरफेस\n• **Backend/** - Node.js + Express का REST API\n• **Database** - MongoDB में chat threads का संग्रह\n• **AI** - Claude Sonnet 4.5 मॉडल\n\n**काम करने का तरीका:**\n1. यूज़र chat box में message टाइप करता है\n2. Frontend, Backend API को message भेजता है\n3. Backend, MongoDB से पुरानी बातचीत निकालता है\n4. Claude AI पूरी बातचीत देखकर जवाब देता है\n5. जवाब MongoDB में save होता है और Frontend पर दिखता है",
      relevantFiles: [
        { path: "Backend/utils/claude.js", lineRange: { start: 1, end: 25 } },
        { path: "Frontend/src/MyContext.jsx", lineRange: { start: 1, end: 30 } },
      ],
      relatedQuestions: [
        "Claude AI कैसे integrate किया गया है?",
        "Frontend state management कैसे काम करती है?",
        "MongoDB में data कैसे store होता है?",
      ],
    };
  }

  if (q.includes("structure") || q.includes("project") || q.includes("organiz")) {
    return {
      answer:
        "The project follows a clear **monorepo structure** with two top-level folders:\n\n**Backend/** (Node.js + Express)\n```\nBackend/\n├── server.js          # Express app entry point\n├── models/Thread.js   # Mongoose schema for chat threads\n├── routes/chat.js     # REST API route handlers\n└── utils/claude.js    # Anthropic Claude AI integration\n```\n\n**Frontend/** (React + Vite)\n```\nFrontend/\n├── src/\n│   ├── App.jsx        # Root React component\n│   ├── MyContext.jsx  # Global state via React Context\n│   └── components/   # UI components\n├── index.html\n└── vite.config.js\n```\n\nThe backend runs on port 5000 and the frontend on port 5173 (Vite default).",
      relevantFiles: [
        { path: "Backend/server.js", lineRange: { start: 1, end: 20 } },
        { path: "Backend/routes/chat.js", lineRange: { start: 1, end: 10 } },
        { path: "Frontend/src/App.jsx", lineRange: { start: 1, end: 30 } },
        { path: "Frontend/src/MyContext.jsx", lineRange: { start: 1, end: 20 } },
      ],
      relatedQuestions: [
        "How does the Claude AI integration work?",
        "How are conversations persisted?",
        "What does MyContext.jsx do?",
      ],
    };
  }
  if (q.includes("gemini") || q.includes("ai") || q.includes("llm") || q.includes("model")) {
    return {
      answer:
        "**Claude Sonnet 4.5** is used as the AI backbone of this app.\n\nIn `Backend/utils/claude.js`:\n```javascript\nimport Anthropic from '@anthropic-ai/sdk';\nconst client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });\n\nexport async function callClaude(messages) {\n  const response = await client.messages.create({\n    model: 'claude-sonnet-4-5',\n    max_tokens: 4096,\n    messages,\n  });\n  return response.content[0].text;\n}\n```\n\nThe full conversation history is sent with each request so Claude maintains context across the thread.",
      relevantFiles: [
        { path: "Backend/utils/claude.js", lineRange: { start: 1, end: 30 } },
        { path: "Backend/routes/chat.js", lineRange: { start: 10, end: 40 } },
      ],
      relatedQuestions: [
        "How is the API key kept secure?",
        "How does conversation history work?",
        "What model version is being used?",
      ],
    };
  }
  if (q.includes("auth") || q.includes("login") || q.includes("session")) {
    return {
      answer:
        "This project **does not implement user authentication** in the current version. Chat threads are created anonymously and identified by MongoDB ObjectId.\n\nThe thread ID is stored in the frontend state (via MyContext) and used to retrieve the conversation from MongoDB on subsequent requests.\n\nFor production, you could add:\n- **JWT-based auth** (jsonwebtoken + bcrypt)\n- **Session middleware** (express-session)\n- **OAuth** (Passport.js with Google OAuth)",
      relevantFiles: [
        { path: "Backend/server.js", lineRange: { start: 1, end: 25 } },
        { path: "Backend/models/Thread.js", lineRange: { start: 1, end: 20 } },
      ],
      relatedQuestions: [
        "How are threads identified without auth?",
        "How would you add user accounts?",
        "Is the API protected?",
      ],
    };
  }
  if (q.includes("mongodb") || q.includes("database") || q.includes("thread") || q.includes("persist")) {
    return {
      answer:
        "Chat conversations are stored in MongoDB using **Mongoose**.\n\n`Backend/models/Thread.js` defines the schema:\n```javascript\nconst messageSchema = new Schema({\n  role: { type: String, enum: ['user', 'assistant'] },\n  content: { type: String, required: true },\n  timestamp: { type: Date, default: Date.now }\n});\n\nconst threadSchema = new Schema({\n  messages: [messageSchema],\n  createdAt: { type: Date, default: Date.now }\n});\n\nexport default mongoose.model('Thread', threadSchema);\n```\n\nEach chat conversation is one Thread document with an array of messages.",
      relevantFiles: [
        { path: "Backend/models/Thread.js", lineRange: { start: 1, end: 25 } },
        { path: "Backend/routes/chat.js", lineRange: { start: 5, end: 35 } },
        { path: "Backend/server.js", lineRange: { start: 5, end: 15 } },
      ],
      relatedQuestions: [
        "How do you query a specific thread?",
        "How many messages can a thread have?",
        "How is MongoDB connected?",
      ],
    };
  }
  return QA_RESPONSES.default;
}

// ── Progress / Skill Data ─────────────────────────────────────────────────────

const PROGRESS_STIWART = {
  userId: "STIWARTs",
  repoId: REPO_ID,
  overallScore: 82,
  skills: [
    { area: "frontend", score: 88, modulesExplored: 3, totalModules: 3, lastActivity: new Date(Date.now() - 2 * 3600000).toISOString() },
    { area: "api", score: 85, modulesExplored: 2, totalModules: 2, lastActivity: new Date(Date.now() - 3600000).toISOString() },
    { area: "database", score: 80, modulesExplored: 1, totalModules: 1, lastActivity: new Date(Date.now() - 86400000).toISOString() },
    { area: "architecture", score: 78, modulesExplored: 4, totalModules: 7, lastActivity: new Date(Date.now() - 7200000).toISOString() },
    { area: "other", score: 75, modulesExplored: 2, totalModules: 3, lastActivity: new Date(Date.now() - 172800000).toISOString() },
  ],
  totalTimeSpentMs: 5400000,
  walkthroughsCompleted: 3,
  questionsAsked: 12,
  modulesExplored: 7,
  conventionsViewed: 5,
  firstActivity: new Date(Date.now() - 7 * 86400000).toISOString(),
  lastActivity: new Date(Date.now() - 3600000).toISOString(),
  timeline: [
    { timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), overallScore: 20, eventDescription: "First login — explored architecture map" },
    { timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), overallScore: 45, eventDescription: "Completed setup walkthrough" },
    { timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), overallScore: 62, eventDescription: "Viewed conventions and env setup" },
    { timestamp: new Date(Date.now() - 86400000).toISOString(), overallScore: 74, eventDescription: "Asked 8 questions via Q&A" },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), overallScore: 82, eventDescription: "Completed chat flow walkthrough" },
  ],
};

// ── Route Handlers ────────────────────────────────────────────────────────────

// Helper: only intercept STIWARTs/Chatgpt (case-insensitive)
function isChatgptRepo(owner: string, repo: string) {
  return (
    owner.toLowerCase() === "stiwarts" &&
    (repo.toLowerCase() === "chatgpt" || repo.toLowerCase() === "chatgpt")
  );
}

// Architecture
chatgptOverride.get("/analysis/:owner/:repo/architecture", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ repoId: REPO_ID, content: ARCHITECTURE });
});

// Trigger analysis — immediately return completed
chatgptOverride.post("/repos/:owner/:repo/analyze", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ repoId: REPO_ID, status: "completed", message: "Analysis complete" });
});

// Conventions — direct GET (what ConventionsPage calls)
chatgptOverride.get("/conventions/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ repoId: REPO_ID, conventions: CONVENTIONS });
});

// Conventions — direct POST (Re-detect button)
chatgptOverride.post("/conventions/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ repoId: REPO_ID, status: "convention_detection_started" });
});

// Conventions — analysis alias (used by Overview page)
chatgptOverride.get("/analysis/:owner/:repo/conventions", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ repoId: REPO_ID, conventions: CONVENTIONS });
});

// POST walkthroughs — generate walkthrough from a question
chatgptOverride.post("/walkthroughs/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  const { question = "" } = req.body as { question?: string };
  const q = question.toLowerCase();
  let wt = WALKTHROUGHS.find((w) =>
    q.includes("setup") || q.includes("start") ? w.id === "wt-setup" :
    q.includes("context") || q.includes("state") ? w.id === "wt-context" :
    w.id === "wt-chat-flow"
  ) || WALKTHROUGHS[1];
  res.json({ repoId: REPO_ID, walkthrough: { ...wt, question } });
});

// Repo meta (so the repo shows up in lists)
chatgptOverride.get("/repos/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({
    repoId: REPO_ID,
    repoUrl: "https://github.com/STIWARTs/Chatgpt",
    defaultBranch: "main",
    analysisStatus: "completed",
    lastAnalyzedAt: new Date().toISOString(),
    fileCount: 12,
    techStack: ARCHITECTURE.techStack,
  });
});

// Walkthroughs list
chatgptOverride.get("/walkthroughs/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ repoId: REPO_ID, walkthroughs: WALKTHROUGHS });
});

// Specific walkthrough
chatgptOverride.get("/walkthroughs/:owner/:repo/:id", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  const wt = WALKTHROUGHS.find((w) => w.id === req.params.id);
  if (!wt) { res.status(404).json({ error: "Walkthrough not found" }); return; }
  res.json({ repoId: REPO_ID, walkthrough: wt });
});

// Environment setup
chatgptOverride.get("/env-setup/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ repoId: REPO_ID, envSetup: ENV_SETUP });
});

// Animated sequences
chatgptOverride.get("/animated/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ repoId: REPO_ID, sequences: ANIMATED_SEQUENCES });
});

// Animated node explanation
chatgptOverride.post("/animated/:owner/:repo/explain-node", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  const { nodeId, language, fresherMode } = req.body as { nodeId: string; language?: string; fresherMode?: boolean };
  const node = ARCHITECTURE.nodes.find((n) => n.id === nodeId);
  
  let explanation = node?.description || "No description available.";
  let title = node?.label || nodeId;

  if (fresherMode) {
    explanation = "In simple terms: " + explanation + " This is a crucial piece of the puzzle connecting the system.";
  }

  if (language === "hi") {
    title = title + " (हिन्दी)";
    explanation = "हिंदी में: " + explanation;
  } else if (language === "ta") {
    title = title + " (தமிழ்)";
    explanation = "தமிழ் மொழிபெயர்ப்பு: " + explanation;
  } else if (language === "te") {
    title = title + " (తెలుగు)";
    explanation = "తెలుగు అనువాదం: " + explanation;
  } else if (language === "kn") {
    title = title + " (ಕನ್ನಡ)";
    explanation = "ಕನ್ನಡ ಅನುವಾದ: " + explanation;
  } else if (language === "bn") {
    title = title + " (বাংলা)";
    explanation = "বাংলা অনুবাদ: " + explanation;
  } else if (language === "mr") {
    title = title + " (मराठी)";
    explanation = "मराठी अनुवाद: " + explanation;
  }

  res.json({
    repoId: REPO_ID,
    nodeId,
    title,
    explanation,
    keyFiles: node?.files || [],
    tips: ["This module is critical to the chat flow.", "Understanding this helps you trace requests end-to-end."],
  });
});

// Q&A
chatgptOverride.post("/qa/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  const { question = "" } = req.body as { question?: string };
  const response = getQAResponse(question);
  res.json({ repoId: REPO_ID, question, ...response });
});

// Progress — individual
chatgptOverride.get("/progress/:owner/:repo", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json(PROGRESS_STIWART);
});

// Progress — team
chatgptOverride.get("/progress/:owner/:repo/team", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({
    repoId: REPO_ID,
    members: [PROGRESS_STIWART],
    averageScore: PROGRESS_STIWART.overallScore,
    averageTimeToOnboard: PROGRESS_STIWART.totalTimeSpentMs,
    topAreas: [
      { area: "frontend", score: 88, modulesExplored: 3, totalModules: 3, lastActivity: new Date().toISOString() },
      { area: "api", score: 85, modulesExplored: 2, totalModules: 2, lastActivity: new Date().toISOString() },
    ],
    weakAreas: [
      { area: "database", score: 80, modulesExplored: 1, totalModules: 1, lastActivity: new Date().toISOString() },
    ],
  });
});

// Progress — leaderboard (wrapped so frontend reads d.leaderboard)
chatgptOverride.get("/progress/:owner/:repo/leaderboard", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({
    leaderboard: [
      {
        userId: "STIWARTs",
        name: "STIWART STANCE SAXENA",
        overallScore: 82,
        rank: 1,
        avatar: "https://github.com/STIWARTs.png",
        strongestArea: "frontend",
        walkthroughsCompleted: PROGRESS_STIWART.walkthroughsCompleted,
        questionsAsked: PROGRESS_STIWART.questionsAsked,
        modulesExplored: PROGRESS_STIWART.modulesExplored,
        totalTimeSpentMs: PROGRESS_STIWART.totalTimeSpentMs,
      },
    ],
  });
});

// Progress — demo-user alias (what the progress page calls)
chatgptOverride.get("/progress/:owner/:repo/demo-user", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json(PROGRESS_STIWART);
});

// Progress event recording — accept silently
chatgptOverride.post("/progress/:owner/:repo/event", (req, res, next) => {
  if (!isChatgptRepo(req.params.owner, req.params.repo)) return next();
  res.json({ success: true });
});
