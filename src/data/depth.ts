// Operational-depth seed data layered onto each lead:
// stakeholders, blockers, data issues, email threads, internal comments, attachments.

import type {
  Stakeholder,
  Blocker,
  DataIssue,
  EmailMessage,
  InternalComment,
  Attachment,
} from "./types";
import { daysAgo, hoursAgo } from "./time";

export const stakeholdersByLead: Record<string, Stakeholder[]> = {
  "L-1042": [
    {
      id: "s-1042-a",
      name: "Avery Bloomfield",
      title: "VP, Revenue Operations",
      role: "Champion",
      status: "engaged",
      lastContactAt: hoursAgo(2),
    },
    {
      id: "s-1042-b",
      name: "Marcus Penn",
      title: "General Counsel",
      role: "Legal",
      status: "blocking",
      lastContactAt: daysAgo(7),
    },
    {
      id: "s-1042-c",
      name: "Renata Soto",
      title: "Director, Finance",
      role: "Economic Buyer",
      status: "warm",
      lastContactAt: daysAgo(11),
    },
  ],
  "L-1038": [
    {
      id: "s-1038-a",
      name: "Marcus Devlin",
      title: "Head of GTM",
      role: "Champion",
      status: "engaged",
      lastContactAt: daysAgo(4),
    },
    {
      id: "s-1038-b",
      name: "Hannah Yu",
      title: "CFO",
      role: "Economic Buyer",
      status: "warm",
      lastContactAt: daysAgo(2),
    },
  ],
  "L-1031": [
    {
      id: "s-1031-a",
      name: "Renée Okafor",
      title: "Director of Sales Enablement",
      role: "Champion",
      status: "engaged",
      lastContactAt: daysAgo(2),
    },
    {
      id: "s-1031-b",
      name: "Daniel Ortiz",
      title: "CISO",
      role: "Technical Buyer",
      status: "unknown",
    },
  ],
  "L-1029": [
    {
      id: "s-1029-a",
      name: "Theo Hartmann",
      title: "COO",
      role: "Economic Buyer",
      status: "cold",
      lastContactAt: daysAgo(12),
    },
  ],
  "L-1024": [
    {
      id: "s-1024-a",
      name: "Sasha Berger",
      title: "VP of Marketing",
      role: "Champion",
      status: "engaged",
      lastContactAt: daysAgo(1),
    },
    {
      id: "s-1024-b",
      name: "Iris Mendez",
      title: "CMO",
      role: "Economic Buyer",
      status: "warm",
      lastContactAt: daysAgo(5),
    },
  ],
  "L-1019": [
    {
      id: "s-1019-a",
      name: "Owen Caldwell",
      title: "Director of Business Development",
      role: "Champion",
      status: "warm",
      lastContactAt: daysAgo(9),
    },
  ],
  "L-1015": [
    {
      id: "s-1015-a",
      name: "Yuki Tanaka",
      title: "Head of CX",
      role: "Champion",
      status: "engaged",
      lastContactAt: daysAgo(3),
    },
  ],
  "L-1011": [
    {
      id: "s-1011-a",
      name: "Cameron Liu",
      title: "Chief of Staff",
      role: "Economic Buyer",
      status: "warm",
      lastContactAt: daysAgo(5),
    },
  ],
};

export const blockersByLead: Record<string, Blocker[]> = {
  "L-1042": [
    {
      id: "b-1042-1",
      kind: "legal_review",
      label: "Waiting on legal · MSA redlines",
      since: daysAgo(7),
      setBy: "rep_morgan",
      detail: "Legal flagged sections 7.2 and 11. Want a 20-min review with our counsel.",
    },
  ],
  "L-1029": [
    {
      id: "b-1029-1",
      kind: "champion_dark",
      label: "Champion went dark",
      since: daysAgo(12),
      setBy: "rep_dante",
      detail: "Theo hasn't replied since the ROI model was sent.",
    },
  ],
  "L-1031": [
    {
      id: "b-1031-1",
      kind: "security_review",
      label: "Security review pending",
      since: daysAgo(2),
      setBy: "rep_priya",
      detail: "CISO has not been formally engaged yet.",
    },
  ],
  "L-1019": [
    {
      id: "b-1019-1",
      kind: "competitive",
      label: "Competitive eval (RouteWise)",
      since: daysAgo(9),
      setBy: "rep_kenji",
      detail: "Owen mentioned RouteWise is also in active eval.",
    },
  ],
  "L-1011": [
    {
      id: "b-1011-1",
      kind: "missing_decision_maker",
      label: "Day-to-day champion missing",
      since: daysAgo(5),
      setBy: "rep_morgan",
      detail: "Cameron is exec sponsor; no operational champion identified.",
    },
  ],
};

export const dataIssuesByLead: Record<string, DataIssue[]> = {
  "L-1029": ["stale_contact", "no_champion"],
  "L-1011": ["no_decision_maker"],
  "L-1004": ["no_next_touch", "stale_contact"],
  "L-1002": ["no_next_touch"],
  "L-1045": ["missing_industry"],
  "L-1019": ["duplicate_suspected"],
};

// One pair of suspected duplicates for realism
export const duplicates: Record<string, string> = {
  "L-1019": "L-1009", // Pacific Ridge similar to Mason & Hart in industry/size
};

export const unreadEmailsByLead: Record<string, number> = {
  "L-1042": 1,
  "L-1024": 2,
  "L-1031": 1,
  "L-1004": 1,
};

export const emailThreadsByLead: Record<string, EmailMessage[]> = {
  "L-1042": [
    {
      id: "e-1042-1",
      leadId: "L-1042",
      direction: "in",
      from: "Avery Bloomfield <abloomfield@helixrobotics.com>",
      to: "Morgan Avery <morgan.avery@northwind.io>",
      subject: "Re: MSA redlines",
      body: "Morgan — legal flagged sections 7.2 and 11. We'd like a 20-min review with your counsel. Wednesday afternoon would work for our team. Procurement will need a copy of the SOC 2 report before we finalize.",
      at: hoursAgo(2),
      unread: true,
    },
    {
      id: "e-1042-2",
      leadId: "L-1042",
      direction: "out",
      from: "Morgan Avery",
      to: "Avery Bloomfield",
      subject: "MSA redlines · returning your markup",
      body: "Avery — attached is our redline back. Tried to keep the spirit of your changes; the only place I pushed back was on the indemnity cap. Happy to walk through it live if useful.",
      at: daysAgo(9),
      attachments: [{ name: "Northwind-Helix-MSA-v3.pdf", size: "412 KB" }],
    },
    {
      id: "e-1042-3",
      leadId: "L-1042",
      direction: "in",
      from: "Avery Bloomfield",
      to: "Morgan Avery",
      subject: "Re: Pricing approved",
      body: "Got internal approval from Renata on the $84k — we're cleared budget-wise. Now just need to get past legal. Should be straightforward.",
      at: daysAgo(13),
    },
  ],
  "L-1038": [
    {
      id: "e-1038-1",
      leadId: "L-1038",
      direction: "in",
      from: "Marcus Devlin",
      to: "Morgan Avery",
      subject: "Forwarded to Hannah",
      body: "Morgan — sent the proposal up to our CFO Hannah. She'll likely want to see hard ROI evidence. Anything you can share on payback period from similar customers?",
      at: daysAgo(4),
    },
    {
      id: "e-1038-2",
      leadId: "L-1038",
      direction: "out",
      from: "Morgan Avery",
      to: "Marcus Devlin",
      subject: "Northforge proposal · final",
      body: "Marcus — proposal attached. Pricing is locked at the bands we discussed; I left Q4 implementation flexible.",
      at: daysAgo(4),
      attachments: [{ name: "Northforge-Proposal-v2.pdf", size: "1.1 MB" }],
    },
  ],
  "L-1024": [
    {
      id: "e-1024-1",
      leadId: "L-1024",
      direction: "in",
      from: "Sasha Berger",
      to: "Priya Shankar",
      subject: "Re: Pilot extension",
      body: "Priya — Iris is supportive. Want to confirm 90 days vs. 60 — can we lock terms in writing today? We'd like to kick off Monday.",
      at: hoursAgo(5),
      unread: true,
    },
    {
      id: "e-1024-2",
      leadId: "L-1024",
      direction: "in",
      from: "Sasha Berger",
      to: "Priya Shankar",
      subject: "Re: Verbal yes",
      body: "Iris signed off internally. Sending you the green light — let's get the pilot terms locked.",
      at: daysAgo(1),
      unread: true,
    },
  ],
  "L-1031": [
    {
      id: "e-1031-1",
      leadId: "L-1031",
      direction: "in",
      from: "Renée Okafor",
      to: "Priya Shankar",
      subject: "Looping in our CISO",
      body: "Priya — copying Daniel Ortiz, our CISO. He'll drive the security review. Recommend you send the SOC 2 packet to him directly.",
      at: daysAgo(2),
      unread: true,
    },
  ],
};

export const internalCommentsByLead: Record<string, InternalComment[]> = {
  "L-1042": [
    {
      id: "ic-1042-1",
      leadId: "L-1042",
      authorId: "mgr_jordan",
      body: "@morgan if MSA isn't unblocked by Friday, escalate and I'll get our legal team to call theirs directly. Don't let this slip the month.",
      at: daysAgo(1),
      mentions: ["rep_morgan"],
    },
    {
      id: "ic-1042-2",
      leadId: "L-1042",
      authorId: "rep_morgan",
      body: "Will do. Avery is solid; the bottleneck is on their side, not interest.",
      at: daysAgo(1),
    },
    {
      id: "ic-1042-3",
      leadId: "L-1042",
      authorId: "rep_morgan",
      body: "fyi @jordan — heard from a friend at helix that their CTO is leaving in 60d. could affect us, could not. flagging.",
      at: daysAgo(4),
      mentions: ["mgr_jordan"],
    },
  ],
  "L-1029": [
    {
      id: "ic-1029-1",
      leadId: "L-1029",
      authorId: "mgr_jordan",
      body: "@dante this is the largest deal in your top of funnel. Cooling 12 days is a problem. What's the play?",
      at: daysAgo(2),
      mentions: ["rep_dante"],
    },
    {
      id: "ic-1029-2",
      leadId: "L-1029",
      authorId: "rep_dante",
      body: "yeah i know. trying theo's EA tomorrow. if no response by EOW i'll escalate or shelve.",
      at: daysAgo(2),
    },
    {
      id: "ic-1029-3",
      leadId: "L-1029",
      authorId: "rep_dante",
      body: "update: tried sarah (EA) - she said theo is in budget meetings all week. asked her to flag for thursday.",
      at: daysAgo(1),
    },
  ],
  "L-1019": [
    {
      id: "ic-1019-1",
      leadId: "L-1019",
      authorId: "rep_kenji",
      body: "Possible duplicate of L-1009 (Mason & Hart) — similar size profile and they referenced an Owen on their team too. Worth checking.",
      at: daysAgo(4),
    },
    {
      id: "ic-1019-2",
      leadId: "L-1019",
      authorId: "mgr_jordan",
      body: "@kenji the routewise comparison is the wedge. lean on multi-site rollout speed not feature parity. your last competitive deal you led with features and it was a wash.",
      at: daysAgo(3),
      mentions: ["rep_kenji"],
    },
  ],
  "L-1024": [
    {
      id: "ic-1024-1",
      leadId: "L-1024",
      authorId: "rep_priya",
      body: "verbal yes from sasha — pilot terms TODAY. iris signed off. dont let this sit",
      at: hoursAgo(4),
    },
    {
      id: "ic-1024-2",
      leadId: "L-1024",
      authorId: "mgr_jordan",
      body: "👏 nice work @priya. ping me if you need anything signed off",
      at: hoursAgo(3),
      mentions: ["rep_priya"],
    },
  ],
  "L-1011": [
    {
      id: "ic-1011-1",
      leadId: "L-1011",
      authorId: "mgr_jordan",
      body: "reassigned this to morgan from kenji - morgans enterprise close rate is materially higher and this is too important to lose on inexperience. @kenji no slight, you'll get the next one.",
      at: daysAgo(12),
      mentions: ["rep_kenji"],
    },
    {
      id: "ic-1011-2",
      leadId: "L-1011",
      authorId: "rep_morgan",
      body: "got it. will scope what kenji built, then drive champion ID this week.",
      at: daysAgo(12),
    },
  ],
  "L-1004": [
    {
      id: "ic-1004-1",
      leadId: "L-1004",
      authorId: "mgr_jordan",
      body: "@kenji you have an unanswered reply going on day 4. do not let this die.",
      at: daysAgo(2),
      mentions: ["rep_kenji"],
    },
  ],
};

export const attachmentsByLead: Record<string, Attachment[]> = {
  "L-1042": [
    {
      id: "att-1042-1",
      leadId: "L-1042",
      name: "Northwind-Helix-MSA-v3.pdf",
      size: "412 KB",
      uploadedBy: "rep_morgan",
      at: daysAgo(9),
      kind: "msa",
    },
    {
      id: "att-1042-2",
      leadId: "L-1042",
      name: "Helix-Q1-Procurement-Brief.pdf",
      size: "188 KB",
      uploadedBy: "rep_morgan",
      at: daysAgo(20),
      kind: "doc",
    },
  ],
  "L-1038": [
    {
      id: "att-1038-1",
      leadId: "L-1038",
      name: "Northforge-Proposal-v2.pdf",
      size: "1.1 MB",
      uploadedBy: "rep_morgan",
      at: daysAgo(4),
      kind: "proposal",
    },
    {
      id: "att-1038-2",
      leadId: "L-1038",
      name: "ROI-Calculator-Northforge.xlsx",
      size: "84 KB",
      uploadedBy: "rep_morgan",
      at: daysAgo(8),
      kind: "spreadsheet",
    },
  ],
  "L-1024": [
    {
      id: "att-1024-1",
      leadId: "L-1024",
      name: "Lumen-Pilot-Terms-DRAFT.docx",
      size: "62 KB",
      uploadedBy: "rep_priya",
      at: daysAgo(2),
      kind: "doc",
    },
  ],
};
