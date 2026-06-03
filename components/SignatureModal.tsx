"use client";

import { useState } from "react";
import { Loader2, X, PenLine } from "lucide-react";
import SignatureCertificate from "./SignatureCertificate";

interface CertificateData {
  documentTitle: string;
  matter: string;
  signerName: string;
  signedAt: string;
  attorney: string;
  firm: string;
}

interface Props {
  documentId: string;
  documentTitle: string;
  onSigned: (signerName: string) => void;
}

export default function SignatureModal({ documentId, documentTitle, onSigned }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  async function handleSign() {
    if (!name.trim() || !agreed) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, signerName: name }),
      });

      const data = await res.json().catch(() => ({})) as Record<string, unknown>;

      if (!res.ok) {
        setError((data.error as string) || "Signing failed. Please try again.");
        return;
      }

      setOpen(false);
      setCertificate(data.certificate as CertificateData);
      onSigned(name);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {certificate && (
        <SignatureCertificate
          certificate={certificate}
          onClose={() => setCertificate(null)}
        />
      )}

      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
      >
        <PenLine className="w-4 h-4" />
        Sign Document
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Sign Document</h2>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-5">
              You are signing:{" "}
              <span className="font-medium text-slate-800">{documentTitle}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={200}
                  autoComplete="name"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 h-16 flex items-center justify-center">
                <span className="text-2xl text-slate-800" style={{ fontFamily: "cursive" }}>
                  {name || "Your signature"}
                </span>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600 leading-relaxed">
                  I have read and agree to the terms of this document. I understand this
                  constitutes a legally binding electronic signature under the ESIGN Act and UETA.
                </span>
              </label>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-2.5">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={!name.trim() || !agreed || loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing…
                  </>
                ) : (
                  "Confirm & Sign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
