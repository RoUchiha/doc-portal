export type EventType = "viewed" | "ai_analyzed" | "signed";

export interface AuditEvent {
  type: EventType;
  documentId: string;
  timestamp: string;
  label: string;
}

// Server-side in-memory audit log. In production: append-only DB table.
const eventLog: AuditEvent[] = [
  // Pre-seed the signed doc with realistic history
  {
    type: "viewed",
    documentId: "doc-003",
    timestamp: "2026-05-11T10:05:00Z",
    label: "Document viewed",
  },
  {
    type: "ai_analyzed",
    documentId: "doc-003",
    timestamp: "2026-05-11T10:06:20Z",
    label: "AI analysis requested",
  },
  {
    type: "signed",
    documentId: "doc-003",
    timestamp: "2026-05-12T14:32:00Z",
    label: "Document signed by Alex Johnson",
  },
];

export function appendEvent(event: Omit<AuditEvent, "timestamp">): AuditEvent {
  const full: AuditEvent = { ...event, timestamp: new Date().toISOString() };
  eventLog.push(full);
  return full;
}

export function getEvents(documentId: string): AuditEvent[] {
  return eventLog.filter((e) => e.documentId === documentId);
}
