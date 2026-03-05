"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getApiBase, fetchApi } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { useProgressTracker } from "@/hooks/useProgressTracker";

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

export default function QAPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      const res = await fetchApi(`${getApiBase(decodedRepoId)}/qa/${decodedRepoId}`, {
        method: "POST",
        body: JSON.stringify({ question }),
      }, token);
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
        { role: "assistant", content: "Failed to get a response. Is the backend running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function askFollowUp(question: string) {
    setInput(question);
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed left-0 top-0 w-64 h-full glass-strong border-r border-white/[0.06] p-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold mb-6 block text-gradient font-heading"
        >
          AutoDev
        </Link>
        <p className="text-sm text-brand-text-secondary mb-4">{decodedRepoId}</p>
        <ul className="space-y-1">
          <li>
            <Link href={`/dashboard/${repoId}`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Architecture Map
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/animated`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Animated Map
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/walkthroughs`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Walkthroughs
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/conventions`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Conventions
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/env-setup`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Env Setup
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/qa`} className="block px-3 py-2 rounded-lg bg-white/[0.06] text-brand-text text-sm font-medium">
              Q&A
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/progress`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              My Progress
            </Link>
          </li>
          <li>
            <Link href={`/dashboard/${repoId}/team`} className="block px-3 py-2 rounded-lg hover:bg-white/[0.04] text-brand-text-secondary text-sm transition-colors duration-200">
              Team
            </Link>
          </li>
        </ul>
      </nav>

      <main className="ml-64 p-8 flex flex-col h-screen">
        <h1 className="text-2xl font-bold font-heading mb-6">Ask About This Codebase</h1>

        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-brand-text-secondary text-lg mb-2">Ask anything about this codebase</p>
              <p className="text-brand-muted text-sm mb-6">
                Try: &quot;How is the project structured?&quot; or &quot;Where is the auth logic?&quot;
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "How is the project structured?",
                  "What are the main entry points?",
                  "What patterns does this codebase use?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => askFollowUp(q)}
                    className="text-xs px-3 py-1.5 border border-white/[0.06] rounded-full hover:bg-white/[0.04] text-brand-text-secondary transition-colors duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`p-4 rounded-xl max-w-2xl ${
                  msg.role === "user"
                    ? "bg-blue-600/20 border border-blue-800 ml-auto"
                    : "glass border border-white/[0.06]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {/* Relevant files */}
              {msg.relevantFiles && msg.relevantFiles.length > 0 && (
                <div className="mt-2 max-w-2xl">
                  <p className="text-[10px] uppercase text-brand-muted mb-1">Relevant Files</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.relevantFiles.map((f, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded bg-brand-surface text-brand-text-secondary font-mono">
                        {f.path}{f.lineRange ? `:${f.lineRange.start}-${f.lineRange.end}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Related questions */}
              {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                <div className="mt-2 max-w-2xl flex flex-wrap gap-1.5">
                  {msg.relatedQuestions.map((q, j) => (
                    <button
                      key={j}
                      onClick={() => askFollowUp(q)}
                      className="text-xs px-2.5 py-1 border border-white/[0.06] rounded-full hover:bg-white/[0.04] text-brand-text-secondary transition-colors duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="p-4 rounded-xl glass border border-white/[0.06] max-w-2xl">
              <p className="text-sm text-brand-text-secondary animate-pulse">Thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this codebase..."
            className="flex-1 px-4 py-3 glass border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90 shadow-glow disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            Ask
          </button>
        </form>
      </main>
    </div>
  );
}
