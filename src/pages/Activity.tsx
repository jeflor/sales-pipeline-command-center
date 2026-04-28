import { useState } from "react";
import {
  Phone,
  Mail,
  MailOpen,
  Calendar,
  StickyNote,
  ArrowRightLeft,
  CheckCircle2,
  FileText,
  Filter,
  Search,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { activities } from "../data/activities";
import { leadsById } from "../data/leads";
import { repsById } from "../data/reps";
import { fmtTime, fmtDate, relativeTime } from "../lib/format";
import type { ActivityType } from "../data/types";
import { useAppState } from "../state/AppState";

const iconFor: Record<
  ActivityType,
  { Icon: ComponentType<SVGProps<SVGSVGElement>>; tone: string; label: string }
> = {
  call: { Icon: Phone, tone: "bg-brand-50 text-brand-700", label: "Call" },
  email_sent: { Icon: Mail, tone: "bg-ink-100 text-ink-700", label: "Email sent" },
  email_received: {
    Icon: MailOpen,
    tone: "bg-success-50 text-success-700",
    label: "Email received",
  },
  meeting: {
    Icon: Calendar,
    tone: "bg-warning-50 text-warning-700",
    label: "Meeting",
  },
  note: { Icon: StickyNote, tone: "bg-ink-100 text-ink-600", label: "Note" },
  stage_change: {
    Icon: ArrowRightLeft,
    tone: "bg-brand-50 text-brand-700",
    label: "Stage change",
  },
  task_completed: {
    Icon: CheckCircle2,
    tone: "bg-success-50 text-success-700",
    label: "Task completed",
  },
  proposal_sent: {
    Icon: FileText,
    tone: "bg-brand-50 text-brand-700",
    label: "Proposal sent",
  },
};

const filters: Array<{ id: "all" | ActivityType; label: string }> = [
  { id: "all", label: "All" },
  { id: "call", label: "Calls" },
  { id: "email_sent", label: "Outbound emails" },
  { id: "email_received", label: "Inbound emails" },
  { id: "meeting", label: "Meetings" },
  { id: "stage_change", label: "Stage changes" },
];

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(today.getTime() - 86400000);
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return fmtDate(iso);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function ActivityPage() {
  const { role, currentUserId, openLead } = useAppState();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ActivityType>("all");

  const filtered = activities
    .filter((a) =>
      role === "rep" ? a.ownerId === currentUserId : true,
    )
    .filter((a) => (filter === "all" ? true : a.type === filter))
    .filter((a) => {
      if (!query) return true;
      const lead = leadsById[a.leadId];
      return `${a.summary} ${a.detail ?? ""} ${lead?.company ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
    })
    .sort((a, b) => (a.at < b.at ? 1 : -1));

  // Group by day
  const groups: Record<string, typeof filtered> = {};
  for (const a of filtered) {
    const k = dayLabel(a.at);
    (groups[k] ||= []).push(a);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Activity
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {role === "rep"
              ? "Your full activity stream — calls, emails, meetings, and stage changes."
              : "Team-wide activity feed."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity…"
              className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-56"
            />
          </div>
          <button className="btn-secondary" type="button">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-2.5 py-1 rounded-md text-[12px] font-medium ${
              filter === f.id
                ? "bg-ink-900 text-white"
                : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        {Object.entries(groups).map(([day, items]) => (
          <section key={day} className="mb-6 last:mb-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-2">
              {day}
            </h3>
            <ol className="space-y-3">
              {items.map((a) => {
                const cfg = iconFor[a.type];
                const lead = leadsById[a.leadId];
                const owner = repsById[a.ownerId];
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-ink-50/40 cursor-pointer"
                    onClick={() => lead && openLead(lead.id)}
                  >
                    <span
                      className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${cfg.tone}`}
                    >
                      <cfg.Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink-900">
                        {a.summary}
                      </div>
                      {a.detail && (
                        <p className="text-[12px] text-ink-500 mt-0.5">
                          {a.detail}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-400 flex-wrap">
                        <Avatar ownerId={owner.id} size="xs" />
                        <span className="font-medium text-ink-600">
                          {owner.name}
                        </span>
                        {lead && (
                          <>
                            <span>·</span>
                            <span>{lead.company}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{cfg.label}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-ink-400 whitespace-nowrap">
                      {fmtTime(a.at)} · {relativeTime(a.at)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-500">
            No activity matches the current filters.
          </div>
        )}
      </Card>
    </div>
  );
}
