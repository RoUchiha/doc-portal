import { describe, it, expect, vi, beforeEach } from "vitest";

// Helper to build a mock NextRequest
function mockRequest(body: unknown, ip = "127.0.0.1") {
  return {
    json: async () => body,
    headers: {
      get: (key: string) => {
        if (key === "x-forwarded-for") return ip;
        if (key === "user-agent") return "vitest";
        return null;
      },
    },
  } as unknown as import("next/server").NextRequest;
}

// Re-import fresh module each test to reset in-memory state
async function freshSignRoute() {
  vi.resetModules();
  const mod = await import("@/app/api/sign/route");
  return mod.POST;
}

describe("POST /api/sign", () => {
  it("rejects missing documentId", async () => {
    const POST = await freshSignRoute();
    const res = await POST(mockRequest({ signerName: "Alice" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("rejects unknown documentId", async () => {
    const POST = await freshSignRoute();
    const res = await POST(mockRequest({ documentId: "doc-fake", signerName: "Alice" }));
    expect(res.status).toBe(400);
  });

  it("rejects missing signerName", async () => {
    const POST = await freshSignRoute();
    const res = await POST(mockRequest({ documentId: "doc-001" }));
    expect(res.status).toBe(400);
  });

  it("rejects empty signerName", async () => {
    const POST = await freshSignRoute();
    const res = await POST(mockRequest({ documentId: "doc-001", signerName: "   " }));
    expect(res.status).toBe(400);
  });

  it("rejects signerName over 200 chars", async () => {
    const POST = await freshSignRoute();
    const res = await POST(mockRequest({ documentId: "doc-001", signerName: "A".repeat(201) }));
    expect(res.status).toBe(400);
  });

  it("rejects signing an expired document", async () => {
    const POST = await freshSignRoute();
    // doc-004 is expired
    const res = await POST(mockRequest({ documentId: "doc-004", signerName: "Alice" }));
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.error).toMatch(/expired/i);
  });

  it("successfully signs a pending document", async () => {
    const POST = await freshSignRoute();
    const res = await POST(mockRequest({ documentId: "doc-001", signerName: "Alice Smith" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.certificate).toBeDefined();
    expect(body.certificate.signerName).toBe("Alice Smith");
    expect(body.certificate.documentTitle).toBeTruthy();
    expect(body.certificate.matter).toBeTruthy();
    expect(body.signedAt).toBeTruthy();
  });

  it("strips HTML characters from signerName", async () => {
    const POST = await freshSignRoute();
    const res = await POST(mockRequest({ documentId: "doc-002", signerName: '<script>alert("xss")</script>' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.certificate.signerName).not.toContain("<");
    expect(body.certificate.signerName).not.toContain(">");
  });

  it("returns certificate without exposing IP or user-agent", async () => {
    const POST = await freshSignRoute();
    const res = await POST(mockRequest({ documentId: "doc-002", signerName: "Bob Jones" }));
    const body = await res.json();
    // IP and user-agent must NOT appear in the response
    expect(JSON.stringify(body)).not.toContain("127.0.0.1");
    expect(JSON.stringify(body)).not.toContain("vitest");
  });

  it("blocks re-signing an already-signed document with 409", async () => {
    const POST = await freshSignRoute();
    await POST(mockRequest({ documentId: "doc-001", signerName: "Alice" }));
    const res2 = await POST(mockRequest({ documentId: "doc-001", signerName: "Bob" }));
    expect(res2.status).toBe(409);
    const body = await res2.json();
    expect(body.error).toMatch(/already been signed/i);
  });

  it("rate limits after 5 requests from the same IP", async () => {
    const POST = await freshSignRoute();
    const ip = "10.0.0.1";
    // Use different doc IDs to avoid 409s interfering (only doc-001 and doc-002 are pending)
    // We just need 5+ requests; they'll hit 400/410 but still count toward rate limit
    for (let i = 0; i < 5; i++) {
      await POST(mockRequest({ documentId: "doc-001", signerName: `User ${i}` }, ip));
    }
    const res = await POST(mockRequest({ documentId: "doc-001", signerName: "Blocked" }, ip));
    expect(res.status).toBe(429);
  });

  it("rejects invalid JSON body", async () => {
    const POST = await freshSignRoute();
    const badReq = {
      json: async () => { throw new Error("bad json"); },
      headers: { get: () => null },
    } as unknown as import("next/server").NextRequest;
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });
});
