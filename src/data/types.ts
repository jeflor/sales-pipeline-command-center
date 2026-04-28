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
