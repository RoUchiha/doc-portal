import { SAMPLE_DOCUMENTS } from "@/lib/documents";
import DocumentCard from "@/components/DocumentCard";
import { Shield, FileText, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  const pending = SAMPLE_DOCUMENTS.filter((d) => d.status === "pending");
  const signed = SAMPLE_DOCUMENTS.filter((d) => d.status === "signed");
  const expired = SAMPLE_DOCUMENTS.filter((d) => d.status === "expired");

  // Group pending docs by matter
  const pendingByMatter = pending.reduce<Record<string, typeof pending>>(
    (acc, doc) => {
      if (!acc[doc.matter]) acc[doc.matter] = [];
      acc[doc.matter].push(doc);
      return acc;
    },
    {}
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg">DocSign</span>
              <span className="text-slate-400 text-sm ml-2">Client Portal</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Welcome, <span className="font-medium text-slate-700">Alex Johnson</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1.5">
              <FileText className="w-3.5 h-3.5" />
              Total Documents
            </div>
            <p className="text-3xl font-bold text-slate-900">{SAMPLE_DOCUMENTS.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 p-5">
            <div className="flex items-center gap-2 text-amber-500 text-xs mb-1.5">
              <Clock className="w-3.5 h-3.5" />
              Awaiting Signature
            </div>
            <p className="text-3xl font-bold text-slate-900">{pending.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-emerald-100 p-5">
            <div className="flex items-center gap-2 text-emerald-500 text-xs mb-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Completed
            </div>
            <p className="text-3xl font-bold text-slate-900">{signed.length}</p>
          </div>
        </div>

        {/* Pending — grouped by matter */}
        {pending.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <h2 className="font-semibold text-slate-800">Action Required</h2>
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            </div>

            {Object.entries(pendingByMatter).map(([matter, docs]) => (
              <div key={matter} className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  {matter}
                </p>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Signed */}
        {signed.length > 0 && (
          <section className="mb-10">
            <h2 className="font-semibold text-slate-800 mb-4">Completed</h2>
            <div className="space-y-3">
              {signed.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </section>
        )}

        {/* Expired */}
        {expired.length > 0 && (
          <section>
            <h2 className="font-semibold text-slate-400 mb-4 text-sm">Expired</h2>
            <div className="space-y-3 opacity-60">
              {expired.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
