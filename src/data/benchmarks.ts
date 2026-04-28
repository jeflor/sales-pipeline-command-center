import type { Stage } from "./types";

// Average days a deal spends in each stage (used for "X days in stage · avg Y" UI)
export const avgDaysInStage: Record<Stage, number> = {
  new_lead: 4,
  contacted: 6,
  qualified: 9,
  proposal_sent: 11,
  negotiation: 9,
  closed_won: 0,
  closed_lost: 0,
};
