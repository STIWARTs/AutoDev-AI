// Mock data simulating analysis of https://github.com/STIWARTs/ChatGPT
// A full-stack ChatGPT clone: React + Vite frontend, Express + MongoDB + Gemini AI backend

export const MOCK_OWNER = "STIWARTs";
export const MOCK_REPO = "ChatGPT";

// ─── Architecture ────────────────────────────────────────────────────────────

export const mockArchitecture = {
  summary:
    "A full-stack ChatGPT clone built with React (Vite) on the frontend and Express.js + MongoDB on the backend. The app uses Google Gemini AI for generating chat responses. Users can create threaded conversations stored in MongoDB, with a sidebar for thread navigation and a chat window for real-time messaging.",
  nodes: [
    {
      id: "entry-server",
      label: "Express Server",
      type: "entry",
      description:
        "Application entry point. Sets up Express with CORS and JSON middleware, connects to MongoDB via Mongoose, and mounts API routes on /api.",
      files: ["Backend/server.js"],
    },
    {
      id: "entry-frontend",
      label: "React App Entry",
      type: "entry",
      description:
        "Frontend entry point using Vite. Renders the root React component with context providers and initializes the SPA.",
      files: [
        "Frontend/src/main.jsx",
        "Frontend/index.html",
        "Frontend/vite.config.js",
      ],
    },
    {
      id: "module-app",
      label: "App Component",
      type: "module",
      description:
        "Root React component that composes the Sidebar and ChatWindow components. Manages global app state and context distribution.",
      files: ["Frontend/src/App.jsx", "Frontend/src/App.css"],
    },
    {
      id: "module-chat",
      label: "Chat Component",
      type: "module",
      description:
        "Handles individual chat message rendering with Markdown support via react-markdown and syntax highlighting with rehype-highlight.",
      files: ["Frontend/src/Chat.jsx", "Frontend/src/Chat.css"],
    },
    {
      id: "module-chatwindow",
      label: "Chat Window",
      type: "module",
      description:
        "Main chat interface component. Manages message input, sends user messages to the backend API, displays AI responses with loading spinners, and handles message history.",
      files: ["Frontend/src/ChatWindow.jsx", "Frontend/src/ChatWindow.css"],
    },
    {
      id: "module-sidebar",
      label: "Sidebar",
      type: "module",
      description:
        "Thread navigation panel. Displays conversation threads, allows creating new threads, deleting existing ones, and switching between conversations.",
      files: ["Frontend/src/Sidebar.jsx", "Frontend/src/Sidebar.css"],
    },
    {
      id: "service-chatroutes",
      label: "Chat Routes",
      type: "service",
      description:
        "Express router handling all chat API endpoints: GET/POST /threads for thread CRUD, POST /chat for sending messages, and DELETE /threads/:id for cleanup. Orchestrates between the Thread model and Gemini AI utility.",
      files: ["Backend/routes/chat.js"],
    },
    {
      id: "service-gemini",
      label: "Gemini AI Service",
      type: "service",
      description:
        "Integrates with Google Generative AI (Gemini) SDK. Configures the model, formats conversation history, and generates AI chat completions.",
      files: ["Backend/utils/gemini.js"],
    },
    {
      id: "util-context",
      label: "App Context",
      type: "util",
      description:
        "React Context provider for sharing state across components — manages current thread ID, message list, and sidebar visibility.",
      files: ["Frontend/src/MyContext.jsx"],
    },
    {
      id: "config-vite",
      label: "Build Config",
      type: "config",
      description:
        "Vite configuration with React plugin, ESLint config, and development server settings.",
      files: [
        "Frontend/vite.config.js",
        "Frontend/eslint.config.js",
        "Frontend/package.json",
      ],
    },
    {
      id: "config-backend",
      label: "Backend Config",
      type: "config",
      description:
        "Backend package configuration and environment setup. Uses dotenv for MONGODB_URL and API keys.",
      files: ["Backend/package.json", ".gitignore"],
    },
    {
      id: "database-mongo",
      label: "MongoDB",
      type: "database",
      description:
        "MongoDB database storing chat threads and messages. Connected via Mongoose with the Thread model defining the schema for conversations.",
      files: ["Backend/models/Thread.js"],
    },
    {
      id: "external-gemini-api",
      label: "Google Gemini API",
      type: "external",
      description:
        "External Google Generative AI API used for generating chat responses. Accessed via @google/generative-ai SDK.",
      files: [],
    },
  ],
  edges: [
    { source: "entry-server", target: "service-chatroutes", label: "mounts /api" },
    { source: "entry-frontend", target: "module-app", label: "renders" },
    { source: "module-app", target: "module-sidebar", label: "composes" },
    { source: "module-app", target: "module-chatwindow", label: "composes" },
    { source: "module-chatwindow", target: "module-chat", label: "renders messages" },
    { source: "module-chatwindow", target: "service-chatroutes", label: "calls API" },
    { source: "module-sidebar", target: "service-chatroutes", label: "calls API" },
    { source: "service-chatroutes", target: "service-gemini", label: "calls" },
    { source: "service-chatroutes", target: "database-mongo", label: "reads/writes" },
    { source: "service-gemini", target: "external-gemini-api", label: "calls" },
    { source: "module-app", target: "util-context", label: "provides" },
    { source: "module-chatwindow", target: "util-context", label: "consumes" },
    { source: "module-sidebar", target: "util-context", label: "consumes" },
    { source: "entry-server", target: "database-mongo", label: "connects" },
  ],
  techStack: {
    "Frontend Framework": "React 19 + Vite 7",
    "Backend Framework": "Express 5 (Node.js)",
    Database: "MongoDB (Mongoose 8)",
    "AI Model": "Google Gemini (@google/generative-ai)",
    Styling: "Vanilla CSS (component-scoped)",
    "Markdown Rendering": "react-markdown + rehype-highlight",
    "Build Tool": "Vite",
    Linting: "ESLint 9",
    "State Management": "React Context API",
    "Unique IDs": "uuid",
  },
  entryPoints: ["Backend/server.js", "Frontend/src/main.jsx"],
  keyPatterns: [
    {
      name: "Client-Server Split",
      description:
        "Monorepo with separate Backend/ and Frontend/ directories. Frontend is a Vite React SPA that communicates with the Express backend via REST API.",
    },
    {
      name: "AI Service Abstraction",
      description:
        "Gemini AI logic is isolated in Backend/utils/gemini.js, making it easy to swap AI providers without touching route handlers.",
    },
    {
      name: "Context-Based State",
      description:
        "React Context (MyContext.jsx) distributes shared state to Sidebar and ChatWindow, avoiding prop drilling.",
    },
    {
      name: "Thread-Based Chat Model",
      description:
        "Conversations are organized into threads stored in MongoDB, each containing an array of messages with role and content fields.",
    },
  ],
};

// ─── Q&A Responses ───────────────────────────────────────────────────────────

const qaResponses: Record<
  string,
  { answer: string; relevantFiles: { path: string; lineRange?: { start: number; end: number } }[]; relatedQuestions: string[] }
> = {
  default: {
    answer:
      "This is a **full-stack ChatGPT clone** built with:\n\n" +
      "- **Frontend**: React 19 + Vite, with components for Chat, ChatWindow, and Sidebar\n" +
      "- **Backend**: Express.js server connecting to MongoDB for thread storage\n" +
      "- **AI**: Google Gemini API for generating chat completions\n\n" +
      "The app lets users create conversation threads, send messages, and receive AI-generated responses. " +
      "The frontend uses React Context for state management and react-markdown for rendering AI responses with syntax highlighting.\n\n" +
      "### Key Entry Points\n" +
      "- `Backend/server.js` — Express server setup and MongoDB connection\n" +
      "- `Frontend/src/main.jsx` — React app initialization",
    relevantFiles: [
      { path: "Backend/server.js", lineRange: { start: 1, end: 15 } },
      { path: "Frontend/src/main.jsx" },
      { path: "Frontend/src/App.jsx" },
      { path: "Backend/routes/chat.js" },
    ],
    relatedQuestions: [
      "How does the Gemini AI integration work?",
      "What is the database schema for threads?",
      "How are messages sent from frontend to backend?",
    ],
  },
};

export function getMockQAResponse(question: string) {
  const q = question.toLowerCase();

  if (q.includes("gemini") || q.includes("ai") || q.includes("model")) {
    return {
      answer:
        "The app uses **Google Gemini AI** via the `@google/generative-ai` SDK.\n\n" +
        "### How it works:\n" +
        "1. `Backend/utils/gemini.js` initializes the Gemini model with an API key from environment variables\n" +
        "2. When a user sends a message, `Backend/routes/chat.js` calls the Gemini utility\n" +
        "3. The conversation history is formatted and sent to the Gemini API\n" +
        "4. The AI response is saved to the MongoDB thread and returned to the frontend\n\n" +
        "```javascript\n" +
        '// Backend/utils/gemini.js\n' +
        'const { GoogleGenerativeAI } = require("@google/generative-ai");\n' +
        "const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);\n" +
        'const model = genAI.getGenerativeModel({ model: "gemini-pro" });\n' +
        "```",
      relevantFiles: [
        { path: "Backend/utils/gemini.js", lineRange: { start: 1, end: 25 } },
        { path: "Backend/routes/chat.js", lineRange: { start: 30, end: 60 } },
      ],
      relatedQuestions: [
        "How is the conversation history managed?",
        "What model parameters are used?",
        "How are API errors handled?",
      ],
    };
  }

  if (q.includes("database") || q.includes("mongo") || q.includes("schema") || q.includes("thread")) {
    return {
      answer:
        "The app uses **MongoDB** with **Mongoose 8** for data persistence.\n\n" +
        "### Thread Schema (`Backend/models/Thread.js`):\n" +
        "```javascript\nconst threadSchema = new mongoose.Schema({\n" +
        "  title: { type: String, default: 'New Chat' },\n" +
        "  messages: [{\n" +
        "    role: { type: String, enum: ['user', 'assistant'] },\n" +
        "    content: String,\n" +
        "    timestamp: { type: Date, default: Date.now }\n" +
        "  }],\n" +
        "  createdAt: { type: Date, default: Date.now },\n" +
        "  updatedAt: { type: Date, default: Date.now }\n" +
        "});\n```\n\n" +
        "Each thread contains an array of messages with `role` (user/assistant) and `content`. " +
        "The connection is established in `server.js` using `mongoose.connect()` with the `MONGODB_URL` environment variable.",
      relevantFiles: [
        { path: "Backend/models/Thread.js", lineRange: { start: 1, end: 30 } },
        { path: "Backend/server.js", lineRange: { start: 22, end: 30 } },
      ],
      relatedQuestions: [
        "How are threads created and deleted?",
        "What API endpoints exist for thread management?",
        "How is the connection string configured?",
      ],
    };
  }

  if (q.includes("frontend") || q.includes("react") || q.includes("component") || q.includes("ui")) {
    return {
      answer:
        "The frontend is a **React 19 SPA** built with **Vite 7**.\n\n" +
        "### Component Architecture:\n" +
        "- **`App.jsx`** — Root component, composes Sidebar + ChatWindow\n" +
        "- **`Sidebar.jsx`** — Thread list navigation, create/delete threads\n" +
        "- **`ChatWindow.jsx`** — Main chat interface, message input, API calls\n" +
        "- **`Chat.jsx`** — Individual message rendering with Markdown\n" +
        "- **`MyContext.jsx`** — React Context for shared state\n\n" +
        "### Data Flow:\n" +
        "1. `MyContext` provides current thread ID and messages to all components\n" +
        "2. `Sidebar` fetches thread list from `GET /api/threads`\n" +
        "3. `ChatWindow` sends messages via `POST /api/chat` and displays responses\n" +
        "4. `Chat` renders each message using `react-markdown` with `rehype-highlight` for code blocks",
      relevantFiles: [
        { path: "Frontend/src/App.jsx" },
        { path: "Frontend/src/ChatWindow.jsx", lineRange: { start: 1, end: 40 } },
        { path: "Frontend/src/Sidebar.jsx", lineRange: { start: 1, end: 40 } },
        { path: "Frontend/src/Chat.jsx" },
        { path: "Frontend/src/MyContext.jsx" },
      ],
      relatedQuestions: [
        "How does the chat input work?",
        "How is Markdown rendered?",
        "What state is shared via Context?",
      ],
    };
  }

  if (q.includes("api") || q.includes("route") || q.includes("endpoint") || q.includes("rest")) {
    return {
      answer:
        "The backend exposes **REST API endpoints** under `/api` via Express router.\n\n" +
        "### Endpoints (`Backend/routes/chat.js`):\n\n" +
        "| Method | Path | Description |\n" +
        "|--------|------|-------------|\n" +
        "| `GET` | `/api/threads` | List all conversation threads |\n" +
        "| `POST` | `/api/threads` | Create a new thread |\n" +
        "| `DELETE` | `/api/threads/:id` | Delete a thread |\n" +
        "| `POST` | `/api/chat` | Send message & get AI response |\n\n" +
        "The chat endpoint receives `{ threadId, message }`, forwards the message to Gemini AI, " +
        "saves both user message and AI response to the thread, and returns the response.",
      relevantFiles: [
        { path: "Backend/routes/chat.js", lineRange: { start: 1, end: 80 } },
        { path: "Backend/server.js", lineRange: { start: 14, end: 16 } },
      ],
      relatedQuestions: [
        "How is authentication handled?",
        "What is the request/response format for /api/chat?",
        "How are errors handled in routes?",
      ],
    };
  }

  if (q.includes("setup") || q.includes("install") || q.includes("run") || q.includes("start") || q.includes("environment")) {
    return {
      answer:
        "### Getting Started\n\n" +
        "**Prerequisites:** Node.js, MongoDB (local or Atlas), Google Gemini API key\n\n" +
        "**Backend:**\n```bash\ncd Backend\nnpm install\n# Create .env with:\n#   MONGODB_URL=mongodb://localhost:27017/chatgpt\n#   GEMINI_API_KEY=your-key\nnpm start  # or: npx nodemon server.js\n```\n\n" +
        "**Frontend:**\n```bash\ncd Frontend\nnpm install\nnpm run dev  # Starts Vite dev server\n```\n\n" +
        "The backend runs on port **8080** and the frontend dev server typically on port **5173**.",
      relevantFiles: [
        { path: "Backend/package.json" },
        { path: "Frontend/package.json" },
        { path: "Backend/server.js", lineRange: { start: 1, end: 10 } },
      ],
      relatedQuestions: [
        "What environment variables are needed?",
        "How do I set up MongoDB?",
        "How do I deploy this app?",
      ],
    };
  }

  // Default response
  return qaResponses.default;
}

// ─── Walkthroughs ────────────────────────────────────────────────────────────

export const mockWalkthroughs = {
  walkthroughs: [
    {
      id: "wt-message-flow",
      title: "How a Chat Message Flows Through the App",
      description:
        "Trace the complete journey of a user message from the React frontend through the Express API to Gemini AI and back.",
      difficulty: "beginner",
      estimatedMinutes: 8,
      steps: [
        {
          title: "User types a message in ChatWindow",
          description:
            "The ChatWindow component captures user input via a form. On submit, it sends the message to the backend API.",
          file: "Frontend/src/ChatWindow.jsx",
          lineStart: 15,
          lineEnd: 35,
          codeSnippet:
            'const handleSubmit = async (e) => {\n  e.preventDefault();\n  const message = input.trim();\n  if (!message) return;\n  setMessages(prev => [...prev, { role: "user", content: message }]);\n  setLoading(true);\n  const res = await fetch("/api/chat", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({ threadId, message })\n  });\n};',
          explanation:
            "The form's onSubmit handler prevents default behavior, trims the input, adds the user message to local state immediately (optimistic update), then sends a POST request to the backend.",
        },
        {
          title: "Express router receives the request",
          description:
            "The chat route handler in Express receives the message, finds the thread in MongoDB, and prepares to call the AI.",
          file: "Backend/routes/chat.js",
          lineStart: 25,
          lineEnd: 45,
          codeSnippet:
            'router.post("/chat", async (req, res) => {\n  const { threadId, message } = req.body;\n  const thread = await Thread.findById(threadId);\n  thread.messages.push({ role: "user", content: message });\n  const response = await generateResponse(thread.messages);\n  thread.messages.push({ role: "assistant", content: response });\n  await thread.save();\n  res.json({ response });\n});',
          explanation:
            "The route extracts threadId and message from the request body, looks up the thread, appends the user message, calls the Gemini AI utility, saves the AI response, and returns it.",
        },
        {
          title: "Gemini AI generates a response",
          description:
            "The gemini.js utility takes the conversation history and sends it to Google's Generative AI API.",
          file: "Backend/utils/gemini.js",
          lineStart: 1,
          lineEnd: 30,
          codeSnippet:
            'const { GoogleGenerativeAI } = require("@google/generative-ai");\nconst genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);\nconst model = genAI.getGenerativeModel({ model: "gemini-pro" });\n\nasync function generateResponse(messages) {\n  const chat = model.startChat({ history: formatHistory(messages) });\n  const result = await chat.sendMessage(messages.at(-1).content);\n  return result.response.text();\n}',
          explanation:
            "The Gemini SDK is initialized with the API key. The generateResponse function starts a chat session with the conversation history and sends the latest message. The AI response text is returned to the route handler.",
        },
        {
          title: "Response displayed in the chat UI",
          description:
            "The frontend receives the API response and renders it using react-markdown with syntax highlighting.",
          file: "Frontend/src/Chat.jsx",
          lineStart: 1,
          lineEnd: 25,
          codeSnippet:
            'import ReactMarkdown from "react-markdown";\nimport rehypeHighlight from "rehype-highlight";\n\nfunction Chat({ message }) {\n  return (\n    <div className={`chat ${message.role}`}>\n      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>\n        {message.content}\n      </ReactMarkdown>\n    </div>\n  );\n}',
          explanation:
            "Each message is rendered by the Chat component. It uses react-markdown to parse Markdown formatting and rehype-highlight for code syntax highlighting, giving AI responses a polished appearance.",
        },
        {
          title: "Thread persisted in MongoDB",
          description:
            "The Thread model ensures the entire conversation is saved for future retrieval.",
          file: "Backend/models/Thread.js",
          lineStart: 1,
          lineEnd: 20,
          codeSnippet:
            'const threadSchema = new mongoose.Schema({\n  title: { type: String, default: "New Chat" },\n  messages: [{\n    role: { type: String, enum: ["user", "assistant"] },\n    content: String,\n    timestamp: { type: Date, default: Date.now }\n  }],\n  createdAt: { type: Date, default: Date.now }\n});',
          explanation:
            "The Thread Mongoose schema stores a title and an array of messages. Each message tracks the role (user or assistant) and content. Timestamps are auto-generated for ordering.",
        },
      ],
    },
    {
      id: "wt-frontend-arch",
      title: "Understanding the React Frontend Architecture",
      description:
        "Learn how the React components are structured, how state flows via Context, and how the UI renders chat messages.",
      difficulty: "beginner",
      estimatedMinutes: 6,
      steps: [
        {
          title: "App entry point with Vite",
          description:
            "main.jsx is the entry point that mounts the React app onto the DOM.",
          file: "Frontend/src/main.jsx",
          lineStart: 1,
          lineEnd: 10,
          codeSnippet:
            "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);",
          explanation:
            "Standard Vite + React setup. The App component is rendered inside React.StrictMode for development warnings.",
        },
        {
          title: "App composes major UI sections",
          description:
            "App.jsx brings together the Sidebar and ChatWindow, wrapping them in context providers.",
          file: "Frontend/src/App.jsx",
          lineStart: 1,
          lineEnd: 30,
          codeSnippet:
            "function App() {\n  return (\n    <MyContextProvider>\n      <div className=\"app\">\n        <Sidebar />\n        <ChatWindow />\n      </div>\n    </MyContextProvider>\n  );\n}",
          explanation:
            "The App component uses MyContextProvider to share state between Sidebar and ChatWindow without prop drilling.",
        },
        {
          title: "State management with React Context",
          description:
            "MyContext.jsx provides shared state for the active thread and messages.",
          file: "Frontend/src/MyContext.jsx",
          lineStart: 1,
          lineEnd: 15,
          codeSnippet:
            "import { createContext } from 'react';\nconst MyContext = createContext();\nexport default MyContext;",
          explanation:
            "A simple context that gets wrapped with a provider in App.jsx. Child components use useContext(MyContext) to access shared state like the current thread ID and message list.",
        },
        {
          title: "Sidebar for thread management",
          description:
            "The Sidebar component handles creating, selecting, and deleting conversation threads.",
          file: "Frontend/src/Sidebar.jsx",
          lineStart: 1,
          lineEnd: 40,
          codeSnippet:
            'function Sidebar() {\n  const { threads, setCurrentThread } = useContext(MyContext);\n  \n  const createThread = async () => {\n    const res = await fetch("/api/threads", { method: "POST" });\n    const thread = await res.json();\n    setCurrentThread(thread._id);\n  };\n  \n  return (\n    <div className="sidebar">\n      <button onClick={createThread}>+ New Chat</button>\n      {threads.map(t => (\n        <div key={t._id} onClick={() => setCurrentThread(t._id)}>\n          {t.title}\n        </div>\n      ))}\n    </div>\n  );\n}',
          explanation:
            "The Sidebar fetches threads from the API, displays them as a list, and updates the current thread via Context when a user clicks on one.",
        },
      ],
    },
    {
      id: "wt-backend-setup",
      title: "Backend Architecture: Express + MongoDB + Gemini",
      description:
        "Explore how the Node.js backend is structured, how MongoDB is connected, and how Gemini AI is integrated.",
      difficulty: "intermediate",
      estimatedMinutes: 10,
      steps: [
        {
          title: "Server initialization",
          description:
            "server.js bootstraps Express with middleware and connects to MongoDB.",
          file: "Backend/server.js",
          lineStart: 1,
          lineEnd: 25,
          codeSnippet:
            'import express from "express";\nimport "dotenv/config";\nimport cors from "cors";\nimport mongoose from "mongoose";\nimport chatRoutes from "./routes/chat.js";\n\nconst app = express();\nconst PORT = 8080;\n\napp.use(express.json());\napp.use(cors());\napp.use("/api", chatRoutes);\n\napp.listen(PORT, () => {\n  console.log(`server running on ${PORT}`);\n  connectDB();\n});',
          explanation:
            "The server uses ES modules, loads environment variables via dotenv, applies CORS and JSON parsing middleware, mounts all chat routes under /api, and starts listening on port 8080. MongoDB connection happens after the server starts.",
        },
        {
          title: "MongoDB connection",
          description:
            "The connectDB function establishes a connection to MongoDB using Mongoose.",
          file: "Backend/server.js",
          lineStart: 22,
          lineEnd: 35,
          codeSnippet:
            "const connectDB = async () => {\n  try {\n    await mongoose.connect(process.env.MONGODB_URL);\n    console.log('Connected with Database!');\n  } catch (err) {\n    console.log('Failed to connect with Db', err);\n  }\n};",
          explanation:
            "Uses the MONGODB_URL environment variable. Mongoose abstracts the MongoDB driver, providing schema validation and query building. Error handling catches connection failures.",
        },
        {
          title: "Chat route handling",
          description:
            "Routes in chat.js handle all CRUD operations for threads and the main chat endpoint.",
          file: "Backend/routes/chat.js",
          lineStart: 1,
          lineEnd: 80,
          codeSnippet:
            'import { Router } from "express";\nimport Thread from "../models/Thread.js";\nimport { generateResponse } from "../utils/gemini.js";\n\nconst router = Router();\n\nrouter.get("/threads", async (req, res) => {\n  const threads = await Thread.find().sort({ updatedAt: -1 });\n  res.json(threads);\n});\n\nrouter.post("/chat", async (req, res) => {\n  const { threadId, message } = req.body;\n  // ... process and respond\n});',
          explanation:
            "Express Router separates route logic from the main server file. The router imports the Thread model for database operations and the Gemini utility for AI responses. Threads are sorted by most recently updated.",
        },
        {
          title: "Gemini AI integration",
          description:
            "gemini.js wraps the Google Generative AI SDK to provide a clean interface for chat completions.",
          file: "Backend/utils/gemini.js",
          lineStart: 1,
          lineEnd: 40,
          codeSnippet:
            'import { GoogleGenerativeAI } from "@google/generative-ai";\n\nconst genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);\nconst model = genAI.getGenerativeModel({ model: "gemini-pro" });\n\nexport async function generateResponse(messages) {\n  const history = messages.slice(0, -1).map(m => ({\n    role: m.role, parts: [{ text: m.content }]\n  }));\n  const chat = model.startChat({ history });\n  const result = await chat.sendMessage(messages.at(-1).content);\n  return result.response.text();\n}',
          explanation:
            "The utility initializes the Gemini client with an API key, configures the model, converts the message history to Gemini's format (role + parts), starts a chat session, and sends the latest message. The response text is extracted and returned.",
        },
        {
          title: "Thread data model",
          description:
            "The Mongoose schema defines the structure for conversation threads.",
          file: "Backend/models/Thread.js",
          lineStart: 1,
          lineEnd: 25,
          codeSnippet:
            'import mongoose from "mongoose";\n\nconst threadSchema = new mongoose.Schema({\n  title: { type: String, default: "New Chat" },\n  messages: [{\n    role: { type: String, enum: ["user", "assistant"] },\n    content: { type: String, required: true },\n    timestamp: { type: Date, default: Date.now }\n  }],\n  createdAt: { type: Date, default: Date.now },\n  updatedAt: { type: Date, default: Date.now }\n});\n\nexport default mongoose.model("Thread", threadSchema);',
          explanation:
            "The Thread model uses Mongoose's schema system to enforce structure. Messages are embedded as a subdocument array with role validation (user/assistant), required content, and auto-timestamps.",
        },
      ],
    },
  ],
};

// ─── Generate Walkthrough (dynamic) ──────────────────────────────────────────

export function getMockGeneratedWalkthrough(question: string) {
  return {
    walkthrough: {
      title: `Exploring: ${question}`,
      description: `AI-generated walkthrough based on your question about the ChatGPT codebase.`,
      difficulty: "beginner" as const,
      estimatedMinutes: 5,
      steps: [
        {
          title: "Start from the entry point",
          description:
            `To understand "${question}", let's start from where the application initializes.`,
          file: "Backend/server.js",
          lineStart: 1,
          lineEnd: 18,
          codeSnippet:
            'import express from "express";\nimport chatRoutes from "./routes/chat.js";\n\nconst app = express();\napp.use("/api", chatRoutes);',
          explanation:
            "The Express server is the application's backbone. All API routes are mounted under /api, which is where the frontend communicates with the backend.",
        },
        {
          title: "Trace the relevant route handler",
          description:
            "The chat routes handle the core logic for this feature.",
          file: "Backend/routes/chat.js",
          lineStart: 10,
          lineEnd: 40,
          codeSnippet:
            'router.post("/chat", async (req, res) => {\n  const { threadId, message } = req.body;\n  const thread = await Thread.findById(threadId);\n  const response = await generateResponse(thread.messages);\n  res.json({ response });\n});',
          explanation:
            "This is where the magic happens — the route receives user messages, queries the AI, and returns responses.",
        },
        {
          title: "Follow the AI service call",
          description:
            "The Gemini AI utility processes the conversation context.",
          file: "Backend/utils/gemini.js",
          lineStart: 5,
          lineEnd: 20,
          codeSnippet:
            'export async function generateResponse(messages) {\n  const chat = model.startChat({ history: formatHistory(messages) });\n  const result = await chat.sendMessage(messages.at(-1).content);\n  return result.response.text();\n}',
          explanation:
            "The AI service manages conversation context by passing the full message history to Gemini, enabling contextual responses.",
        },
        {
          title: "See how the frontend displays results",
          description:
            "The ChatWindow renders the response with Markdown support.",
          file: "Frontend/src/ChatWindow.jsx",
          lineStart: 20,
          lineEnd: 50,
          codeSnippet:
            'const res = await fetch("/api/chat", {\n  method: "POST",\n  body: JSON.stringify({ threadId, message })\n});\nconst data = await res.json();\nsetMessages(prev => [...prev, { role: "assistant", content: data.response }]);',
          explanation:
            "The frontend sends the message, receives the AI response, and appends it to the messages array for rendering.",
        },
      ],
    },
  };
}

// ─── Node Explanation ────────────────────────────────────────────────────────

export function getMockNodeExplanation(nodeId: string) {
  const node = mockArchitecture.nodes.find((n) => n.id === nodeId);
  if (!node) {
    return {
      explanation: "This component is part of the ChatGPT application architecture.",
      details: "",
    };
  }

  const explanations: Record<string, string> = {
    "entry-server":
      "## Express Server (`Backend/server.js`)\n\n" +
      "This is the **main entry point** for the backend application.\n\n" +
      "### What it does:\n" +
      "1. Initializes Express with JSON parsing and CORS middleware\n" +
      "2. Mounts the chat API routes under `/api`\n" +
      "3. Starts the HTTP server on port 8080\n" +
      "4. Connects to MongoDB after server startup\n\n" +
      "### Key Dependencies:\n" +
      "- `express` — HTTP framework\n" +
      "- `mongoose` — MongoDB ODM\n" +
      "- `cors` — Cross-origin resource sharing\n" +
      "- `dotenv` — Environment variable loading\n\n" +
      "### Why it matters:\n" +
      "This file bootstraps the entire backend. If you're debugging server issues or adding new routes, start here.",
    "entry-frontend":
      "## React App Entry (`Frontend/src/main.jsx`)\n\n" +
      "The **frontend entry point** that mounts the React application.\n\n" +
      "### What it does:\n" +
      "1. Creates a React root using `createRoot()`\n" +
      "2. Renders the `App` component inside `React.StrictMode`\n" +
      "3. Imports global CSS styles\n\n" +
      "### Related Files:\n" +
      "- `index.html` — The HTML shell that Vite serves\n" +
      "- `vite.config.js` — Build configuration\n\n" +
      "### Why it matters:\n" +
      "This is where the React app starts. If you need to add global providers or error boundaries, wrap them here.",
    "service-gemini":
      "## Gemini AI Service (`Backend/utils/gemini.js`)\n\n" +
      "The **AI integration layer** that communicates with Google's Generative AI.\n\n" +
      "### What it does:\n" +
      "1. Initializes the Google Generative AI client with an API key\n" +
      "2. Configures the Gemini model\n" +
      "3. Formats conversation history into Gemini's expected format\n" +
      "4. Starts chat sessions and generates responses\n\n" +
      "### Key Pattern:\n" +
      "The service abstracts the AI provider behind a simple `generateResponse(messages)` function. This means swapping Gemini for another AI (like OpenAI) only requires changing this one file.\n\n" +
      "### Environment Variables:\n" +
      "- `GEMINI_API_KEY` — Required for API authentication",
    "database-mongo":
      "## MongoDB Database (`Backend/models/Thread.js`)\n\n" +
      "The **data persistence layer** using MongoDB with Mongoose.\n\n" +
      "### Schema:\n" +
      "The `Thread` model stores:\n" +
      "- `title` — Chat thread name (default: 'New Chat')\n" +
      "- `messages[]` — Array of `{ role, content, timestamp }`\n" +
      "- `createdAt` / `updatedAt` — Timestamps\n\n" +
      "### Usage:\n" +
      "- Threads are created when users start new conversations\n" +
      "- Messages are pushed to the thread's array on each exchange\n" +
      "- Threads are queried sorted by `updatedAt` for the sidebar",
  };

  return {
    explanation:
      explanations[nodeId] ||
      `## ${node.label}\n\n${node.description}\n\n### Files:\n${node.files.map((f: string) => `- \`${f}\``).join("\n")}`,
    details: node.description,
  };
}

// ─── Conventions ─────────────────────────────────────────────────────────────

export const mockConventions = {
  conventions: [
    {
      category: "Project Structure",
      items: [
        "Monorepo with separate Backend/ and Frontend/ directories",
        "Backend uses ES modules (type: module in package.json)",
        "Frontend built with Vite + React",
      ],
    },
    {
      category: "Code Style",
      items: [
        "ES module imports (import/export) throughout",
        "Async/await for all asynchronous operations",
        "Functional React components (no class components)",
        "Component-scoped CSS files (Component.css alongside Component.jsx)",
      ],
    },
    {
      category: "State Management",
      items: [
        "React Context API for global state (no Redux or Zustand)",
        "Local state with useState/useEffect hooks",
      ],
    },
    {
      category: "API Design",
      items: [
        "RESTful endpoints under /api prefix",
        "JSON request/response format",
        "Express Router for route separation",
      ],
    },
    {
      category: "Environment & Security",
      items: [
        "dotenv for environment variable management",
        "Sensitive keys (MONGODB_URL, GEMINI_API_KEY) in .env file",
        ".gitignore excludes node_modules and .env",
      ],
    },
  ],
};

// ─── Animation Sequences ─────────────────────────────────────────────────────

export const mockAnimationSequences = {
  sequences: [
    {
      id: "seq-chat-flow",
      title: "Chat Message Flow",
      description: "How a user message travels through the full stack",
      steps: [
        { nodeId: "module-chatwindow", label: "User sends message", delay: 500 },
        { nodeId: "service-chatroutes", label: "Express route receives request", delay: 800 },
        { nodeId: "service-gemini", label: "Gemini AI generates response", delay: 1200 },
        { nodeId: "database-mongo", label: "Thread updated in MongoDB", delay: 600 },
        { nodeId: "service-chatroutes", label: "Response sent back", delay: 400 },
        { nodeId: "module-chatwindow", label: "UI renders AI response", delay: 500 },
      ],
    },
    {
      id: "seq-thread-mgmt",
      title: "Thread Management",
      description: "Creating and managing conversation threads",
      steps: [
        { nodeId: "module-sidebar", label: "User clicks New Chat", delay: 300 },
        { nodeId: "service-chatroutes", label: "POST /api/threads", delay: 500 },
        { nodeId: "database-mongo", label: "New thread created", delay: 600 },
        { nodeId: "module-sidebar", label: "Thread list updated", delay: 400 },
        { nodeId: "module-chatwindow", label: "Empty chat window shown", delay: 300 },
      ],
    },
  ],
};

// ─── Env Setup ───────────────────────────────────────────────────────────────

export const mockEnvSetup = {
  steps: [
    {
      title: "Prerequisites",
      description: "Install Node.js (v18+) and ensure MongoDB is running (local or Atlas).",
    },
    {
      title: "Clone the repository",
      description: "```bash\ngit clone https://github.com/STIWARTs/ChatGPT.git\ncd ChatGPT\n```",
    },
    {
      title: "Setup Backend",
      description:
        "```bash\ncd Backend\nnpm install\n```\nCreate a `.env` file:\n```\nMONGODB_URL=mongodb://localhost:27017/chatgpt\nGEMINI_API_KEY=your-google-gemini-api-key\n```",
    },
    {
      title: "Setup Frontend",
      description: "```bash\ncd Frontend\nnpm install\n```",
    },
    {
      title: "Run the app",
      description:
        "Start backend:\n```bash\ncd Backend && npx nodemon server.js\n```\nStart frontend:\n```bash\ncd Frontend && npm run dev\n```\nBackend runs on **:8080**, Frontend on **:5173**.",
    },
  ],
};

// ─── User Progress ───────────────────────────────────────────────────────────

export const mockUserProgress = {
  completedWalkthroughs: ["wt-message-flow"],
  totalWalkthroughs: 3,
  nodesExplored: [
    "entry-server",
    "entry-frontend",
    "module-app",
    "service-chatroutes",
    "service-gemini",
    "database-mongo",
  ],
  totalNodes: 13,
  questionsAsked: 4,
  timeSpent: 720,
};

// ─── Languages ───────────────────────────────────────────────────────────────

export const mockLanguages = {
  languages: [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
  ],
};
