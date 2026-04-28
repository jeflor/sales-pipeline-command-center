import {
  AlertTriangle,
  ShieldAlert,
  Ban,
  UserMinus,
  Snowflake,
  Mail,
  Copy,
  ScrollText,
  ShieldCheck,
  Clock,
} from "lucide-react";
import type { Lead, BlockerKind, DataIssue } from "../../data/types";

const blockerIcon: Record<
  BlockerKind,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  legal_review: ScrollText,
  champion_dark: UserMinus,
  procurement_freeze: Snowflake,
  missing_decision_maker: AlertTriangle,
  security_review: ShieldCheck,
  budget_freeze: Snowflake,
  competitive: Ban,
  no_response: Clock,
};

const issueLabel: Record<DataIssue, string> = {
  no_decision_maker: "No decision-maker",
  no_champion: "No champion",
  missing_close_date: "No close date",
  stale_contact: "Stale contact info",
  duplicate_suspected: "Possible duplicate",
  missing_industry: "Missing industry",
  no_next_touch: "No next touch",
};

export function BlockerPills({
  lead,
  max,
  size = "sm",
}: {
  lead: Lead;
  max?: number;
  size?: "xs" | "sm";
}) {
  if (lead.blockers.length === 0) return null;
  const visible = max ? lead.blockers.slice(0, max) : lead.blockers;
  const overflow = lead.blockers.length - visible.length;
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {visible.map((b) => {
        const Icon = blockerIcon[b.kind];
        return (
          <span
            key={b.id}
            title={`${b.label}${b.detail ? " · " + b.detail : ""}`}
            className={`inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-warning-200 bg-warning-50 text-warning-700 font-medium ${
              size === "xs"
                ? "px-1.5 py-0 text-[10.5px]"
                : "px-1.5 py-0.5 text-[11px]"
            }`}
          >
            <Icon className="h-3 w-3" />
            {b.label}
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="badge-warning">+{overflow}</span>
      )}
    </div>
  );
}

export function DataIssuePills({
  lead,
  max = 2,
}: {
  lead: Lead;
  max?: number;
}) {
  if (lead.dataIssues.length === 0) return null;
  const visible = lead.dataIssues.slice(0, max);
  const overflow = lead.dataIssues.length - visible.length;
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {visible.map((d) => (
        <span
          key={d}
          className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-ink-200 bg-ink-100 text-ink-600 px-1.5 py-0 text-[10.5px] font-medium"
        >
          <AlertTriangle className="h-3 w-3 text-warning-500" />
          {issueLabel[d]}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10.5px] text-ink-500 font-medium">
          +{overflow}
        </span>
      )}
    </div>
  );
}

export function UnreadEmailPill({ lead }: { lead: Lead }) {
  if (!lead.unreadEmails) return null;
  return (
    <span
      title={`${lead.unreadEmails} unread reply`}
      className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-brand-200 bg-brand-50 text-brand-700 px-1.5 py-0 text-[10.5px] font-semibold"
    >
      <Mail className="h-3 w-3" />
      {lead.unreadEmails} new
    </span>
  );
}

export function DuplicatePill({ lead }: { lead: Lead }) {
  if (!lead.duplicateOf) return null;
  return (
    <span
      title={`Possible duplicate of ${lead.duplicateOf}`}
      className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-warning-200 bg-warning-50 text-warning-700 px-1.5 py-0 text-[10.5px] font-medium"
    >
      <Copy className="h-3 w-3" />
      Duplicate?
    </span>
  );
}

export function EscalationPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-danger-200 bg-danger-50 text-danger-700 px-1.5 py-0 text-[10.5px] font-semibold">
      <ShieldAlert className="h-3 w-3" />
      Escalated
    </span>
  );
}
