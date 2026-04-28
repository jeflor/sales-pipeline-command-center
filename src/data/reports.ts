// Pre-computed reporting data for the Reports view.
// Values are realistic and internally consistent, anchored on the same fictional company.

export const monthlyRevenue = [
  { month: "Nov", booked: 312000, target: 360000 },
  { month: "Dec", booked: 408000, target: 360000 },
  { month: "Jan", booked: 286000, target: 380000 },
  { month: "Feb", booked: 354000, target: 380000 },
  { month: "Mar", booked: 421000, target: 400000 },
  { month: "Apr", booked: 296000, target: 400000 },
];

export const winRateByRep = [
  { rep: "Morgan A.", winRate: 31, deals: 22 },
  { rep: "Priya S.", winRate: 38, deals: 19 },
  { rep: "Dante R.", winRate: 24, deals: 17 },
  { rep: "Kenji T.", winRate: 28, deals: 15 },
  { rep: "Sloane W.", winRate: 26, deals: 13 },
];

export const pipelineBySource = [
  { source: "Inbound Form", value: 218000 },
  { source: "Outbound", value: 264000 },
  { source: "Referral", value: 132000 },
  { source: "Partner", value: 248000 },
  { source: "Event", value: 144000 },
  { source: "LinkedIn", value: 78000 },
  { source: "Cold Email", value: 67000 },
];

export const closeRateByStage = [
  { stage: "New Lead", rate: 18 },
  { stage: "Contacted", rate: 31 },
  { stage: "Qualified", rate: 49 },
  { stage: "Proposal Sent", rate: 62 },
  { stage: "Negotiation", rate: 78 },
];

export const lostByReason = [
  { reason: "Price", count: 9 },
  { reason: "Lost to Competitor", count: 7 },
  { reason: "Timing", count: 6 },
  { reason: "No Decision", count: 5 },
  { reason: "Wrong Fit", count: 4 },
  { reason: "No Budget", count: 3 },
];

export const repActivity = [
  { rep: "Morgan A.", calls: 38, emails: 124, meetings: 11 },
  { rep: "Priya S.", calls: 41, emails: 142, meetings: 14 },
  { rep: "Dante R.", calls: 22, emails: 98, meetings: 8 },
  { rep: "Kenji T.", calls: 27, emails: 110, meetings: 9 },
  { rep: "Sloane W.", calls: 29, emails: 88, meetings: 10 },
];

export const forecast = {
  commit: 312000,
  bestCase: 478000,
  pipeline: 1184000,
  target: 400000,
  coverage: 2.96,
  confidence: 71,
};
