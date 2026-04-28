import type { Lead, Stage, LeadSource } from "./types";
import { NOW, daysAgo, daysFromNow, hoursAgo } from "./time";

export { NOW, daysAgo, daysFromNow, hoursAgo };

type Seed = {
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
  createdDaysAgo: number;
  lastTouchDaysAgo: number;
  nextTouchDays?: number; // negative = overdue
  closeInDays: number;
  closedDaysAgo?: number;
  lostReason?: string;
  notes: string;
  tags: string[];
  confidence: number;
  reasonSurfaced?: string;
  recommendedAction?: string;
  aiSummary?: string;
};

const seeds: Seed[] = [
  // ----- HOT / overdue / high-priority -----
  {
    id: "L-1042",
    name: "Avery Bloomfield",
    title: "VP, Revenue Operations",
    company: "Helix Robotics",
    industry: "Industrial Automation",
    employees: "510",
    email: "abloomfield@helixrobotics.com",
    phone: "+1 (415) 555-0142",
    source: "Inbound Form",
    ownerId: "rep_morgan",
    stage: "negotiation",
    value: 84000,
    createdDaysAgo: 41,
    lastTouchDaysAgo: 6,
    nextTouchDays: -2,
    closeInDays: 9,
    notes:
      "Procurement loop is open. Avery confirmed budget on 4/15 call but legal is still reviewing the MSA redlines we sent 4/19.",
    tags: ["enterprise", "expansion-fit", "MSA-in-review"],
    confidence: 72,
    reasonSurfaced: "No reply in 6 days · close date in 9",
    recommendedAction: "Call Avery within 2 hours · escalate MSA to legal",
    aiSummary:
      "Strong fit, late-stage deal stalling on legal review. Avery has previously responded within 24h. The 6-day gap is unusual and correlates with our redlines being sent. Recommend a direct call to surface blockers, then loop in your legal contact to unblock the MSA.",
  },
  {
    id: "L-1038",
    name: "Marcus Devlin",
    title: "Head of GTM",
    company: "Northforge Analytics",
    industry: "Data & Analytics",
    employees: "180",
    email: "marcus@northforge.io",
    phone: "+1 (646) 555-0188",
    source: "Outbound",
    ownerId: "rep_morgan",
    stage: "proposal_sent",
    value: 56000,
    createdDaysAgo: 28,
    lastTouchDaysAgo: 4,
    nextTouchDays: 0,
    closeInDays: 14,
    notes:
      "Proposal sent 4/24. Marcus opened the doc 9 times across 3 sessions. Forwarded to CFO Tuesday.",
    tags: ["proposal-opened", "champion-engaged"],
    confidence: 68,
    reasonSurfaced: "Proposal opened 9× · CFO now in thread",
    recommendedAction: "Send pricing follow-up addressing CFO ROI questions",
    aiSummary:
      "Buying signals are strong: repeat opens of the proposal, internal forwarding to CFO, and Marcus's last email asked about ROI evidence. The right next move is a tailored follow-up that pre-empts the CFO's questions on payback period.",
  },
  {
    id: "L-1031",
    name: "Renée Okafor",
    title: "Director of Sales Enablement",
    company: "Brightlane Health",
    industry: "Healthcare SaaS",
    employees: "320",
    email: "renee.okafor@brightlanehealth.com",
    phone: "+1 (312) 555-0117",
    source: "Referral",
    ownerId: "rep_priya",
    stage: "qualified",
    value: 42000,
    createdDaysAgo: 22,
    lastTouchDaysAgo: 2,
    nextTouchDays: 1,
    closeInDays: 28,
    notes:
      "Discovery call went well. Renée flagged a security review will be needed before procurement. Looped in their CISO on the next email.",
    tags: ["security-review", "referral-from-Helix"],
    confidence: 58,
    reasonSurfaced: "Referral from won deal · CISO engaged",
    recommendedAction: "Send security one-pager · book technical scoping call",
    aiSummary:
      "Healthy mid-funnel deal with a clear path. Security review will be the gating item — getting ahead of it with the CISO documentation packet shortens the cycle by an average of 11 days based on similar deals.",
  },
  {
    id: "L-1029",
    name: "Theo Hartmann",
    title: "COO",
    company: "Aldridge Manufacturing",
    industry: "Manufacturing",
    employees: "1,100",
    email: "thartmann@aldridge.co",
    phone: "+1 (216) 555-0144",
    source: "Event",
    ownerId: "rep_dante",
    stage: "contacted",
    value: 128000,
    createdDaysAgo: 18,
    lastTouchDaysAgo: 12,
    nextTouchDays: -5,
    closeInDays: 45,
    notes:
      "Met at the Operations Summit in March. Asked for a tailored ROI model. Sent on 4/16, no reply since.",
    tags: ["event-lead", "high-value", "ROI-sent"],
    confidence: 41,
    reasonSurfaced: "12 days inactive · high-value enterprise deal",
    recommendedAction: "Re-engage with personalized ROI summary + case study",
    aiSummary:
      "Highest-value deal in your top of funnel but clearly cooling. Theo is a senior buyer with a habit of slow async cycles. A short, value-dense re-engage email referencing his summit comments tends to outperform a generic check-in by 3×.",
  },
  {
    id: "L-1024",
    name: "Sasha Berger",
    title: "VP of Marketing",
    company: "Lumen & Co.",
    industry: "Consumer Brands",
    employees: "240",
    email: "sasha.berger@lumenandco.com",
    phone: "+1 (212) 555-0163",
    source: "LinkedIn",
    ownerId: "rep_priya",
    stage: "negotiation",
    value: 38000,
    createdDaysAgo: 35,
    lastTouchDaysAgo: 1,
    nextTouchDays: 2,
    closeInDays: 6,
    notes:
      "Verbal yes pending exec sign-off. Sasha asked for a 90-day pilot extension.",
    tags: ["verbal-yes", "pilot-requested"],
    confidence: 78,
    reasonSurfaced: "Verbal yes · awaiting exec sign-off",
    recommendedAction: "Confirm pilot terms in writing today",
    aiSummary:
      "Late-stage deal with a verbal commit. Pilot extension is a standard risk-reduction ask from VP Marketing buyers. Lock the terms now — every day this sits uncrystallized increases the probability of scope creep.",
  },
  {
    id: "L-1019",
    name: "Owen Caldwell",
    title: "Director of Business Development",
    company: "Pacific Ridge Logistics",
    industry: "Logistics",
    employees: "640",
    email: "ocaldwell@pacificridge.io",
    phone: "+1 (503) 555-0192",
    source: "Outbound",
    ownerId: "rep_kenji",
    stage: "proposal_sent",
    value: 72000,
    createdDaysAgo: 31,
    lastTouchDaysAgo: 9,
    nextTouchDays: -3,
    closeInDays: 18,
    notes:
      "Proposal sent 4/19 covering 3 sites. Owen mentioned a competing vendor (RouteWise) is also in the eval.",
    tags: ["competitive", "multi-site"],
    confidence: 49,
    reasonSurfaced: "Competitive eval · 9 days quiet",
    recommendedAction: "Send competitive comparison + arrange exec sponsor call",
    aiSummary:
      "Competitive risk is the dominant factor here. RouteWise typically wins on price but loses on multi-site rollout speed — your proposal should lean into deployment timeline, not feature parity.",
  },
  {
    id: "L-1015",
    name: "Yuki Tanaka",
    title: "Head of CX",
    company: "Solene Beauty",
    industry: "Consumer Brands",
    employees: "85",
    email: "yuki@solenebeauty.com",
    phone: "+1 (310) 555-0119",
    source: "Inbound Form",
    ownerId: "rep_sloane",
    stage: "qualified",
    value: 22000,
    createdDaysAgo: 14,
    lastTouchDaysAgo: 3,
    nextTouchDays: 1,
    closeInDays: 21,
    notes:
      "Discovery confirmed budget and timeline. Asked for references in beauty/CPG.",
    tags: ["references-requested", "fast-cycle"],
    confidence: 64,
    reasonSurfaced: "References requested · ready to advance",
    recommendedAction: "Send 2 CPG references and propose a working session",
    aiSummary:
      "Clean SMB deal moving on a normal cadence. References + a working session typically push this profile to proposal within 5 days.",
  },
  {
    id: "L-1011",
    name: "Cameron Liu",
    title: "Chief of Staff",
    company: "Vega Insurance",
    industry: "Insurance",
    employees: "2,400",
    email: "cliu@vegainsurance.com",
    phone: "+1 (628) 555-0107",
    source: "Partner",
    ownerId: "rep_morgan",
    stage: "qualified",
    value: 196000,
    createdDaysAgo: 19,
    lastTouchDaysAgo: 5,
    nextTouchDays: 0,
    closeInDays: 38,
    notes:
      "Partner-sourced via Convex Consulting. Cameron is the executive sponsor; identifying day-to-day champion is open.",
    tags: ["partner-sourced", "enterprise", "champion-open"],
    confidence: 55,
    reasonSurfaced: "Enterprise · sponsor identified, champion missing",
    recommendedAction: "Ask Cameron to nominate a day-to-day champion",
    aiSummary:
      "Top-down partner deal with executive air cover but no operational champion yet. Without a champion, this kind of deal slips by 30+ days on average. Prioritize champion identification this week.",
  },
  // ----- mid funnel, healthy -----
  {
    id: "L-1009",
    name: "Daniela Rojas",
    title: "Director of Operations",
    company: "Mason & Hart Construction",
    industry: "Construction",
    employees: "320",
    email: "drojas@masonhart.com",
    phone: "+1 (713) 555-0152",
    source: "Inbound Form",
    ownerId: "rep_dante",
    stage: "contacted",
    value: 48000,
    createdDaysAgo: 9,
    lastTouchDaysAgo: 2,
    nextTouchDays: 2,
    closeInDays: 30,
    notes: "First call booked for next Tuesday. Sent prep materials.",
    tags: ["mid-market"],
    confidence: 45,
    reasonSurfaced: "Discovery booked · prep sent",
    recommendedAction: "Confirm attendees + agenda 24h before call",
    aiSummary:
      "Standard early-stage motion. The follow-through on prep + agenda confirmation is the single biggest predictor of a productive first call.",
  },
  {
    id: "L-1007",
    name: "Hassan Bouzid",
    title: "VP, Customer Success",
    company: "Trailhead Software",
    industry: "B2B SaaS",
    employees: "150",
    email: "hassan@trailheadsoftware.com",
    phone: "+1 (415) 555-0173",
    source: "Referral",
    ownerId: "rep_priya",
    stage: "new_lead",
    value: 36000,
    createdDaysAgo: 3,
    lastTouchDaysAgo: 1,
    nextTouchDays: 1,
    closeInDays: 35,
    notes: "Referred by Brightlane Health. Booked intro for Friday.",
    tags: ["referral", "warm-intro"],
    confidence: 50,
    reasonSurfaced: "Warm referral · intro booked",
    recommendedAction: "Send pre-meeting research note to Hassan",
    aiSummary:
      "Warm referrals from existing customers convert at 3.4× the rate of cold outbound for this ICP. Treat with priority.",
  },
  {
    id: "L-1004",
    name: "Elena Petrova",
    title: "VP Engineering",
    company: "Cobalt Cloud",
    industry: "B2B SaaS",
    employees: "95",
    email: "epetrova@cobaltcloud.io",
    phone: "+1 (408) 555-0125",
    source: "Outbound",
    ownerId: "rep_kenji",
    stage: "new_lead",
    value: 24000,
    createdDaysAgo: 4,
    lastTouchDaysAgo: 4,
    nextTouchDays: -1,
    closeInDays: 40,
    notes: "Replied to outbound asking for detail. No follow-up sent yet.",
    tags: ["replied"],
    confidence: 35,
    reasonSurfaced: "Replied to outbound · no follow-up sent",
    recommendedAction: "Send tailored response within 4 hours",
    aiSummary:
      "Reply-and-stall is the most common reason early outbound deals die. Replying within 4 hours of a prospect reply lifts continued engagement by 2.1×.",
  },
  {
    id: "L-1002",
    name: "Jasper Wong",
    title: "Director, IT",
    company: "Atlas Education Group",
    industry: "Education",
    employees: "420",
    email: "jwong@atlasedu.org",
    phone: "+1 (617) 555-0136",
    source: "Inbound Form",
    ownerId: "rep_sloane",
    stage: "contacted",
    value: 31000,
    createdDaysAgo: 11,
    lastTouchDaysAgo: 7,
    nextTouchDays: -2,
    closeInDays: 60,
    notes: "Asked about FERPA compliance. Sent docs, awaiting reply.",
    tags: ["compliance"],
    confidence: 38,
    reasonSurfaced: "Compliance docs sent · 7 days quiet",
    recommendedAction: "Nudge with offer to walk through FERPA docs live",
    aiSummary:
      "Education buyers stall around compliance docs. Offering a live walkthrough resolves the silence about 60% of the time.",
  },
  // ----- closed won (recent) -----
  {
    id: "L-0998",
    name: "Eitan Halevi",
    title: "Founder",
    company: "Riverstone Realty",
    industry: "Real Estate",
    employees: "60",
    email: "eitan@riverstonerealty.com",
    phone: "+1 (305) 555-0118",
    source: "Referral",
    ownerId: "rep_morgan",
    stage: "closed_won",
    value: 28000,
    createdDaysAgo: 51,
    lastTouchDaysAgo: 4,
    closeInDays: 0,
    closedDaysAgo: 4,
    notes: "Closed via expansion of pilot. Annual contract.",
    tags: ["closed-won", "annual"],
    confidence: 100,
    aiSummary:
      "Reference-able win with strong fit. Eitan agreed to a logo placement and a 15-min reference call format.",
  },
  {
    id: "L-0994",
    name: "Lila Marchetti",
    title: "VP Operations",
    company: "Cypress Foods",
    industry: "Food & Beverage",
    employees: "780",
    email: "lila@cypressfoods.com",
    phone: "+1 (404) 555-0149",
    source: "Outbound",
    ownerId: "rep_priya",
    stage: "closed_won",
    value: 64000,
    createdDaysAgo: 64,
    lastTouchDaysAgo: 10,
    closeInDays: 0,
    closedDaysAgo: 10,
    notes: "12-month deal. Implementation kickoff scheduled.",
    tags: ["closed-won"],
    confidence: 100,
    aiSummary: "Standard mid-market close. Implementation handoff in flight.",
  },
  {
    id: "L-0989",
    name: "Wesley Park",
    title: "Head of Sales",
    company: "Verity Mortgage",
    industry: "Financial Services",
    employees: "210",
    email: "wpark@veritymortgage.com",
    phone: "+1 (469) 555-0181",
    source: "Inbound Form",
    ownerId: "rep_dante",
    stage: "closed_won",
    value: 41000,
    createdDaysAgo: 47,
    lastTouchDaysAgo: 18,
    closeInDays: 0,
    closedDaysAgo: 18,
    notes: "Won against status quo (in-house spreadsheets).",
    tags: ["closed-won", "displacement"],
    confidence: 100,
    aiSummary: "Displacement of internal tooling — high stickiness profile.",
  },
  // ----- closed lost (recent) -----
  {
    id: "L-0985",
    name: "Beatrice Linville",
    title: "VP Procurement",
    company: "Halberd Industrial",
    industry: "Manufacturing",
    employees: "1,800",
    email: "blinville@halberd.com",
    phone: "+1 (313) 555-0167",
    source: "Outbound",
    ownerId: "rep_kenji",
    stage: "closed_lost",
    value: 88000,
    createdDaysAgo: 73,
    lastTouchDaysAgo: 21,
    closeInDays: 0,
    closedDaysAgo: 21,
    lostReason: "Lost to Competitor",
    notes:
      "Lost to RouteWise on price + an existing master agreement. Re-evaluation in 12 months.",
    tags: ["closed-lost", "competitive"],
    confidence: 0,
    aiSummary:
      "Loss driven by procurement preference for incumbent vendor. Worth a quarterly check-in — the user community at Halberd was supportive of our solution.",
  },
  {
    id: "L-0978",
    name: "Faisal Rahman",
    title: "Director, RevOps",
    company: "Mariner Travel",
    industry: "Travel & Hospitality",
    employees: "340",
    email: "frahman@marinertravel.com",
    phone: "+1 (305) 555-0173",
    source: "LinkedIn",
    ownerId: "rep_sloane",
    stage: "closed_lost",
    value: 32000,
    createdDaysAgo: 54,
    lastTouchDaysAgo: 12,
    closeInDays: 0,
    closedDaysAgo: 12,
    lostReason: "No Budget",
    notes: "Budget froze after Q1 review. Asked to re-engage in Q3.",
    tags: ["closed-lost", "budget-freeze"],
    confidence: 0,
    aiSummary:
      "Recoverable in Q3. Faisal explicitly asked to re-engage — set a reminder for July.",
  },
  {
    id: "L-0972",
    name: "Nadia Costa",
    title: "Head of Strategy",
    company: "Bellwether Insurance",
    industry: "Insurance",
    employees: "640",
    email: "nadia.costa@bellwether.co",
    phone: "+1 (203) 555-0114",
    source: "Outbound",
    ownerId: "rep_morgan",
    stage: "closed_lost",
    value: 54000,
    createdDaysAgo: 88,
    lastTouchDaysAgo: 30,
    closeInDays: 0,
    closedDaysAgo: 30,
    lostReason: "Wrong Fit",
    notes: "Use case is closer to BPM than RevOps. Not a target ICP.",
    tags: ["closed-lost", "ICP-mismatch"],
    confidence: 0,
    aiSummary:
      "ICP mismatch identified late. Worth tagging for AE training: pre-qualification missed two clear signals.",
  },
  // ----- additional active deals to fill the funnel -----
  {
    id: "L-1045",
    name: "Carter Yates",
    title: "Director, Operations",
    company: "Granite Peak Outfitters",
    industry: "Retail",
    employees: "140",
    email: "carter@granitepeak.com",
    phone: "+1 (406) 555-0144",
    source: "Inbound Form",
    ownerId: "rep_sloane",
    stage: "new_lead",
    value: 18000,
    createdDaysAgo: 2,
    lastTouchDaysAgo: 2,
    nextTouchDays: 0,
    closeInDays: 30,
    notes: "Filled out demo form. Auto-routed to Sloane.",
    tags: ["new"],
    confidence: 30,
    reasonSurfaced: "New inbound · awaiting first touch",
    recommendedAction: "Send personalized intro within 1 hour",
    aiSummary:
      "Inbound demo requests respond best when contacted within 60 minutes — conversion drops 7× after 24h.",
  },
  {
    id: "L-1047",
    name: "Anya Volkov",
    title: "Head of Partnerships",
    company: "Kestrel Mobility",
    industry: "Transportation",
    employees: "260",
    email: "anya@kestrelmobility.io",
    phone: "+1 (415) 555-0188",
    source: "Partner",
    ownerId: "rep_kenji",
    stage: "contacted",
    value: 52000,
    createdDaysAgo: 6,
    lastTouchDaysAgo: 1,
    nextTouchDays: 3,
    closeInDays: 28,
    notes: "Partner intro from Convex. Initial call went well.",
    tags: ["partner"],
    confidence: 48,
    reasonSurfaced: "Partner intro · in active dialog",
    recommendedAction: "Share rollout plan template before next call",
    aiSummary:
      "Partner-sourced deals close 1.6× faster when a rollout artifact is shared in the first 7 days.",
  },
  {
    id: "L-1049",
    name: "Quentin Ashford",
    title: "VP Sales",
    company: "Ironside Security",
    industry: "Cybersecurity",
    employees: "120",
    email: "quentin@ironsidesec.com",
    phone: "+1 (703) 555-0166",
    source: "Cold Email",
    ownerId: "rep_dante",
    stage: "qualified",
    value: 67000,
    createdDaysAgo: 17,
    lastTouchDaysAgo: 3,
    nextTouchDays: 1,
    closeInDays: 24,
    notes: "Strong fit. Building business case with Quentin.",
    tags: ["business-case"],
    confidence: 60,
    reasonSurfaced: "Business case in progress",
    recommendedAction: "Co-build slide on competitive displacement",
    aiSummary:
      "Cybersecurity buyers value third-party validation. Including a Forrester or G2 reference in the business case lifts internal approvals.",
  },
  {
    id: "L-1051",
    name: "Mei Chen",
    title: "COO",
    company: "Lattice Diagnostics",
    industry: "Healthcare",
    employees: "75",
    email: "mei.chen@latticedx.com",
    phone: "+1 (650) 555-0132",
    source: "Event",
    ownerId: "rep_priya",
    stage: "proposal_sent",
    value: 44000,
    createdDaysAgo: 26,
    lastTouchDaysAgo: 2,
    nextTouchDays: 4,
    closeInDays: 16,
    notes: "Proposal under review. Mei asked for a procurement-friendly version.",
    tags: ["procurement"],
    confidence: 62,
    reasonSurfaced: "Proposal under review · procurement-friendly version requested",
    recommendedAction: "Send standardized procurement packet by EOD",
    aiSummary:
      "Procurement-friendly packets reduce cycle time by ~12 days for healthcare buyers in this size band.",
  },
];

// We import depth data lazily inside the map below via require-style indirection
// to avoid circular imports — depth.ts uses helpers from this file.
import {
  stakeholdersByLead,
  blockersByLead,
  dataIssuesByLead,
  duplicates,
  unreadEmailsByLead,
} from "./depth";

export const leads: Lead[] = seeds.map((s) => {
  const lastTouch = daysAgo(s.lastTouchDaysAgo);
  const nextTouch =
    s.nextTouchDays === undefined
      ? undefined
      : s.nextTouchDays >= 0
        ? daysFromNow(s.nextTouchDays)
        : daysAgo(-s.nextTouchDays);

  // Risk derivation
  const inactive = s.lastTouchDaysAgo;
  const isClosed = s.stage === "closed_won" || s.stage === "closed_lost";
  let riskLevel: Lead["riskLevel"] = "low";
  if (!isClosed) {
    if (inactive >= 12 || (s.nextTouchDays ?? 0) <= -4) riskLevel = "critical";
    else if (inactive >= 7 || (s.nextTouchDays ?? 0) <= -1) riskLevel = "high";
    else if (inactive >= 4) riskLevel = "medium";
  }

  // Urgency score (composite)
  let urgency = 0;
  if (!isClosed) {
    urgency += Math.min(40, inactive * 3); // inactivity weight
    urgency += Math.max(0, 30 - s.closeInDays); // close-date pressure
    if ((s.nextTouchDays ?? 0) < 0) urgency += 15; // overdue
    urgency += Math.round(s.value / 10000); // value weight
    urgency = Math.min(100, Math.max(0, urgency));
  }

  return {
    id: s.id,
    name: s.name,
    title: s.title,
    company: s.company,
    industry: s.industry,
    employees: s.employees,
    email: s.email,
    phone: s.phone,
    source: s.source,
    ownerId: s.ownerId,
    stage: s.stage,
    value: s.value,
    createdAt: daysAgo(s.createdDaysAgo),
    lastTouchAt: lastTouch,
    nextTouchAt: nextTouch,
    closeDate: daysFromNow(s.closeInDays),
    closedAt:
      s.closedDaysAgo !== undefined ? daysAgo(s.closedDaysAgo) : undefined,
    lostReason: s.lostReason,
    notes: s.notes,
    tags: s.tags,
    confidence: s.confidence,
    daysInactive: inactive,
    riskLevel,
    urgencyScore: urgency,
    recommendedAction: s.recommendedAction ?? "Review and advance",
    reasonSurfaced: s.reasonSurfaced ?? "Routine review",
    aiSummary:
      s.aiSummary ?? "No AI summary available for this lead at this time.",
    stakeholders: stakeholdersByLead[s.id] ?? [],
    blockers: blockersByLead[s.id] ?? [],
    dataIssues: dataIssuesByLead[s.id] ?? [],
    unreadEmails: unreadEmailsByLead[s.id] ?? 0,
    duplicateOf: duplicates[s.id],
  };
});

export const leadsById = Object.fromEntries(leads.map((l) => [l.id, l]));

// helpers
export const activeLeads = leads.filter(
  (l) => l.stage !== "closed_won" && l.stage !== "closed_lost",
);

export const fmtMoney = (n: number) => {
  if (n >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `$${n.toLocaleString()}`;
};

