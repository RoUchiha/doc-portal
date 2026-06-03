import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  useParams: () => ({}),
}));

// Suppress console.error noise in tests
vi.spyOn(console, "error").mockImplementation(() => {});
