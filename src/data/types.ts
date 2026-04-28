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
  | "proposal_sent";

export type Activity = {
  id: string;
  leadId: string;
  type: ActivityType;
  ownerId: string;
  at: string; // ISO timestamp
  summary: string;
  detail?: string;
};

export type Task = {
  id: string;
  leadId: string;
  ownerId: string;
  title: string;
  due: string; // ISO date
  done: boolean;
  priority: "low" | "normal" | "high";
  kind: "call" | "email" | "meeting" | "follow_up" | "review";
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
  closeDate: string; // expected close
  closedAt?: string; // when actually closed
  lostReason?: string;
  notes: string;
  tags: string[];
  confidence: number; // 0-100
  // derived/cached fields used in UI
  daysInactive: number;
  riskLevel: RiskLevel;
  urgencyScore: number; // 0-100
  recommendedAction: string;
  reasonSurfaced: string;
  aiSummary: string;
};

export type LostReason =
  | "Price"
  | "Timing"
  | "Lost to Competitor"
  | "No Decision"
  | "Wrong Fit"
  | "No Budget"
  | "Unresponsive";
