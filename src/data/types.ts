export type Stage =
  | "new_lead"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export const STAGES: { id: Stage; label: string; closed?: "won" | "lost" }[] = [
  { id: "new_lead", label: "New Lead" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal_sent", label: "Proposal Sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "closed_won", label: "Closed Won", closed: "won" },
  { id: "closed_lost", label: "Closed Lost", closed: "lost" },
];

export const ACTIVE_STAGES: Stage[] = [
  "new_lead",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
];

export const KANBAN_STAGES: Stage[] = [...ACTIVE_STAGES, "closed_won"];

export type Rep = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: "rep" | "manager";
  avatarColor: string;
  quota: number;
};

export type LeadSource =
  | "Inbound Form"
  | "Outbound"
  | "Referral"
  | "Partner"
  | "Event"
  | "LinkedIn"
  | "Cold Email";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type ActivityType =
  | "call"
  | "email_sent"
  | "email_received"
  | "meeting"
  | "note"
  | "stage_change"
  | "task_completed"
  | "proposal_sent"
  | "blocker_set"
  | "escalation";

export type Activity = {
  id: string;
  leadId: string;
  type: ActivityType;
  ownerId: string;
  at: string;
  summary: string;
  detail?: string;
};

export type Task = {
  id: string;
  leadId: string;
  ownerId: string;
  title: string;
  due: string;
  done: boolean;
  priority: "low" | "normal" | "high";
  kind: "call" | "email" | "meeting" | "follow_up" | "review";
  draftReady?: boolean; // AI-drafted reply waiting to send
};

export type StakeholderRole =
  | "Champion"
  | "Economic Buyer"
  | "Technical Buyer"
  | "End User"
  | "Procurement"
  | "Legal"
  | "Skeptic";

export type StakeholderStatus = "engaged" | "warm" | "cold" | "blocking" | "unknown";

export type Stakeholder = {
  id: string;
  name: string;
  title: string;
  role: StakeholderRole;
  status: StakeholderStatus;
  lastContactAt?: string;
};

export type BlockerKind =
  | "legal_review"
  | "champion_dark"
  | "procurement_freeze"
  | "missing_decision_maker"
  | "security_review"
  | "budget_freeze"
  | "competitive"
  | "no_response";

export type Blocker = {
  id: string;
  kind: BlockerKind;
  label: string;
  since: string;
  setBy: string;
  detail?: string;
};

export type DataIssue =
  | "no_decision_maker"
  | "no_champion"
  | "missing_close_date"
  | "stale_contact"
  | "duplicate_suspected"
  | "missing_industry"
  | "no_next_touch";

export type EmailMessage = {
  id: string;
  leadId: string;
  direction: "in" | "out";
  from: string;
  to: string;
  subject: string;
  body: string;
  at: string;
  unread?: boolean;
  attachments?: { name: string; size: string }[];
};

export type InternalComment = {
  id: string;
  leadId: string;
  authorId: string;
  body: string;
  at: string;
  mentions?: string[];
};

export type Attachment = {
  id: string;
  leadId: string;
  name: string;
  size: string;
  uploadedBy: string;
  at: string;
  kind: "proposal" | "deck" | "msa" | "doc" | "spreadsheet";
};

// Operational depth — the kinds of things real reps actually track

export type ObjectionStatus =
  | "open"
  | "answered"
  | "waiting_on_us"
  | "waiting_on_them"
  | "deferred";

export type Objection = {
  id: string;
  leadId: string;
  topic: string; // "Pricing — second-year ramp", "Security review", etc.
  raisedBy: string; // stakeholder name
  raisedAt: string;
  status: ObjectionStatus;
  detail?: string;
  ownerNote?: string;
};

export type ScorecardSlot =
  | "Metrics"
  | "Economic Buyer"
  | "Decision Criteria"
  | "Decision Process"
  | "Identified Pain"
  | "Champion"
  | "Competition";

export type ScorecardEntry = {
  slot: ScorecardSlot;
  value: string | null; // null = unknown
  confidence: "high" | "medium" | "low" | null;
};

export type StageHistoryEntry = {
  stage: Stage;
  enteredAt: string;
  by: string;
  manualOverride?: boolean;
  note?: string;
};

export type IntentSignal = {
  id: string;
  leadId: string;
  at: string;
  kind:
    | "doc_open"
    | "page_visit"
    | "demo_view"
    | "pricing_view"
    | "comparison_search"
    | "return_visit";
  detail: string; // e.g. "CFO opened proposal · 4 sessions"
  weight: number; // 1-10
};

export type ManualOverride = {
  id: string;
  field:
    | "confidence"
    | "close_date"
    | "value"
    | "stage"
    | "owner"
    | "next_touch";
  oldValue: string;
  newValue: string;
  by: string;
  at: string;
  note?: string;
};

export type FieldNote = {
  // Free-form messy notes — the kind reps actually leave
  id: string;
  body: string;
  by: string;
  at: string;
  pinned?: boolean;
};

export type AIInsight = {
  id: string;
  body: string; // "Champion engagement cooling 3 weeks running"
  weight: "low" | "medium" | "high";
  topic: "objection" | "champion" | "timing" | "competitor" | "intent" | "risk";
  detail?: string;
};

export type DealHealthFlag =
  | "decision_maker_changed"
  | "champion_ghosted"
  | "competitor_mentioned"
  | "pricing_objection_unresolved"
  | "contract_blocked"
  | "manually_advanced"
  | "manually_reverted"
  | "rep_handoff"
  | "exception_terms"
  | "legacy_migrated";

// Extension to Lead — kept additive on the existing Lead type via depth.ts
export type LeadDepth = {
  objections: Objection[];
  scorecard: ScorecardEntry[];
  stageHistory: StageHistoryEntry[];
  intentSignals: IntentSignal[];
  manualOverrides: ManualOverride[];
  fieldNotes: FieldNote[];
  aiInsights: AIInsight[];
  flags: DealHealthFlag[];
  legacyId?: string;
  conflictingSource?: string; // "Inbound Form (also tracked as: LinkedIn ad campaign)"
  recentTouchPattern?: number[]; // 14 numbers, touches per day for last 14 days
  championEngagement?: number[]; // 6 weeks of 0-10 engagement scores
  linkedDeals?: { id: string; relationship: string }[];
  bestCallWindow?: string; // "2:00–4:00pm PT"
};

export type Lead = {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  employees: string;
  email: string;
  phone: string;
  source: LeadSource;
  ownerId: string;
  stage: Stage;
  value: number;
  createdAt: string;
  lastTouchAt: string;
  nextTouchAt?: string;
  closeDate: string;
  closedAt?: string;
  lostReason?: string;
  notes: string;
  tags: string[];
  confidence: number;
  daysInactive: number;
  riskLevel: RiskLevel;
  urgencyScore: number;
  recommendedAction: string;
  reasonSurfaced: string;
  aiSummary: string;
  // Operational depth
  stakeholders: Stakeholder[];
  blockers: Blocker[];
  dataIssues: DataIssue[];
  unreadEmails: number;
  duplicateOf?: string; // ID of suspected duplicate lead
  starred?: boolean;
};

export type LostReason =
  | "Price"
  | "Timing"
  | "Lost to Competitor"
  | "No Decision"
  | "Wrong Fit"
  | "No Budget"
  | "Unresponsive";

// Action audit for the audit-trail UI
export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  leadId?: string;
  detail?: string;
};
