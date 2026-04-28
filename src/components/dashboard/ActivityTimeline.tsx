import {
  Phone,
  Mail,
  MailOpen,
  Calendar,
  StickyNote,
  ArrowRightLeft,
  CheckCircle2,
  FileText,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Card, CardHeader } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { useStore } from "../../state/DataStore";
import { relativeTime } from "../../lib/format";
import type { ActivityType } from "../../data/types";
import { useAppState } from "../../state/AppState";

const iconFor: Record<
  ActivityType,
  { Icon: ComponentType<SVGProps<SVGSVGElement>>; tone: string }
> = {
  call: { Icon: Phone, tone: "bg-brand-50 text-brand-700" },
  email_sent: { Icon: Mail, tone: "bg-ink-100 text-ink-700" },
  email_received: { Icon: MailOpen, tone: "bg-success-50 text-success-700" },
  meeting: { Icon: Calendar, tone: "bg-warning-50 text-warning-700" },
  note: { Icon: StickyNote, tone: "bg-ink-100 text-ink-600" },
  stage_change: { Icon: ArrowRightLeft, tone: "bg-brand-50 text-brand-700" },
  task_completed: {
    Icon: CheckCircle2,
    tone: "bg-success-50 text-success-700",
  },
  proposal_sent: { Icon: FileText, tone: "bg-brand-50 text-brand-700" },
  blocker_set: { Icon: StickyNote, tone: "bg-warning-50 text-warning-700" },
  escalation: { Icon: ArrowRightLeft, tone: "bg-danger-50 text-danger-700" },
};

export function ActivityTimeline({ limit = 8 }: { limit?: number }) {
  const { openLead, role, currentUserId } = useAppState();
  const store = useStore();
  const leadsById = Object.fromEntries(store.leads.map((l) => [l.id, l]));
  const filtered =
    role === "rep"
      ? store.activities.filter((a) => a.ownerId === currentUserId)
      : store.activities;
  const sorted = [...filtered]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, limit);
  return (
    <Card>
      <CardHeader
        eyebrow="Activity"
        title="Live activity stream"
        description={
          role === "rep"
            ? "Your recent calls, emails, meetings, and stage changes."
            : "Team-wide activity across the open pipeline."
        }
        right={
          <button className="btn-ghost text-[12px]" type="button">
            Open feed
          </button>
        }
      />
      <ol className="relative space-y-3.5">
        {sorted.map((a) => {
          const cfg = iconFor[a.type];
          const lead = leadsById[a.leadId];
          return (
            <li key={a.id} className="relative pl-9">
              <span
                className={`absolute left-0 top-0.5 h-7 w-7 rounded-full flex items-center justify-center ${cfg.tone}`}
              >
                <cfg.Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => lead && openLead(lead.id)}
                    className="text-[13px] font-medium text-ink-900 hover:underline text-left"
                  >
                    {a.summary}
                  </button>
                  {a.detail && (
                    <p className="text-[12px] text-ink-500 mt-0.5">
                      {a.detail}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-400">
                    <Avatar ownerId={a.ownerId} size="xs" />
                    <span className="font-medium text-ink-600">
                      {a.ownerId.replace("rep_", "").replace(/^./, (c) =>
                        c.toUpperCase(),
                      )}
                    </span>
                    {lead && (
                      <>
                        <span>·</span>
                        <span>{lead.company}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-ink-400 whitespace-nowrap pt-0.5">
                  {relativeTime(a.at)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
