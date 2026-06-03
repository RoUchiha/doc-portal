import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_DOCUMENTS } from "@/lib/documents";
import { appendEvent } from "@/lib/events";

const VALID_DOC_IDS = new Set(SAMPLE_DOCUMENTS.map((d) => d.id));

interface SignatureRecord {
  signerName: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
}

// In a real app: append-only signatures table in a database.
const signatures: Record<string, SignatureRecord> = {};

// Rate limiter: max 5 sign attempts per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { documentId, signerName } = body as Record<string, unknown>;

  if (typeof documentId !== "string" || !VALID_DOC_IDS.has(documentId)) {
    return NextResponse.json({ error: "Invalid document" }, { status: 400 });
  }

  const doc = SAMPLE_DOCUMENTS.find((d) => d.id === documentId)!;

  // Enforce expiry — expired documents cannot be signed
  if (new Date(doc.expiresAt) < new Date()) {
    return NextResponse.json(
      { error: "This document has expired and can no longer be signed." },
      { status: 410 }
    );
  }

  if (
    typeof signerName !== "string" ||
    signerName.trim().length === 0 ||
    signerName.trim().length > 200
  ) {
    return NextResponse.json(
      { error: "Signer name must be between 1 and 200 characters" },
      { status: 400 }
    );
  }

  if (signatures[documentId]) {
    return NextResponse.json(
      { error: "This document has already been signed." },
      { status: 409 }
    );
  }

  const safeName = signerName.trim().replace(/[<>"'`]/g, "");
  const signedAt = new Date().toISOString();

  signatures[documentId] = { signerName: safeName, signedAt, ipAddress: ip, userAgent };

  // Write to audit log
  appendEvent({
    documentId,
    type: "signed",
    label: `Document signed by ${safeName}`,
  });

  return NextResponse.json({
    success: true,
    documentId,
    signerName: safeName,
    signedAt,
    // Return just enough for the certificate — never return IP/UA to client
    certificate: {
      documentTitle: doc.title,
      matter: doc.matter,
      signerName: safeName,
      signedAt,
      attorney: doc.attorney.name,
      firm: doc.attorney.firm,
    },
  });
}
