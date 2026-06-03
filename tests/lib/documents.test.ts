import { describe, it, expect } from "vitest";
import { SAMPLE_DOCUMENTS } from "@/lib/documents";

describe("lib/documents", () => {
  it("exports at least 3 documents", () => {
    expect(SAMPLE_DOCUMENTS.length).toBeGreaterThanOrEqual(3);
  });

  it("every document has required fields", () => {
    for (const doc of SAMPLE_DOCUMENTS) {
      expect(doc.id).toBeTruthy();
      expect(doc.title).toBeTruthy();
      expect(doc.content).toBeTruthy();
      expect(doc.matter).toBeTruthy();
      expect(doc.attorney).toBeDefined();
      expect(doc.attorney.name).toBeTruthy();
      expect(doc.attorney.firm).toBeTruthy();
      expect(doc.attorney.email).toContain("@");
      expect(["pending", "signed", "expired"]).toContain(doc.status);
    }
  });

  it("document IDs are unique", () => {
    const ids = SAMPLE_DOCUMENTS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("expiresAt is a valid date string", () => {
    for (const doc of SAMPLE_DOCUMENTS) {
      const d = new Date(doc.expiresAt);
      expect(d.toString()).not.toBe("Invalid Date");
    }
  });

  it("signed documents have signerName and signedAt", () => {
    const signed = SAMPLE_DOCUMENTS.filter((d) => d.status === "signed");
    expect(signed.length).toBeGreaterThanOrEqual(1);
    for (const doc of signed) {
      expect(doc.signerName).toBeTruthy();
      expect(doc.signedAt).toBeTruthy();
      expect(new Date(doc.signedAt!).toString()).not.toBe("Invalid Date");
    }
  });

  it("expired documents have a past expiresAt", () => {
    const expired = SAMPLE_DOCUMENTS.filter((d) => d.status === "expired");
    expect(expired.length).toBeGreaterThanOrEqual(1);
    for (const doc of expired) {
      expect(new Date(doc.expiresAt).getTime()).toBeLessThan(Date.now());
    }
  });

  it("all content fields are non-empty strings", () => {
    for (const doc of SAMPLE_DOCUMENTS) {
      expect(typeof doc.content).toBe("string");
      expect(doc.content.length).toBeGreaterThan(100);
    }
  });
});
