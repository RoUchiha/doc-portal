"use client";

import Link from "next/link";
import { FileText, Clock, CheckCircle, Ban, User } from "lucide-react";
import { Document } from "@/lib/documents";
import clsx from "clsx";

const STATUS_CONFIG = {
  pending: {
    label: "Signature Required",
    icon: Clock,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    border: "hover:border-indigo-300",
  },
  signed: {
    label: "Signed",
    icon: CheckCircle,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
    border: "hover:border-emerald-300",
  },
  expired: {
    label: "Expired",
    icon: Ban,
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-300",
    border: "hover:border-slate-300",
  },
};

export default function DocumentCard({ doc }: { doc: Document }) {
  const status = STATUS_CONFIG[doc.status];
  const StatusIcon = status.icon;

  return (
    <Link href={`/documents/${doc.id}`} className="block group">
      <div
        className={clsx(
          "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md",
          status.border
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition-colors text-sm">
                {doc.title}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3 text-slate-300" />
                <p className="text-xs text-slate-400 truncate">
                  {doc.attorney.name} · {doc.attorney.firm}
                </p>
              </div>
            </div>
          </div>
          <span
            className={clsx(
              "flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              status.badge
            )}
          >
            <span className={clsx("w-1.5 h-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{doc.pages} pages</span>
          <span>
            {doc.status === "signed" && doc.signedAt
              ? `Signed ${new Date(doc.signedAt).toLocaleDateString()}`
              : doc.status === "expired"
              ? `Expired ${doc.expiresAt}`
              : `Due ${doc.expiresAt}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
