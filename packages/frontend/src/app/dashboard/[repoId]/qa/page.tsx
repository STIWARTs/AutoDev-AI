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
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <MessageSquare className="w-7 h-7 text-indigo-400" />
              </div>
              <p className="text-white font-semibold text-lg mb-1">Ask about this codebase</p>
              <p className="text-brand-muted text-sm mb-8 max-w-sm">
                Get instant answers about architecture, patterns, and code flows.
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleStarter(q)}
                    className="text-left px-4 py-3 glass rounded-xl border border-white/[0.06] hover:border-indigo-500/20 hover:bg-indigo-500/5 text-sm text-brand-text-secondary hover:text-indigo-300 transition-all cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}
              <div className={`flex flex-col gap-2 max-w-2xl ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600/30 border border-indigo-500/30 text-white rounded-tr-sm"
                    : "glass border border-white/[0.06] text-brand-text rounded-tl-sm"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.relevantFiles && msg.relevantFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.relevantFiles.map((f, j) => (
                      <span key={j} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-brand-surface border border-white/[0.06] text-brand-text-secondary font-mono">
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
                        className="flex items-center gap-1 text-xs px-3 py-1.5 border border-white/[0.06] rounded-full hover:border-indigo-500/30 text-brand-text-secondary hover:text-indigo-300 transition-all cursor-pointer"
                      >
                        {q} <ChevronRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-violet-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="px-4 py-3 glass border border-white/[0.06] rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this codebase..."
            className="flex-1 px-4 py-3 glass border border-white/[0.06] rounded-xl text-sm text-white placeholder-brand-muted focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/40 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </DemoDashboardLayout>
  );
}
