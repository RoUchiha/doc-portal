"use client";

import { useEffect, useState } from "react";
import { Eye, Sparkles, PenLine, Clock } from "lucide-react";
import { AuditEvent } from "@/lib/events";

const EVENT_CONFIG = {
  viewed: { icon: Eye, color: "text-slate-400", bg: "bg-slate-100", label: "Viewed" },
  ai_analyzed: { icon: Sparkles, color: "text-indigo-500", bg: "bg-indigo-100", label: "AI Analysis" },
  signed: { icon: PenLine, color: "text-emerald-600", bg: "bg-emerald-100", label: "Signed" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ActivityFeed({ documentId }: { documentId: string }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    fetch(`/api/events?documentId=${documentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {});
  }, [documentId]);

  if (events.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="font-semibold text-slate-800 text-sm">Activity</h3>
      </div>
      <ol className="relative border-l border-slate-200 space-y-4 ml-1">
        {[...events].reverse().map((event, i) => {
          const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.viewed;
          const Icon = cfg.icon;
          return (
            <li key={i} className="ml-4">
              <span
                className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ${cfg.bg}`}
              >
                <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
              </span>
              <p className="text-xs font-medium text-slate-700">{event.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatTime(event.timestamp)}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
