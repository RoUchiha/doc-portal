import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignatureModal from "@/components/SignatureModal";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("SignatureModal", () => {
  const defaultProps = {
    documentId: "doc-001",
    documentTitle: "Software Services Agreement",
    onSigned: vi.fn(),
  };

  beforeEach(() => {
    mockFetch.mockReset();
    defaultProps.onSigned = vi.fn();
  });

  it("renders the Sign Document button", () => {
    render(<SignatureModal {...defaultProps} />);
    expect(screen.getByText("Sign Document")).toBeInTheDocument();
  });

  it("opens modal when Sign Document is clicked", async () => {
    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));
    expect(screen.getByText("Sign Document", { selector: "h2" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your full name")).toBeInTheDocument();
  });

  it("shows the document title in the modal", async () => {
    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));
    expect(screen.getByText("Software Services Agreement")).toBeInTheDocument();
  });

  it("Confirm & Sign button is disabled until name and checkbox are filled", async () => {
    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));

    const confirmBtn = screen.getByText("Confirm & Sign");
    expect(confirmBtn).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText("Enter your full name"), "Alice");
    expect(confirmBtn).toBeDisabled(); // still needs checkbox

    await userEvent.click(screen.getByRole("checkbox"));
    expect(confirmBtn).not.toBeDisabled();
  });

  it("updates cursive signature preview as user types", async () => {
    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));
    const input = screen.getByPlaceholderText("Enter your full name");
    await userEvent.type(input, "Alice Smith");
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("input enforces maxLength of 200", async () => {
    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));
    const input = screen.getByPlaceholderText("Enter your full name");
    expect(input).toHaveAttribute("maxlength", "200");
  });

  it("calls API and onSigned on successful submission", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        signedAt: new Date().toISOString(),
        certificate: {
          documentTitle: "Software Services Agreement",
          matter: "Test Matter",
          signerName: "Alice Smith",
          signedAt: new Date().toISOString(),
          attorney: "Sarah Chen",
          firm: "Harrowgate & Associates LLP",
        },
      }),
    });

    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));
    await userEvent.type(screen.getByPlaceholderText("Enter your full name"), "Alice Smith");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByText("Confirm & Sign"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/sign",
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(defaultProps.onSigned).toHaveBeenCalledWith("Alice Smith");
    });
  });

  it("shows error message on 409 (already signed)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: "This document has already been signed." }),
    });

    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));
    await userEvent.type(screen.getByPlaceholderText("Enter your full name"), "Bob");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByText("Confirm & Sign"));

    await waitFor(() => {
      expect(screen.getByText("This document has already been signed.")).toBeInTheDocument();
    });
  });

  it("shows error message on 410 (expired)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 410,
      json: async () => ({ error: "This document has expired and can no longer be signed." }),
    });

    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));
    await userEvent.type(screen.getByPlaceholderText("Enter your full name"), "Bob");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByText("Confirm & Sign"));

    await waitFor(() => {
      expect(screen.getByText(/expired/i)).toBeInTheDocument();
    });
  });

  it("closes modal when Cancel is clicked", async () => {
    render(<SignatureModal {...defaultProps} />);
    await userEvent.click(screen.getByText("Sign Document"));
    expect(screen.getByPlaceholderText("Enter your full name")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByPlaceholderText("Enter your full name")).not.toBeInTheDocument();
  });
});
