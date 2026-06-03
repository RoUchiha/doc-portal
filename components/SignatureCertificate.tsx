"use client";

import { CheckCircle, Download, Shield } from "lucide-react";

interface CertificateData {
  documentTitle: string;
  matter: string;
  signerName: string;
  signedAt: string;
  attorney: string;
  firm: string;
}

interface Props {
  certificate: CertificateData;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    hour12: true,
  });
}

export default function SignatureCertificate({ certificate, onClose }: Props) {
  const referenceId = `ESIG-${certificate.signedAt.replace(/\D/g, "").slice(0, 14)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-lg font-bold">Signature Complete</h2>
          </div>
          <p className="text-emerald-100 text-sm">
            Your electronic signature has been recorded and is legally binding.
          </p>
        </div>

        {/* Certificate body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 text-sm">
            <Row label="Document" value={certificate.documentTitle} />
            <Row label="Matter" value={certificate.matter} />
            <Row label="Signed by" value={certificate.signerName} mono />
            <Row label="Date & time" value={formatDate(certificate.signedAt)} />
            <Row label="Prepared by" value={`${certificate.attorney}, ${certificate.firm}`} />
            <Row label="Reference ID" value={referenceId} mono />
          </div>

          <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              This signature was executed under the Electronic Signatures in Global and National
              Commerce Act (ESIGN) and the Uniform Electronic Transactions Act (UETA). The
              timestamp, IP address, and browser signature have been recorded for audit purposes.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
      <span
        className={`text-slate-800 font-medium ${mono ? "font-mono text-xs" : "text-sm"}`}
      >
        {value}
      </span>
    </div>
  );
}
