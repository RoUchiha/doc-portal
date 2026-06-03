"use client";

import { useState, useRef } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  documentId: string;
  title: string;
  content: string;
  onAnalyzed?: () => void;
}

export default function AiAnalysis({ documentId, title, content, onAnalyzed }: Props) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function runAnalysis() {
    if (analysis) {
      setOpen((o) => !o);
      return;
    }

    setLoading(true);
    setOpen(true);
    setError("");
    setAnalysis("");
    abortRef.current = new AbortController();

    // Log audit event
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, type: "ai_analyzed", label: "AI analysis requested" }),
    }).then(() => onAnalyzed?.()).catch(() => {});

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title, documentId }),
        signal: abortRef.current.signal,
      });

      const data = await res.json().catch(() => ({})) as Record<string, unknown>;

      if (!res.ok) {
        throw new Error((data.error as string) || `Request failed (${res.status})`);
      }

      setAnalysis((data.text as string) ?? "");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message || "Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Safely render markdown-like bold text using React nodes (no dangerouslySetInnerHTML)
  function renderBold(line: string): React.ReactNode[] {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  }

  function renderAnalysis(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li key={i} className="ml-4 list-disc text-slate-700">
            {renderBold(line.slice(2))}
          </li>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <p key={i} className="font-semibold text-slate-800 mt-3 mb-1">
            {renderBold(line)}
          </p>
        );
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return (
        <p key={i} className="text-slate-700 leading-relaxed">
          {renderBold(line)}
        </p>
      );
    });
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 overflow-hidden">
      <button
        onClick={runAnalysis}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-indigo-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-indigo-900">AI Document Analysis</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {analysis ? "Click to toggle" : "Get a plain-English breakdown of this document"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
          {!loading && (open ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-indigo-500" />)}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-indigo-100">
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
          )}
          {loading && !analysis && (
            <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing document…
            </div>
          )}
          {analysis && (
            <div className="mt-4 space-y-1 text-sm">{renderAnalysis(analysis)}</div>
          )}
        </div>
      )}
    </div>
  );
}
