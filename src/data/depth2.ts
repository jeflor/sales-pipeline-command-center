// Operational realism layer 2 — the messier, more lived-in data:
// open objections, decision scorecards, intent signals, manual overrides,
// stage history, AI insights, flags, sloppy notes.

import type { LeadDepth } from "./types";
import { daysAgo, hoursAgo } from "./time";

// Empty default for leads without depth data
const emptyDepth: LeadDepth = {
  objections: [],
  scorecard: [],
  stageHistory: [],
  intentSignals: [],
  manualOverrides: [],
  fieldNotes: [],
  aiInsights: [],
  flags: [],
};

const depthByLead: Record<string, Partial<LeadDepth>> = {
  // ----- L-1042 Helix Robotics — late-stage MSA-stuck deal -----
  "L-1042": {
    objections: [
      {
        id: "o-1042-1",
        leadId: "L-1042",
        topic: "MSA · indemnity cap",
        raisedBy: "Marcus Penn (General Counsel)",
        raisedAt: daysAgo(7),
        status: "waiting_on_them",
        detail:
          "Their counsel wants uncapped indemnity for IP infringement. We countered with 2× ACV.",
        ownerNote: "Standard pushback. Holding firm at 2×.",
      },
      {
        id: "o-1042-2",
        leadId: "L-1042",
        topic: "Pricing · Year 2 ramp clause",
        raisedBy: "Renata Soto (Finance)",
        raisedAt: daysAgo(13),
        status: "answered",
        detail: "Capped Y2 increase at CPI + 3%.",
      },
      {
        id: "o-1042-3",
        leadId: "L-1042",
        topic: "Data residency",
        raisedBy: "Avery Bloomfield",
        raisedAt: daysAgo(20),
        status: "deferred",
        detail:
          "Originally wanted EU-only residency. Confirmed US-only is fine for MVP scope.",
      },
    ],
    scorecard: [
      { slot: "Metrics", value: "Lift ops conversion ≥ 12% in 6mo", confidence: "high" },
      { slot: "Economic Buyer", value: "Renata Soto (Finance Director)", confidence: "high" },
      { slot: "Decision Criteria", value: "Compliance + multi-site readiness + integration cost", confidence: "medium" },
      { slot: "Decision Process", value: "Legal redlines → procurement → Avery sign", confidence: "medium" },
      { slot: "Identified Pain", value: "Manual reconciliation across 3 plants taking 200hr/mo", confidence: "high" },
      { slot: "Champion", value: "Avery Bloomfield (VP RevOps)", confidence: "high" },
      { slot: "Competition", value: null, confidence: null },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(41), by: "rep_morgan" },
      { stage: "contacted", enteredAt: daysAgo(38), by: "rep_morgan" },
      { stage: "qualified", enteredAt: daysAgo(33), by: "rep_morgan" },
      { stage: "proposal_sent", enteredAt: daysAgo(22), by: "rep_morgan" },
      { stage: "negotiation", enteredAt: daysAgo(14), by: "rep_morgan" },
    ],
    intentSignals: [
      {
        id: "is-1042-1",
        leadId: "L-1042",
        at: hoursAgo(6),
        kind: "doc_open",
        detail: "Avery opened MSA-v3 · 11 min · scrolled to section 7",
        weight: 8,
      },
      {
        id: "is-1042-2",
        leadId: "L-1042",
        at: daysAgo(2),
        kind: "page_visit",
        detail: "Renata visited /security-and-trust",
        weight: 6,
      },
      {
        id: "is-1042-3",
        leadId: "L-1042",
        at: daysAgo(8),
        kind: "doc_open",
        detail: "MSA-v3 opened by 3 people on helixrobotics.com",
        weight: 9,
      },
    ],
    manualOverrides: [
      {
        id: "mo-1042-1",
        field: "confidence",
        oldValue: "58%",
        newValue: "72%",
        by: "mgr_jordan",
        at: daysAgo(3),
        note: "Avery confirmed budget verbally. Bumping confidence.",
      },
      {
        id: "mo-1042-2",
        field: "close_date",
        oldValue: "2026-04-30",
        newValue: "2026-05-07",
        by: "rep_morgan",
        at: daysAgo(5),
        note: "Pushed back 1 wk for legal review.",
      },
    ],
    fieldNotes: [
      {
        id: "fn-1042-1",
        body: "avery's call cell vs office — she answers cell after 2pm PT, dont email between 11-2 lunch break",
        by: "rep_morgan",
        at: daysAgo(28),
        pinned: true,
      },
      {
        id: "fn-1042-2",
        body: "their procurement team is RUTHLESS on payment terms - they wanted net 90 originally, talked them to net 45. Don't let this slide.",
        by: "rep_morgan",
        at: daysAgo(11),
      },
      {
        id: "fn-1042-3",
        body: "renata mentioned offhand they evaluated RouteWise 6mo ago and passed. didn't pursue, but worth knowing.",
        by: "rep_morgan",
        at: daysAgo(19),
      },
    ],
    aiInsights: [
      {
        id: "ai-1042-1",
        body: "Champion engagement cooling — replied within 4h three weeks ago, now ~36h average",
        weight: "high",
        topic: "champion",
      },
      {
        id: "ai-1042-2",
        body: "Likely contract objection on next call — legal redlines untouched 7 days",
        weight: "high",
        topic: "objection",
      },
      {
        id: "ai-1042-3",
        body: "Best call window: 2:00–4:00pm PT (Avery responds 3.4× faster)",
        weight: "medium",
        topic: "timing",
      },
    ],
    flags: ["pricing_objection_unresolved", "contract_blocked"],
    recentTouchPattern: [0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    championEngagement: [9, 9, 8, 8, 6, 5],
    bestCallWindow: "2:00–4:00pm PT",
    linkedDeals: [{ id: "L-0998", relationship: "Same referral source as Riverstone Realty" }],
    legacyId: "HUB-2024-08-241",
  },

  // ----- L-1038 Northforge — proposal under exec review -----
  "L-1038": {
    objections: [
      {
        id: "o-1038-1",
        leadId: "L-1038",
        topic: "Payback period evidence",
        raisedBy: "Hannah Yu (CFO)",
        raisedAt: daysAgo(2),
        status: "open",
        detail:
          "Hannah wants hard ROI evidence from comparable customers — 2 case studies minimum.",
        ownerNote: "Pulling Cypress Foods + Verity Mortgage refs together.",
      },
      {
        id: "o-1038-2",
        leadId: "L-1038",
        topic: "Implementation timeline",
        raisedBy: "Marcus Devlin",
        raisedAt: daysAgo(11),
        status: "answered",
        detail: "Confirmed 5-week onboarding with shared kickoff doc.",
      },
    ],
    scorecard: [
      { slot: "Metrics", value: "Payback within 9mo", confidence: "high" },
      { slot: "Economic Buyer", value: "Hannah Yu (CFO)", confidence: "medium" },
      { slot: "Decision Criteria", value: "ROI evidence + integration risk", confidence: "high" },
      { slot: "Decision Process", value: null, confidence: null },
      { slot: "Identified Pain", value: "GTM data fragmented across 4 tools", confidence: "high" },
      { slot: "Champion", value: "Marcus Devlin (Head of GTM)", confidence: "high" },
      { slot: "Competition", value: "Looker (incumbent BI)", confidence: "low" },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(28), by: "rep_morgan" },
      { stage: "contacted", enteredAt: daysAgo(24), by: "rep_morgan" },
      { stage: "qualified", enteredAt: daysAgo(17), by: "rep_morgan" },
      { stage: "proposal_sent", enteredAt: daysAgo(6), by: "rep_morgan" },
    ],
    intentSignals: [
      {
        id: "is-1038-1",
        leadId: "L-1038",
        at: hoursAgo(11),
        kind: "doc_open",
        detail: "Proposal opened 9× across 3 sessions · CFO joined yesterday",
        weight: 9,
      },
      {
        id: "is-1038-2",
        leadId: "L-1038",
        at: daysAgo(1),
        kind: "pricing_view",
        detail: "Pricing page · 4 visits in 24h",
        weight: 7,
      },
      {
        id: "is-1038-3",
        leadId: "L-1038",
        at: daysAgo(3),
        kind: "comparison_search",
        detail: "Searched 'us vs Looker' on docs.northwind.io",
        weight: 6,
      },
    ],
    fieldNotes: [
      {
        id: "fn-1038-1",
        body: "marcus said in passing 'if hannah signs off this week we can have it in by month end' — she opens proposal again push hard",
        by: "rep_morgan",
        at: daysAgo(2),
        pinned: true,
      },
      {
        id: "fn-1038-2",
        body: "DON'T mention the looker eval directly unless they bring it up. internal politics.",
        by: "rep_morgan",
        at: daysAgo(8),
      },
    ],
    aiInsights: [
      {
        id: "ai-1038-1",
        body: "High intent — proposal opened 9× including CFO in last 24h. Strike now.",
        weight: "high",
        topic: "intent",
      },
      {
        id: "ai-1038-2",
        body: "Likely competitive concern (Looker) — comparison search detected",
        weight: "medium",
        topic: "competitor",
      },
    ],
    flags: ["competitor_mentioned"],
    recentTouchPattern: [0, 0, 0, 1, 0, 0, 0, 0, 1, 2, 0, 1, 0, 0],
    championEngagement: [7, 7, 8, 8, 9, 9],
    bestCallWindow: "10:00am–12:00pm ET",
  },

  // ----- L-1029 Aldridge — high-value gone cold -----
  "L-1029": {
    objections: [
      {
        id: "o-1029-1",
        leadId: "L-1029",
        topic: "ROI proof for $128k spend",
        raisedBy: "Theo Hartmann",
        raisedAt: daysAgo(14),
        status: "waiting_on_them",
        detail:
          "ROI model sent 12d ago. No reply. Theo previously asked for hard payback evidence.",
      },
    ],
    scorecard: [
      { slot: "Metrics", value: "Reduce ops headcount overtime by 15%", confidence: "medium" },
      { slot: "Economic Buyer", value: "Theo Hartmann (COO)", confidence: "high" },
      { slot: "Decision Criteria", value: null, confidence: null },
      { slot: "Decision Process", value: null, confidence: null },
      { slot: "Identified Pain", value: "Plant downtime tracking is manual", confidence: "medium" },
      { slot: "Champion", value: null, confidence: null },
      { slot: "Competition", value: null, confidence: null },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(18), by: "rep_dante" },
      { stage: "contacted", enteredAt: daysAgo(15), by: "rep_dante" },
    ],
    intentSignals: [
      {
        id: "is-1029-1",
        leadId: "L-1029",
        at: daysAgo(11),
        kind: "doc_open",
        detail: "ROI doc opened once · 38 sec · no scroll",
        weight: 2,
      },
    ],
    fieldNotes: [
      {
        id: "fn-1029-1",
        body: "TODO: theo's EA is sarah - try going through her",
        by: "rep_dante",
        at: daysAgo(5),
      },
      {
        id: "fn-1029-2",
        body: "summit conversation was strong. didnt expect this to go cold. weird.",
        by: "rep_dante",
        at: daysAgo(8),
      },
    ],
    aiInsights: [
      {
        id: "ai-1029-1",
        body: "Champion ghosted — 12 days no reply, ROI doc opened only briefly. Re-engage now or escalate.",
        weight: "high",
        topic: "champion",
      },
      {
        id: "ai-1029-2",
        body: "Predicted close-date slip: 18d → 30d+ (low confidence)",
        weight: "medium",
        topic: "risk",
      },
    ],
    flags: ["champion_ghosted", "decision_maker_changed"],
    manualOverrides: [
      {
        id: "mo-1029-1",
        field: "confidence",
        oldValue: "60%",
        newValue: "41%",
        by: "rep_dante",
        at: daysAgo(8),
        note: "Going cold. Adjusting honestly.",
      },
    ],
    recentTouchPattern: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    championEngagement: [6, 5, 4, 3, 2, 1],
    conflictingSource: "Event (also tracked: LinkedIn outbound campaign Q1)",
  },

  // ----- L-1019 Pacific Ridge — competitive eval -----
  "L-1019": {
    objections: [
      {
        id: "o-1019-1",
        leadId: "L-1019",
        topic: "Pricing — RouteWise is 22% cheaper",
        raisedBy: "Owen Caldwell",
        raisedAt: daysAgo(9),
        status: "open",
        detail: "Owen mentioned RouteWise's quote was meaningfully lower.",
      },
      {
        id: "o-1019-2",
        leadId: "L-1019",
        topic: "Multi-site rollout speed",
        raisedBy: "Owen Caldwell",
        raisedAt: daysAgo(11),
        status: "answered",
        detail: "Confirmed 6-wk rollout per site, parallelizable.",
      },
    ],
    scorecard: [
      { slot: "Metrics", value: "Reduce route variance 18% across 3 sites", confidence: "medium" },
      { slot: "Economic Buyer", value: null, confidence: null },
      { slot: "Decision Criteria", value: "Price + rollout speed", confidence: "high" },
      { slot: "Decision Process", value: "Owen + 2 ops directors", confidence: "medium" },
      { slot: "Identified Pain", value: "Route inconsistency causing SLA misses", confidence: "high" },
      { slot: "Champion", value: "Owen Caldwell", confidence: "medium" },
      { slot: "Competition", value: "RouteWise · active eval", confidence: "high" },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(31), by: "rep_kenji" },
      { stage: "contacted", enteredAt: daysAgo(27), by: "rep_kenji" },
      { stage: "qualified", enteredAt: daysAgo(20), by: "rep_kenji" },
      { stage: "proposal_sent", enteredAt: daysAgo(12), by: "rep_kenji" },
    ],
    fieldNotes: [
      {
        id: "fn-1019-1",
        body: "owen mentioned routewise had cheaper $$ but 'their rollout was 4 months' - lean into our 6wk per site!! THIS IS THE WEDGE",
        by: "rep_kenji",
        at: daysAgo(9),
        pinned: true,
      },
      {
        id: "fn-1019-2",
        body: "owen's boss (Carla) holds final budget. haven't met her yet. risk.",
        by: "rep_kenji",
        at: daysAgo(7),
      },
    ],
    aiInsights: [
      {
        id: "ai-1019-1",
        body: "Competitive deal — RouteWise wins on price 64% but loses on multi-site rollout speed",
        weight: "high",
        topic: "competitor",
      },
      {
        id: "ai-1019-2",
        body: "Decision-maker not yet met (Carla, Owen's boss) — risk to close date",
        weight: "high",
        topic: "risk",
      },
    ],
    flags: ["competitor_mentioned", "pricing_objection_unresolved"],
    recentTouchPattern: [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    championEngagement: [6, 6, 7, 7, 6, 5],
  },

  // ----- L-1024 Lumen & Co — verbal yes, awaiting sign -----
  "L-1024": {
    objections: [
      {
        id: "o-1024-1",
        leadId: "L-1024",
        topic: "Pilot extension to 90 days",
        raisedBy: "Sasha Berger",
        raisedAt: daysAgo(2),
        status: "waiting_on_us",
        detail: "Sasha asked for 90 instead of 60. Approved internally; need to send paperwork.",
      },
    ],
    scorecard: [
      { slot: "Metrics", value: "Email open rate +20%, attribute back to revenue", confidence: "high" },
      { slot: "Economic Buyer", value: "Iris Mendez (CMO)", confidence: "high" },
      { slot: "Decision Criteria", value: "Pilot success metrics", confidence: "high" },
      { slot: "Decision Process", value: "Sasha → Iris sign-off", confidence: "high" },
      { slot: "Identified Pain", value: "Marketing attribution opaque", confidence: "high" },
      { slot: "Champion", value: "Sasha Berger", confidence: "high" },
      { slot: "Competition", value: "None active", confidence: "high" },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(35), by: "rep_priya" },
      { stage: "contacted", enteredAt: daysAgo(31), by: "rep_priya" },
      { stage: "qualified", enteredAt: daysAgo(22), by: "rep_priya" },
      { stage: "proposal_sent", enteredAt: daysAgo(11), by: "rep_priya" },
      { stage: "negotiation", enteredAt: hoursAgo(5), by: "rep_priya" },
    ],
    intentSignals: [
      {
        id: "is-1024-1",
        leadId: "L-1024",
        at: hoursAgo(5),
        kind: "return_visit",
        detail: "Sasha + Iris both visited /pricing in last 6h",
        weight: 10,
      },
    ],
    fieldNotes: [
      {
        id: "fn-1024-1",
        body: "lock pilot terms TODAY. lost a similar deal last quarter when we let it sit over a weekend.",
        by: "rep_priya",
        at: hoursAgo(8),
        pinned: true,
      },
    ],
    aiInsights: [
      {
        id: "ai-1024-1",
        body: "Highest-intent deal in your pipeline this week — both decision-maker and champion active in last 6h",
        weight: "high",
        topic: "intent",
      },
    ],
    flags: ["manually_advanced"],
    manualOverrides: [
      {
        id: "mo-1024-1",
        field: "stage",
        oldValue: "Proposal Sent",
        newValue: "Negotiation",
        by: "rep_priya",
        at: hoursAgo(5),
        note: "Verbal yes received. Advancing.",
      },
    ],
    recentTouchPattern: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1],
    championEngagement: [7, 8, 8, 8, 9, 10],
  },

  // ----- L-1031 Brightlane Health -----
  "L-1031": {
    objections: [
      {
        id: "o-1031-1",
        leadId: "L-1031",
        topic: "SOC 2 + HIPAA documentation",
        raisedBy: "Daniel Ortiz (CISO)",
        raisedAt: daysAgo(2),
        status: "waiting_on_us",
        detail: "Need security packet sent to CISO directly.",
      },
    ],
    scorecard: [
      { slot: "Metrics", value: "Reduce CX response time by 30%", confidence: "high" },
      { slot: "Economic Buyer", value: null, confidence: null },
      { slot: "Decision Criteria", value: "Security review + integration", confidence: "high" },
      { slot: "Decision Process", value: "CISO clearance → procurement", confidence: "medium" },
      { slot: "Identified Pain", value: "CX ticket backlog growing 12%/mo", confidence: "high" },
      { slot: "Champion", value: "Renée Okafor", confidence: "high" },
      { slot: "Competition", value: null, confidence: null },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(22), by: "rep_priya" },
      { stage: "contacted", enteredAt: daysAgo(18), by: "rep_priya" },
      { stage: "qualified", enteredAt: daysAgo(11), by: "rep_priya" },
    ],
    fieldNotes: [
      {
        id: "fn-1031-1",
        body: "renee referred us from helix - she knows avery. send the helix logo + outcome to her early.",
        by: "rep_priya",
        at: daysAgo(20),
      },
    ],
    aiInsights: [
      {
        id: "ai-1031-1",
        body: "Security packet pending 2d — typical Brightlane response time is 24h on this kind of doc",
        weight: "medium",
        topic: "timing",
      },
    ],
    flags: [],
    recentTouchPattern: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    championEngagement: [6, 7, 8, 8, 8, 9],
    linkedDeals: [{ id: "L-1042", relationship: "Same referral source (Avery / Helix)" }],
  },

  // ----- L-1011 Vega Insurance -----
  "L-1011": {
    objections: [
      {
        id: "o-1011-1",
        leadId: "L-1011",
        topic: "No day-to-day champion identified",
        raisedBy: "(internal)",
        raisedAt: daysAgo(5),
        status: "open",
        detail: "Cameron is exec sponsor; can't move without operational champion.",
      },
    ],
    scorecard: [
      { slot: "Metrics", value: "Q3 enterprise rollout target", confidence: "low" },
      { slot: "Economic Buyer", value: "Cameron Liu (Chief of Staff)", confidence: "high" },
      { slot: "Decision Criteria", value: null, confidence: null },
      { slot: "Decision Process", value: null, confidence: null },
      { slot: "Identified Pain", value: null, confidence: null },
      { slot: "Champion", value: "MISSING — top priority", confidence: "low" },
      { slot: "Competition", value: null, confidence: null },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(19), by: "rep_morgan" },
      { stage: "contacted", enteredAt: daysAgo(16), by: "rep_morgan" },
      { stage: "qualified", enteredAt: daysAgo(9), by: "rep_morgan" },
    ],
    fieldNotes: [
      {
        id: "fn-1011-1",
        body: "partner-sourced via convex consulting — chase via convex if cameron stalls",
        by: "rep_morgan",
        at: daysAgo(15),
      },
    ],
    aiInsights: [
      {
        id: "ai-1011-1",
        body: "Without a day-to-day champion, deals like this slip 30+ days on average. Champion ID is the single highest-leverage move.",
        weight: "high",
        topic: "champion",
      },
    ],
    flags: ["decision_maker_changed"],
    manualOverrides: [
      {
        id: "mo-1011-1",
        field: "owner",
        oldValue: "rep_kenji",
        newValue: "rep_morgan",
        by: "mgr_jordan",
        at: daysAgo(12),
        note: "Reassigned — Morgan has stronger enterprise track record.",
      },
    ],
    recentTouchPattern: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    championEngagement: [4, 4, 5, 5, 6, 6],
  },

  // ----- L-1019 (already populated above) — wait, no — different lead. -----

  // ----- L-1015 Solene Beauty -----
  "L-1015": {
    objections: [],
    scorecard: [
      { slot: "Metrics", value: "Reduce CX rep load by 25%", confidence: "medium" },
      { slot: "Economic Buyer", value: "Yuki Tanaka", confidence: "high" },
      { slot: "Decision Criteria", value: "References + CPG fit", confidence: "high" },
      { slot: "Decision Process", value: "Yuki direct decision", confidence: "high" },
      { slot: "Identified Pain", value: "Holiday CX spikes overwhelm team", confidence: "medium" },
      { slot: "Champion", value: "Yuki Tanaka", confidence: "high" },
      { slot: "Competition", value: null, confidence: null },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(14), by: "rep_sloane" },
      { stage: "contacted", enteredAt: daysAgo(10), by: "rep_sloane" },
      { stage: "qualified", enteredAt: daysAgo(5), by: "rep_sloane" },
    ],
    fieldNotes: [
      {
        id: "fn-1015-1",
        body: "small SMB but fast cycle. send refs by EOD, propose working session for next wk.",
        by: "rep_sloane",
        at: daysAgo(3),
      },
    ],
    aiInsights: [
      {
        id: "ai-1015-1",
        body: "Clean SMB motion — references typically advance to proposal within 5 days for this profile",
        weight: "low",
        topic: "timing",
      },
    ],
    flags: [],
    recentTouchPattern: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    championEngagement: [7, 7, 8, 8, 8, 8],
  },

  // ----- L-1004 Cobalt Cloud — replied-and-stalled -----
  "L-1004": {
    objections: [],
    scorecard: [
      { slot: "Metrics", value: null, confidence: null },
      { slot: "Economic Buyer", value: null, confidence: null },
      { slot: "Decision Criteria", value: null, confidence: null },
      { slot: "Decision Process", value: null, confidence: null },
      { slot: "Identified Pain", value: "(unknown — stalled before discovery)", confidence: null },
      { slot: "Champion", value: null, confidence: null },
      { slot: "Competition", value: null, confidence: null },
    ],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(4), by: "rep_kenji" },
    ],
    fieldNotes: [
      {
        id: "fn-1004-1",
        body: "REPLY OWED. she asked a question. its been days. fix this.",
        by: "rep_kenji",
        at: daysAgo(3),
        pinned: true,
      },
    ],
    aiInsights: [
      {
        id: "ai-1004-1",
        body: "Reply-and-stall pattern — prospect replied 4d ago, no follow-up. 73% chance this dies if not answered today.",
        weight: "high",
        topic: "risk",
      },
    ],
    flags: [],
    recentTouchPattern: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    championEngagement: [3, 3, 3, 3, 3, 3],
  },

  // ----- L-0985 Halberd (closed lost) -----
  "L-0985": {
    objections: [
      {
        id: "o-0985-1",
        leadId: "L-0985",
        topic: "Lost to incumbent (RouteWise) on price + existing MSA",
        raisedBy: "Beatrice Linville",
        raisedAt: daysAgo(25),
        status: "deferred",
      },
    ],
    scorecard: [],
    stageHistory: [
      { stage: "new_lead", enteredAt: daysAgo(73), by: "rep_kenji" },
      { stage: "contacted", enteredAt: daysAgo(69), by: "rep_kenji" },
      { stage: "qualified", enteredAt: daysAgo(60), by: "rep_kenji" },
      { stage: "proposal_sent", enteredAt: daysAgo(45), by: "rep_kenji" },
      { stage: "negotiation", enteredAt: daysAgo(35), by: "rep_kenji" },
      { stage: "closed_lost", enteredAt: daysAgo(21), by: "rep_kenji", note: "Lost to RouteWise" },
    ],
    fieldNotes: [
      {
        id: "fn-0985-1",
        body: "user community at halberd liked us better. revisit Q1 next year when MSA is up.",
        by: "rep_kenji",
        at: daysAgo(20),
      },
    ],
    aiInsights: [],
    flags: [],
    legacyId: "HUB-2024-03-118",
  },
};

export function depthFor(leadId: string): LeadDepth {
  const partial = depthByLead[leadId];
  if (!partial) return emptyDepth;
  return {
    ...emptyDepth,
    ...partial,
  };
}

export type { LeadDepth };
export { depthByLead };
