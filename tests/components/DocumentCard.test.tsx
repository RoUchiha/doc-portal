import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DocumentCard from "@/components/DocumentCard";
import { SAMPLE_DOCUMENTS } from "@/lib/documents";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("DocumentCard", () => {
  const pendingDoc = SAMPLE_DOCUMENTS.find((d) => d.status === "pending")!;
  const signedDoc = SAMPLE_DOCUMENTS.find((d) => d.status === "signed")!;
  const expiredDoc = SAMPLE_DOCUMENTS.find((d) => d.status === "expired")!;

  it("renders document title", () => {
    render(<DocumentCard doc={pendingDoc} />);
    expect(screen.getByText(pendingDoc.title)).toBeInTheDocument();
  });

  it("renders attorney name and firm", () => {
    render(<DocumentCard doc={pendingDoc} />);
    expect(screen.getByText(new RegExp(pendingDoc.attorney.name))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(pendingDoc.attorney.firm))).toBeInTheDocument();
  });

  it("shows 'Signature Required' badge for pending documents", () => {
    render(<DocumentCard doc={pendingDoc} />);
    expect(screen.getByText("Signature Required")).toBeInTheDocument();
  });

  it("shows 'Signed' badge for signed documents", () => {
    render(<DocumentCard doc={signedDoc} />);
    expect(screen.getByText("Signed")).toBeInTheDocument();
  });

  it("shows 'Expired' badge for expired documents", () => {
    render(<DocumentCard doc={expiredDoc} />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("links to the correct document page", () => {
    render(<DocumentCard doc={pendingDoc} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/documents/${pendingDoc.id}`);
  });

  it("shows page count", () => {
    render(<DocumentCard doc={pendingDoc} />);
    expect(screen.getByText(`${pendingDoc.pages} pages`)).toBeInTheDocument();
  });

  it("shows due date for pending docs", () => {
    render(<DocumentCard doc={pendingDoc} />);
    expect(screen.getByText(`Due ${pendingDoc.expiresAt}`)).toBeInTheDocument();
  });

  it("shows signed date for signed docs", () => {
    render(<DocumentCard doc={signedDoc} />);
    const signedDate = new Date(signedDoc.signedAt!).toLocaleDateString();
    expect(screen.getByText(`Signed ${signedDate}`)).toBeInTheDocument();
  });

  it("shows expired date for expired docs", () => {
    render(<DocumentCard doc={expiredDoc} />);
    expect(screen.getByText(`Expired ${expiredDoc.expiresAt}`)).toBeInTheDocument();
  });
});
