"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import DemoDashboardLayout from "@/components/DemoDashboardLayout";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import { Send, Loader2, MessageSquare, FileCode, ChevronRight, Bot, User } from "lucide-react";

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

const STARTER_QUESTIONS = [
  "How is the project structured?",
  "What are the main entry points?",
  "How does authentication work?",
  "What patterns does this codebase use?",
];

export default function QAPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const { track } = useProgressTracker(decodedRepoId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetchApi(
        `${getApiBase(decodedRepoId)}/qa/${decodedRepoId}`,
        { method: "POST", body: JSON.stringify({ question }) },
        token
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer ?? data.error ?? "No response",
          relevantFiles: data.relevantFiles,
          relatedQuestions: data.relatedQuestions,
        },
      ]);
      if (data.answer) {
        track({ eventType: "qa_asked", targetLabel: question });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get a response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleStarter(q: string) {
    setInput(q);
    inputRef.current?.focus();
  }

  return (
    <DemoDashboardLayout
      title="Q&A"
      subtitle="Ask anything about this codebase — get instant, context-aware answers"
    >
      <div className="flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 bg-brand-surface border border-brand-border">
              <div className="w-12 h-12 bg-brand-surface border border-brand-border flex items-center justify-center mb-5">
                <MessageSquare className="w-7 h-7 text-brand-DEFAULT" />
              </div>
              <p className="text-brand-text font-semibold text-lg mb-1">Ask about this codebase</p>
              <p className="text-brand-muted text-sm mb-8 max-w-sm">
                Get instant answers about architecture, patterns, and code flows.
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleStarter(q)}
                    className="text-left px-4 py-3 bg-brand-bg border border-brand-border hover:border-brand-DEFAULT/40 hover:bg-brand-card text-xs text-brand-muted hover:text-brand-text transition-all font-mono cursor-pointer"
                  >
                    <span className="text-brand-DEFAULT mr-2">→</span>{q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 bg-brand-surface border border-brand-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-brand-DEFAULT" />
                </div>
              )}
              <div className={`flex flex-col gap-2 max-w-2xl ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-DEFAULT/10 border border-brand-DEFAULT/20 text-brand-text"
                    : "bg-brand-surface border border-brand-border text-brand-text"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.relevantFiles && msg.relevantFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.relevantFiles.map((f, j) => (
                      <span key={j} className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-brand-bg border border-brand-border text-brand-muted font-mono">
                        <FileCode className="w-3 h-3 text-brand-muted" />
                        {f.path}
                        {f.lineRange ? `:${f.lineRange.start}-${f.lineRange.end}` : ""}
                      </span>
                    ))}
                  </div>
                )}

                {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.relatedQuestions.map((q, j) => (
                      <button
                        key={j}
                        onClick={() => handleStarter(q)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 border border-brand-border hover:border-brand-DEFAULT/40 text-brand-muted hover:text-brand-text transition-all cursor-pointer font-mono"
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
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-brand-surface border border-brand-border flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-brand-DEFAULT" />
              </div>
              <div className="bg-brand-surface border border-brand-border px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-DEFAULT animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-DEFAULT animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-DEFAULT animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-[10px] font-mono text-brand-muted">
            Powered by Claude 3.5 Sonnet · {decodedRepoId}
          </span>
          <span className="ml-auto text-[10px] font-mono text-brand-muted">{messages.length} messages</span>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this codebase..."
              className="w-full px-4 py-3 bg-brand-surface border border-brand-border focus:border-brand-DEFAULT/60 text-sm text-brand-text placeholder-brand-muted focus:outline-none transition-all font-mono"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none opacity-40">
              <kbd className="text-[9px] px-1 border border-brand-border text-brand-muted font-mono bg-brand-card">↵</kbd>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-brand-DEFAULT text-brand-bg hover:bg-brand-DEFAULT/90 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </DemoDashboardLayout>
  );
}
