export type DocumentStatus = "pending" | "signed" | "expired";

export interface Attorney {
  name: string;
  title: string;
  email: string;
  firm: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  uploadedAt: string;
  expiresAt: string;
  pages: number;
  fileUrl: string;
  content: string;
  matter: string;          // legal matter / case this belongs to
  attorney: Attorney;      // who sent it
  clientName: string;
  signerName?: string;
  signedAt?: string;
}

const GLADE_ATTORNEY: Attorney = {
  name: "Sarah Chen",
  title: "Partner",
  email: "s.chen@harrowgate.law",
  firm: "Harrowgate & Associates LLP",
};

const STARTUP_ATTORNEY: Attorney = {
  name: "Marcus Webb",
  title: "Associate",
  email: "m.webb@harrowgate.law",
  firm: "Harrowgate & Associates LLP",
};

export const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: "doc-001",
    title: "Software Services Agreement",
    description:
      "Master services agreement governing the software development engagement between your company and Glade Technologies.",
    status: "pending",
    uploadedAt: "2026-05-28",
    expiresAt: "2026-06-30",
    pages: 4,
    fileUrl: "/sample-docs/services-agreement.pdf",
    matter: "Glade Technologies — Platform Development",
    attorney: GLADE_ATTORNEY,
    clientName: "Alex Johnson",
    content: `SOFTWARE SERVICES AGREEMENT

This Software Services Agreement ("Agreement") is entered into as of May 28, 2026, between Glade Technologies, Inc. ("Company") and the undersigned client ("Client").

1. SERVICES
The Company agrees to provide software development, consulting, and maintenance services as described in each Statement of Work ("SOW") executed under this Agreement.

2. PAYMENT TERMS
Client shall pay invoices within thirty (30) days of receipt. Late payments accrue interest at 1.5% per month. All fees are non-refundable unless otherwise specified in the applicable SOW.

3. INTELLECTUAL PROPERTY
All work product, inventions, and deliverables created by Company under this Agreement shall be owned by Client upon full payment. Company retains a license to use anonymized work product as portfolio examples.

4. CONFIDENTIALITY
Both parties agree to keep confidential all proprietary information disclosed during the engagement. This obligation survives termination for five (5) years.

5. LIMITATION OF LIABILITY
IN NO EVENT SHALL COMPANY BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. COMPANY'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID IN THE THREE MONTHS PRECEDING THE CLAIM.

6. TERMINATION
Either party may terminate this Agreement with thirty (30) days written notice. Company may terminate immediately upon Client's material breach or non-payment.

7. DISPUTE RESOLUTION
Disputes shall first be addressed through good-faith negotiation, then mediation, and finally binding arbitration under AAA rules in Delaware.

8. GOVERNING LAW
This Agreement is governed by the laws of the State of Delaware.

9. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements.

By signing below, the parties agree to the terms of this Agreement.`,
  },
  {
    id: "doc-002",
    title: "Mutual Non-Disclosure Agreement",
    description:
      "Mutual NDA covering proprietary information shared during the project engagement.",
    status: "pending",
    uploadedAt: "2026-05-30",
    expiresAt: "2026-06-15",
    pages: 2,
    fileUrl: "/sample-docs/nda.pdf",
    matter: "Glade Technologies — Platform Development",
    attorney: GLADE_ATTORNEY,
    clientName: "Alex Johnson",
    content: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("NDA") is effective June 1, 2026, between the parties identified below.

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any non-public technical, business, financial, or operational information disclosed by either party, whether orally, in writing, or electronically, and marked or reasonably understood to be confidential.

2. OBLIGATIONS
Each party agrees to: (a) hold Confidential Information in strict confidence; (b) not disclose it to third parties without prior written consent; (c) use it solely for evaluating a potential business relationship; (d) protect it with at least the same degree of care used for its own confidential information, but no less than reasonable care.

3. EXCLUSIONS
Obligations do not apply to information that: (a) is or becomes publicly available through no fault of the recipient; (b) was rightfully known prior to disclosure; (c) is independently developed without use of Confidential Information; (d) is required to be disclosed by law or court order.

4. TERM
This NDA is effective for two (2) years from the date above. Confidentiality obligations for trade secrets survive indefinitely.

5. RETURN OF INFORMATION
Upon request, each party will promptly return or destroy all Confidential Information and certify destruction in writing.

6. REMEDIES
A breach of this NDA may cause irreparable harm. Either party may seek injunctive relief in addition to any other legal remedies.

By signing, both parties agree to the terms of this NDA.`,
  },
  {
    id: "doc-003",
    title: "Product License Agreement",
    description:
      "End-user license agreement for Glade platform access, covering usage rights and restrictions.",
    status: "signed",
    uploadedAt: "2026-05-10",
    expiresAt: "2027-05-10",
    pages: 3,
    fileUrl: "/sample-docs/license.pdf",
    matter: "Glade Technologies — SaaS Licensing",
    attorney: STARTUP_ATTORNEY,
    clientName: "Alex Johnson",
    signerName: "Alex Johnson",
    signedAt: "2026-05-12T14:32:00Z",
    content: `PRODUCT LICENSE AGREEMENT

This Product License Agreement is dated May 10, 2026.

1. GRANT OF LICENSE
Subject to the terms herein, Glade Technologies grants Client a non-exclusive, non-transferable, limited license to access and use the Glade platform solely for Client's internal business purposes.

2. RESTRICTIONS
Client may not: (a) sublicense, sell, or transfer the platform; (b) reverse engineer or decompile the software; (c) use the platform to build a competing product; (d) exceed the user seats specified in the order form.

3. SUBSCRIPTION AND FEES
License fees are due annually in advance. Glade may adjust fees with 60 days notice at renewal. No refunds for early termination.

4. DATA AND PRIVACY
Client retains ownership of all data submitted to the platform. Glade processes data per its Privacy Policy. Glade implements industry-standard security measures.

5. UPDATES AND SUPPORT
Glade will provide platform updates and standard support during the subscription term. Premium support is available for an additional fee.

6. WARRANTY DISCLAIMER
THE PLATFORM IS PROVIDED "AS IS." GLADE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

7. AUTO-RENEWAL
This license automatically renews annually unless either party provides 30 days written notice of non-renewal before the renewal date.

Signed and agreed by the parties.`,
  },
  {
    id: "doc-004",
    title: "Statement of Work — Phase 1",
    description:
      "Detailed scope, timeline, and deliverables for the initial platform development phase.",
    status: "expired",
    uploadedAt: "2026-04-01",
    expiresAt: "2026-05-01",
    pages: 5,
    fileUrl: "/sample-docs/sow.pdf",
    matter: "Glade Technologies — Platform Development",
    attorney: STARTUP_ATTORNEY,
    clientName: "Alex Johnson",
    content: `STATEMENT OF WORK — PHASE 1

Effective Date: April 1, 2026
Matter: Glade Technologies Platform Development

1. SCOPE OF WORK
Contractor shall deliver the following during Phase 1:
- System architecture design and technical specification
- Core API development (authentication, document management, user management)
- Frontend portal MVP (React/Next.js)
- CI/CD pipeline setup and deployment to staging

2. TIMELINE
Phase 1 shall commence April 1, 2026 and conclude May 30, 2026.
Milestone 1 (Architecture): April 15, 2026
Milestone 2 (API Alpha): May 1, 2026
Milestone 3 (MVP): May 30, 2026

3. COMPENSATION
Fixed fee of $45,000 payable in three installments:
- 33% upon SOW execution
- 33% upon Milestone 2 acceptance
- 34% upon final delivery and acceptance

4. ACCEPTANCE CRITERIA
Each milestone requires written acceptance within 5 business days of delivery. Silence constitutes acceptance.

5. CHANGE ORDERS
Changes to scope require a written change order signed by both parties before work begins.`,
  },
];
