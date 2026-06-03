# DocSign — AI-Powered Client Document Portal

A client-facing portal for law firms to send, track, and collect signatures on legal documents — with an AI layer that translates dense legal language into plain English before the client signs.

**Live demo:** https://doc-portal-omega-murex.vercel.app  
**Repository:** https://github.com/RoUchiha/doc-portal

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Groq (Llama 3.3 70B)

---

## The Problem

Clients regularly sign contracts they don't understand. They're busy, legal language is deliberately dense, and asking their attorney to explain every clause is expensive. The result: uninformed consent, post-signature disputes, and erosion of client trust.

Separately, law firms have no easy way to give clients a professional document experience. Email attachments are informal, tracking is manual, and there's no audit trail short of expensive DocuSign seats.

## What I Built

A client portal that solves both problems:

1. **Document dashboard** — Clients see all documents grouped by legal matter, with clear status (pending, signed, expired) and deadlines. No searching inboxes for attachments.

2. **AI document analysis** — One click gives a plain-English breakdown of what a contract says, what to watch out for, and exactly what the client is agreeing to. Streams in real-time via Groq (Llama 3.3 70B). The AI is prompted to ignore any instructions embedded in the document itself (prompt injection defense).

3. **E-signature flow** — Client enters their name, sees a live cursive preview, checks a consent box, and signs. The server enforces ESIGN Act / UETA requirements: records timestamp, IP address, and user-agent for the audit trail.

4. **Signature certificate** — Immediately after signing, the client receives a completion receipt with reference ID, matter name, attorney, and firm. No ambiguity about what they signed or when.

5. **Audit trail** — Every document has a timestamped activity feed: viewed, AI analysis requested, signed. In production this becomes the compliance record for e-signature disputes.

6. **Expiry enforcement** — Expired documents display a locked state with the attorney's contact email. The server also blocks signing at the API level — not just the UI.

## Product Decisions & Tradeoffs

**Why group by Matter?**
Law firms organize work around matters (cases, transactions). A client with multiple ongoing engagements needs to see which documents belong to which project, not a flat list of titles. This is table stakes for legal UX.

**Why stream the AI response?**
Legal documents are long. A 2–3 second wait with no feedback feels broken. Streaming lets the client see the analysis building in real-time, which is both faster-feeling and more readable.

**Why not render PDFs?**
`react-pdf` is installed but unused. Rendering PDFs in-browser is high-complexity for uncertain gain at the demo stage — text reflow, annotation layers, mobile support. I prioritized the AI + signature flow. In production: use a purpose-built PDF viewer or pre-render server-side.

**Why is document content served server-side?**
The client sends only a `documentId`. The server looks up the real content. This means a malicious actor can't craft a payload to inject arbitrary text into the AI prompt. Defense-in-depth against prompt injection.

**What I'd build next (in priority order):**
1. **Real database** — PostgreSQL with append-only `signatures` and `audit_events` tables
2. **Auth** — Per-client login (email magic link or SSO). The portal is currently public.
3. **PDF rendering** — Display the actual uploaded PDF, not extracted text
4. **Attorney upload flow** — Attorneys send documents from the same portal
5. **Email notifications** — Notify clients on new docs; notify attorneys on signature
6. **Multi-party signing** — Countersignature from the attorney
7. **Firm-level theming** — White-label portal with firm logo and colors

## Architecture

```
app/
  page.tsx                    # Dashboard — grouped by matter
  documents/[id]/page.tsx     # Document view + sign
  api/
    analyze/route.ts          # Groq streaming endpoint
    sign/route.ts             # Signature capture + audit
    events/route.ts           # Audit trail read/write

components/
  DocumentCard.tsx            # Dashboard card with status + attorney
  AiAnalysis.tsx              # Streaming AI panel
  SignatureModal.tsx          # Sign flow
  SignatureCertificate.tsx    # Post-sign receipt
  ActivityFeed.tsx            # Per-document audit timeline

lib/
  documents.ts                # Document + Attorney types + seed data
  events.ts                   # Audit event store
```

## Security Measures

- API keys server-side only (no `NEXT_PUBLIC_` prefix)
- All AI output rendered as safe React nodes — no `dangerouslySetInnerHTML`
- Document content served from server; client-sent content ignored
- Document IDs validated against allowlist on every request
- Re-signing blocked at API level (409)
- Expiry enforced at API level (410) — not just UI
- Rate limiting: 5 signs/min, 10 analyses/min per IP
- Signer name sanitized (HTML chars stripped server-side)
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## Running Locally

```bash
npm install
# Create .env.local with your Groq API key (free at console.groq.com)
echo "GROQ_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
