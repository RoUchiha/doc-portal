import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function mockRequest(body: unknown, ip = "127.0.0.1") {
  return {
    json: async () => body,
    headers: { get: (k: string) => (k === "x-forwarded-for" ? ip : null) },
  } as unknown as import("next/server").NextRequest;
}

// Mock global fetch so tests never hit the real Groq API
const mockFetch = vi.fn();

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
    process.env.GROQ_API_KEY = "gsk_test_key_for_vitest";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GROQ_API_KEY;
  });

  async function getRoute() {
    const mod = await import("@/app/api/analyze/route");
    return mod.POST;
  }

  it("rejects missing documentId", async () => {
    const POST = await getRoute();
    const res = await POST(mockRequest({ title: "Test", content: "test" }));
    expect(res.status).toBe(400);
  });

  it("rejects unknown documentId", async () => {
    const POST = await getRoute();
    const res = await POST(mockRequest({ documentId: "doc-fake", title: "Test", content: "test" }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid title not matching any document", async () => {
    const POST = await getRoute();
    const res = await POST(mockRequest({ documentId: "doc-001", title: "Injected Title", content: "test" }));
    expect(res.status).toBe(400);
  });

  it("rejects content over 50,000 chars", async () => {
    const POST = await getRoute();
    const res = await POST(mockRequest({
      documentId: "doc-001",
      title: "Software Services Agreement",
      content: "A".repeat(50_001),
    }));
    expect(res.status).toBe(400);
  });

  it("returns 500 if GROQ_API_KEY is not set", async () => {
    delete process.env.GROQ_API_KEY;
    const POST = await getRoute();
    const res = await POST(mockRequest({
      documentId: "doc-001",
      title: "Software Services Agreement",
      content: "test",
    }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  it("returns analysis text on successful Groq response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "This is a plain-English summary." } }],
      }),
    });

    const POST = await getRoute();
    const res = await POST(mockRequest({
      documentId: "doc-001",
      title: "Software Services Agreement",
      content: "test content",
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.text).toBe("This is a plain-English summary.");
  });

  it("returns 502 when Groq API returns an error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const POST = await getRoute();
    const res = await POST(mockRequest({
      documentId: "doc-001",
      title: "Software Services Agreement",
      content: "test",
    }));

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/AI service error/i);
  });

  it("uses server-side document content, not client-supplied content", async () => {
    mockFetch.mockImplementationOnce(async (_url: string, opts: RequestInit) => {
      const body = JSON.parse(opts.body as string);
      const userMessage = body.messages.find((m: { role: string }) => m.role === "user").content;
      // The prompt must contain the REAL document content, not the client-sent "injected content"
      expect(userMessage).not.toContain("injected content");
      expect(userMessage).toContain("Software Services Agreement");
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content: "ok" } }] }),
      };
    });

    const POST = await getRoute();
    await POST(mockRequest({
      documentId: "doc-001",
      title: "Software Services Agreement",
      content: "injected content that should be ignored",
    }));

    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("rate limits after 10 requests from the same IP", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "ok" } }] }),
    });

    const POST = await getRoute();
    const ip = "192.168.1.99";
    const payload = { documentId: "doc-001", title: "Software Services Agreement", content: "t" };

    for (let i = 0; i < 10; i++) {
      await POST(mockRequest(payload, ip));
    }
    const res = await POST(mockRequest(payload, ip));
    expect(res.status).toBe(429);
  });

  it("rejects invalid JSON body", async () => {
    const POST = await getRoute();
    const badReq = {
      json: async () => { throw new Error("bad json"); },
      headers: { get: () => null },
    } as unknown as import("next/server").NextRequest;
    const res = await POST(badReq);
    expect(res.status).toBe(400);
  });
});
