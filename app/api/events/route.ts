import { NextRequest, NextResponse } from "next/server";
import { appendEvent, getEvents } from "@/lib/events";
import { SAMPLE_DOCUMENTS } from "@/lib/documents";

const VALID_DOC_IDS = new Set(SAMPLE_DOCUMENTS.map((d) => d.id));
const VALID_EVENT_TYPES = new Set(["viewed", "ai_analyzed", "signed"]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("documentId");
  if (!documentId || !VALID_DOC_IDS.has(documentId)) {
    return NextResponse.json({ error: "Invalid document" }, { status: 400 });
  }
  return NextResponse.json(getEvents(documentId));
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { documentId, type, label } = body as Record<string, unknown>;

  if (typeof documentId !== "string" || !VALID_DOC_IDS.has(documentId)) {
    return NextResponse.json({ error: "Invalid document" }, { status: 400 });
  }
  if (typeof type !== "string" || !VALID_EVENT_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }
  if (typeof label !== "string" || label.length > 200) {
    return NextResponse.json({ error: "Invalid label" }, { status: 400 });
  }

  const event = appendEvent({ documentId, type: type as "viewed" | "ai_analyzed" | "signed", label });
  return NextResponse.json(event, { status: 201 });
}
