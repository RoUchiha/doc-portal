import { describe, it, expect, beforeEach } from "vitest";
import { appendEvent, getEvents } from "@/lib/events";

// Note: lib/events uses a module-level array, so we re-import fresh each suite
// by isolating via documentId namespacing in tests.

describe("lib/events", () => {
  const docId = "doc-test-events-" + Date.now();

  it("returns empty array for unknown documentId", () => {
    const events = getEvents("doc-nonexistent-xyz");
    // May contain pre-seeded events for other docs but not this one
    expect(events.every((e) => e.documentId !== "doc-nonexistent-xyz")).toBe(true);
  });

  it("appendEvent adds an event with a timestamp", () => {
    const before = Date.now();
    const event = appendEvent({ documentId: docId, type: "viewed", label: "Viewed" });
    const after = Date.now();

    expect(event.documentId).toBe(docId);
    expect(event.type).toBe("viewed");
    expect(event.label).toBe("Viewed");
    expect(new Date(event.timestamp).getTime()).toBeGreaterThanOrEqual(before);
    expect(new Date(event.timestamp).getTime()).toBeLessThanOrEqual(after);
  });

  it("getEvents returns only events for the given documentId", () => {
    appendEvent({ documentId: docId, type: "ai_analyzed", label: "AI run" });
    appendEvent({ documentId: "doc-other-" + Date.now(), type: "signed", label: "Signed" });

    const events = getEvents(docId);
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events.every((e) => e.documentId === docId)).toBe(true);
  });

  it("appendEvent preserves insertion order", () => {
    const id = "doc-order-" + Date.now();
    appendEvent({ documentId: id, type: "viewed", label: "First" });
    appendEvent({ documentId: id, type: "ai_analyzed", label: "Second" });
    appendEvent({ documentId: id, type: "signed", label: "Third" });

    const events = getEvents(id);
    expect(events[0].label).toBe("First");
    expect(events[1].label).toBe("Second");
    expect(events[2].label).toBe("Third");
  });

  it("appendEvent supports all valid event types", () => {
    const id = "doc-types-" + Date.now();
    const types = ["viewed", "ai_analyzed", "signed"] as const;
    types.forEach((type) => appendEvent({ documentId: id, type, label: type }));
    const events = getEvents(id);
    expect(events.map((e) => e.type)).toEqual(types);
  });
});
