"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import { Send, MessageSquare, FileCode, ChevronRight, Bot, User, Sparkles, BrainCircuit, Search } from "lucide-react";

interface RelevantFile {
  path: string;
  lineRange?: { start: number; end: number };
}

interface Message {
  role: "user" | "assistant";
  content: string;
  relevantFiles?: RelevantFile[];
  relatedQuestions?: string[];
}

const ANALYZE_PHASES = [
  { icon: Search,       text: "Scanning codebase index..." },
  { icon: BrainCircuit, text: "Analyzing code relationships..." },
  { icon: Sparkles,     text: "Generating response..." },
];

const STARTER_QUESTIONS = [
  "How is the project structured?",
  "How does Claude AI work here?",
  "यह project कैसे काम करता है?",
  "MongoDB தரவு எவ்வாறு சேமிக்கப்படுகிறது?",
  "এই project এর structure কেমন?",
  "How are chat threads stored?",
];

function renderContent(text: string) {
  return text.split("\n\n").map((para, i) => {
    if (para.startsWith("```")) {
      const code = para.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
      return (
        <pre
          key={i}
          className="bg-brand-bg border border-brand-border p-3 text-xs font-mono overflow-x-auto my-2 text-brand-text rounded-sm"
        >
          {code}
        </pre>
      );
    }
    return (
      <p key={i} className="whitespace-pre-wrap leading-relaxed mb-1.5">
        {para.split(/(\*\*[^*]+\*\*)/).map((chunk, j) =>
          chunk.startsWith("**") && chunk.endsWith("**") ? (
            <strong key={j} className="text-brand-text font-semibold">
              {chunk.slice(2, -2)}
            </strong>
          ) : (
            chunk
          )
        )}
      </p>
    );
  });
}

interface MsgBubbleProps {
  msg: Message;
  onFollowUp: (q: string) => void;
  streaming?: boolean;
}

function MessageBubble({ msg, onFollowUp, streaming }: MsgBubbleProps) {
  return (
    <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
      {msg.role === "assistant" && (
        <div className="w-8 h-8 bg-brand-surface border border-brand-border flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-brand" />
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-2xl ${msg.role === "user" ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 text-sm ${
            msg.role === "user"
              ? "bg-brand/10 border border-brand/20 text-brand-text"
              : "bg-brand-surface border border-brand-border text-brand-text"
          }`}
        >
          {msg.role === "user" ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div>
              {renderContent(msg.content)}
              {streaming && (
                <span className="inline-block w-[2px] h-4 bg-brand animate-pulse ml-0.5 align-text-bottom" />
              )}
            </div>
          )}
        </div>

        {!streaming && msg.relevantFiles && msg.relevantFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.relevantFiles.map((f, j) => (
              <span
                key={j}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-brand-bg border border-brand-border text-brand-muted font-mono"
              >
                <FileCode className="w-3 h-3 text-brand-muted" />
                {f.path}
                {f.lineRange ? `:${f.lineRange.start}-${f.lineRange.end}` : ""}
              </span>
            ))}
          </div>
        )}

        {!streaming && msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.relatedQuestions.map((q, j) => (
              <button
                key={j}
                onClick={() => onFollowUp(q)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 border border-brand-border hover:border-brand/40 text-brand-muted hover:text-brand-text transition-all cursor-pointer font-mono"
              >
                {q} <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {msg.role === "user" && (
        <div className="w-8 h-8 bg-brand-surface border border-brand-border flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-4 h-4 text-brand-muted" />
        </div>
      )}
    </div>
  );
}

export default function QAPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [analyzePhase, setAnalyzePhase] = useState(0); // 0=idle, 1/2/3=phases
  const [streamingMsg, setStreamingMsg] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const { track } = useProgressTracker(decodedRepoId);

  const isbusy = analyzePhase > 0 || streamingMsg !== null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, analyzePhase, streamingMsg]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isbusy) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setAnalyzePhase(1);

    const t1 = setTimeout(() => setAnalyzePhase(2), 900);
    const t2 = setTimeout(() => setAnalyzePhase(3), 1800);

    try {
      const [apiData] = await Promise.all([
        (async () => {
          const token = await getToken();
          const res = await fetchApi(
            `${getApiBase(decodedRepoId)}/qa/${decodedRepoId}`,
            { method: "POST", body: JSON.stringify({ question }) },
            token
          );
          return res.json();
        })(),
        new Promise((r) => setTimeout(r, 2600)), // minimum thinking time
      ]);

      clearTimeout(t1);
      clearTimeout(t2);
      setAnalyzePhase(0);

      const fullContent: string = apiData.answer ?? apiData.error ?? "No response";
      const relevantFiles = apiData.relevantFiles;
      const relatedQuestions = apiData.relatedQuestions;

      if (apiData.answer) track({ eventType: "qa_asked", targetLabel: question });

      // Typewriter — reveal 4 chars every 18ms ≈ ~222 chars/sec
      let idx = 0;
      setStreamingMsg({ role: "assistant", content: "", relevantFiles, relatedQuestions });

      const timer = setInterval(() => {
        idx += 4;
        if (idx >= fullContent.length) {
          clearInterval(timer);
          setStreamingMsg(null);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullContent, relevantFiles, relatedQuestions },
          ]);
        } else {
          setStreamingMsg((prev) =>
            prev ? { ...prev, content: fullContent.slice(0, idx) } : null
          );
        }
      }, 18);
    } catch {
      clearTimeout(t1);
      clearTimeout(t2);
      setAnalyzePhase(0);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get a response. Please try again." },
      ]);
    }
  }

  function handleStarter(q: string) {
    setInput(q);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const PhaseIcon = analyzePhase > 0 ? ANALYZE_PHASES[analyzePhase - 1].icon : null;
  const phaseText = analyzePhase > 0 ? ANALYZE_PHASES[analyzePhase - 1].text : "";

  return (
    <DemoDashboardLayout
      title="Q&A"
      subtitle="Ask anything about this codebase — get instant, context-aware answers"
    >
      <div className="flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
        {/* Message list */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.length === 0 && !isbusy && (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 bg-brand-surface border border-brand-border">
              <div className="w-12 h-12 bg-brand-surface border border-brand-border flex items-center justify-center mb-5">
                <MessageSquare className="w-7 h-7 text-brand" />
              </div>
              <p className="text-brand-text font-semibold text-lg mb-1">Ask about this codebase</p>
              <p className="text-brand-muted text-sm mb-2 max-w-sm">
                Get instant answers about architecture, patterns, and code flows.
              </p>
              <p className="text-[11px] text-brand-muted font-mono mb-8 opacity-70">
                Supports English · हिन्दी · தமிழ் · বাংলা
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleStarter(q)}
                    className="text-left px-4 py-3 bg-brand-bg border border-brand-border hover:border-brand/40 hover:bg-brand-card text-xs text-brand-muted hover:text-brand-text transition-all font-mono cursor-pointer"
                  >
                    <span className="text-brand mr-2">→</span>{q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onFollowUp={handleStarter} />
          ))}

          {/* AI analyzing indicator */}
          {analyzePhase > 0 && PhaseIcon && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-brand-surface border border-brand-border flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-brand animate-pulse" />
              </div>
              <div className="bg-brand-surface border border-brand-border px-4 py-3 flex items-center gap-2.5">
                <PhaseIcon className="w-3.5 h-3.5 text-brand animate-spin" style={{ animationDuration: "1.5s" }} />
                <span className="text-xs font-mono text-brand-muted animate-pulse">{phaseText}</span>
                <span className="flex items-center gap-1 ml-1">
                  <span className="w-1 h-1 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-1 h-1 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                </span>
              </div>
            </div>
          )}

          {/* Streaming typewriter */}
          {streamingMsg && (
            <MessageBubble msg={streamingMsg} onFollowUp={handleStarter} streaming />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-[10px] font-mono text-brand-muted">
            Powered by Claude Sonnet 4.5 · {decodedRepoId}
          </span>
          <span className="ml-auto text-[10px] font-mono text-brand-muted">
            {messages.length} messages
          </span>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask in English, हिन्दी, தமிழ், or বাংলা..."
              className="w-full px-4 py-3 bg-brand-surface border border-brand-border focus:border-brand/60 text-sm text-brand-text placeholder-brand-muted focus:outline-none transition-all font-mono"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <kbd className="text-[9px] px-1 border border-brand-border text-brand-muted font-mono bg-brand-card">↵</kbd>
            </div>
          </div>
          <button
            type="submit"
            disabled={isbusy || !input.trim()}
            className="px-5 py-3 bg-brand text-brand-bg hover:bg-brand/90 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </DemoDashboardLayout>
  );
}
