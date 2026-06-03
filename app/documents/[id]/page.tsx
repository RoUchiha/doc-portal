"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SAMPLE_DOCUMENTS } from "@/lib/documents";
import AiAnalysis from "@/components/AiAnalysis";
import SignatureModal from "@/components/SignatureModal";
import ActivityFeed from "@/components/ActivityFeed";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  User,
  Building2,
  AlertTriangle,
  Ban,
} from "lucide-react";
import Link from "next/link";

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const doc = SAMPLE_DOCUMENTS.find((d) => d.id === id);

  const [signedBy, setSignedBy] = useState<string | null>(doc?.signerName ?? null);
  const [refreshFeed, setRefreshFeed] = useState(0);

  const isExpired = doc ? new Date(doc.expiresAt) < new Date() : false;
  const isSigned = signedBy !== null || doc?.status === "signed";
  const canSign = !isSigned && !isExpired;

  const daysUntilExpiry = doc
    ? Math.ceil(
        (new Date(doc.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // Log "viewed" event once on mount
  useEffect(() => {
    if (!doc || doc.status === "signed") return;
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: doc.id,
        type: "viewed",
        label: "Document viewed",
      }),
    }).catch(() => {});
  }, [doc?.id]);

  if (!doc) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Document not found.</p>
          <Link href="/" className="text-indigo-600 text-sm mt-2 inline-block">
            Back to portal
          </Link>
        </div>
      </main>
    );
  }

  function handleSigned(name: string) {
    setSignedBy(name);
    setRefreshFeed((n) => n + 1);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-900 truncate">{doc.title}</h1>
            <p className="text-xs text-slate-400 truncate">{doc.matter}</p>
          </div>
          {isSigned && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Signed
            </span>
          )}
          {isExpired && !isSigned && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <Ban className="w-3.5 h-3.5" />
              Expired
            </span>
          )}
          {!isSigned && !isExpired && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              Pending
            </span>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Expiry warning */}
          {!isSigned && !isExpired && daysUntilExpiry <= 7 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Signature deadline approaching.</span>{" "}
                This document expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} on {doc.expiresAt}.
              </p>
            </div>
          )}

          {isExpired && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <Ban className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                <span className="font-semibold">This document has expired.</span>{" "}
                The signature deadline of {doc.expiresAt} has passed. Please contact{" "}
                {doc.attorney.name} at {doc.attorney.email} to request a new document.
              </p>
            </div>
          )}

          {/* AI Analysis */}
          <AiAnalysis
            documentId={doc.id}
            title={doc.title}
            content={doc.content}
            onAnalyzed={() => setRefreshFeed((n) => n + 1)}
          />

          {/* Document text */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800 text-sm">Document</h2>
              <span className="ml-auto text-xs text-slate-400">{doc.pages} pages</span>
            </div>
            <div className="px-6 py-5">
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed">
                {doc.content}
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sent by */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Sent by</h3>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{doc.attorney.name}</p>
                <p className="text-xs text-slate-500">{doc.attorney.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <p className="text-xs text-slate-500">{doc.attorney.firm}</p>
                </div>
                <a
                  href={`mailto:${doc.attorney.email}`}
                  className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                >
                  {doc.attorney.email}
                </a>
              </div>
            </div>
          </div>

          {/* Sign or signed status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">
              {isSigned ? "Signature" : "Your Action"}
            </h3>

            {isSigned ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-800">
                  Signed by {signedBy || doc.signerName}
                </p>
                {doc.signedAt && (
                  <p className="text-xs text-emerald-600 mt-1">
                    {new Date(doc.signedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            ) : isExpired ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <Ban className="w-7 h-7 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-700 font-medium">Signing window closed</p>
                <p className="text-xs text-red-500 mt-1">Expired {doc.expiresAt}</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Review the document and AI summary above, then sign below.
                </p>
                <SignatureModal
                  documentId={doc.id}
                  documentTitle={doc.title}
                  onSigned={handleSigned}
                />
              </>
            )}
          </div>

          {/* Document details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Details</h3>
            <div className="space-y-3 text-xs">
              <DetailRow icon={FileText} label="Matter" value={doc.matter} />
              <DetailRow icon={Calendar} label="Sent" value={doc.uploadedAt} />
              <DetailRow
                icon={Clock}
                label={isExpired ? "Expired" : "Deadline"}
                value={doc.expiresAt}
                valueClass={
                  isExpired
                    ? "text-red-600"
                    : daysUntilExpiry <= 7
                    ? "text-amber-600 font-semibold"
                    : undefined
                }
              />
            </div>
          </div>

          {/* Activity feed — re-mounts when refreshFeed changes to re-fetch */}
          <ActivityFeed key={refreshFeed} documentId={doc.id} />
        </div>
      </div>
    </main>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-slate-400 uppercase tracking-wide text-[10px]">{label}</p>
        <p className={`text-slate-800 font-medium mt-0.5 ${valueClass ?? ""}`}>{value}</p>
      </div>
    </div>
  );
}
