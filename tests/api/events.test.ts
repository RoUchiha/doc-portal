import { describe, it, expect, vi } from "vitest";

function mockPostRequest(body: unknown) {
  return {
    json: async () => body,
    headers: { get: () => null },
  } as unknown as import("next/server").NextRequest;
}

function mockGetRequest(documentId: string) {
  return {
    url: `http://localhost/api/events?documentId=${documentId}`,
  } as unknown as import("next/server").NextRequest;
}

async function freshEventsRoute() {
  vi.resetModules();
  return await import("@/app/api/events/route");
}

describe("GET /api/events", () => {
  it("returns 400 for missing documentId", async () => {
    const { GET } = await freshEventsRoute();
    const req = { url: "http://localhost/api/events" } as unknown as import("next/server").NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid documentId", async () => {
    const { GET } = await freshEventsRoute();
    const res = await GET(mockGetRequest("doc-fake"));
    expect(res.status).toBe(400);
  });

  it("returns array for valid documentId", async () => {
    const { GET } = await freshEventsRoute();
    const res = await GET(mockGetRequest("doc-001"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

describe("POST /api/events", () => {
  it("rejects invalid documentId", async () => {
    const { POST } = await freshEventsRoute();
    const res = await POST(mockPostRequest({ documentId: "doc-fake", type: "viewed", label: "Viewed" }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid event type", async () => {
    const { POST } = await freshEventsRoute();
    const res = await POST(mockPostRequest({ documentId: "doc-001", type: "hacked", label: "Bad" }));
    expect(res.status).toBe(400);
  });

  it("rejects label over 200 chars", async () => {
    const { POST } = await freshEventsRoute();
    const res = await POST(mockPostRequest({ documentId: "doc-001", type: "viewed", label: "X".repeat(201) }));
    expect(res.status).toBe(400);
  });

  it("successfully logs a viewed event", async () => {
    const { POST } = await freshEventsRoute();
    const res = await POST(mockPostRequest({ documentId: "doc-001", type: "viewed", label: "Document viewed" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.type).toBe("viewed");
    expect(body.documentId).toBe("doc-001");
    expect(body.timestamp).toBeTruthy();
  });

  it("successfully logs an ai_analyzed event", async () => {
    const { POST } = await freshEventsRoute();
    const res = await POST(mockPostRequest({ documentId: "doc-002", type: "ai_analyzed", label: "AI analysis requested" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.type).toBe("ai_analyzed");
  });

  it("successfully logs a signed event", async () => {
    const { POST } = await freshEventsRoute();
    const res = await POST(mockPostRequest({ documentId: "doc-003", type: "signed", label: "Signed by Test User" }));
    expect(res.status).toBe(201);
  });

  it("rejects invalid JSON", async () => {
    const { POST } = await freshEventsRoute();
    const badReq = {
      json: async () => { throw new Error("bad json"); },
      headers: { get: () => null },
    } as unknown as import("next/server").NextRequest;
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });
});
