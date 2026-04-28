import { useEffect, useState } from "react";
import {
  X,
  Building2,
  Briefcase,
  Mail,
  Phone,
  CalendarClock,
  Tag,
  Sparkles,
  CheckSquare,
  Plus,
  ArrowRight,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { leadsById } from "../../data/leads";
import { repsById } from "../../data/reps";
import { activityForLead, tasks } from "../../data/activities";
import { STAGES } from "../../data/types";
import { Avatar } from "../ui/Avatar";
import { Badge, RiskBadge } from "../ui/Badge";
import { fmtDate, fmtMoneyFull, relativeTime } from "../../lib/format";

const stageOrder = STAGES.filter((s) => !s.closed || s.id === "closed_won");

export function LeadDrawer() {
  const { openLeadId, closeLead, openAI } = useAppState();
  const lead = openLeadId ? leadsById[openLeadId] : null;
  const [tab, setTab] = useState<"overview" | "activity" | "tasks" | "ai">(
    "overview",
  );

  // Reset tab on lead change
  useEffect(() => {
    setTab("overview");
  }, [openLeadId]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLead();
    };
    if (openLeadId) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openLeadId, closeLead]);

  if (!lead) return null;

  const owner = repsById[lead.ownerId];
  const stageIdx = stageOrder.findIndex((s) => s.id === lead.stage);
  const leadActivities = activityForLead(lead.id);
  const leadTasks = tasks.filter((t) => t.leadId === lead.id);

  return (
    <>
      <div
        onClick={closeLead}
        className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-40 animate-in fade-in"
      />
      <aside className="fixed top-0 right-0 h-screen w-full sm:w-[640px] bg-white shadow-drawer z-50 flex flex-col">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-ink-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{lead.id}</Badge>
              <RiskBadge level={lead.riskLevel} />
              <Badge tone="brand">{lead.source}</Badge>
            </div>
            <button
              onClick={closeLead}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: "#1f2533" }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-ink-900 truncate">
                {lead.name}
              </h2>
              <div className="text-sm text-ink-500 truncate">
                {lead.title} · <span className="text-ink-700">{lead.company}</span>
              </div>
              <div className="mt-1 text-[12px] text-ink-400 flex items-center gap-3 flex-wrap">
                <span>{lead.industry}</span>
                <span>·</span>
                <span>{lead.employees} employees</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-ink-400">Deal value</div>
              <div className="text-xl font-semibold text-ink-900">
                {fmtMoneyFull(lead.value)}
              </div>
              <div className="text-[11px] text-ink-500">
                Close {fmtDate(lead.closeDate)}
              </div>
            </div>
          </div>

          {/* Stage progress */}
          <div className="mt-4">
            <div className="flex items-center gap-1">
              {stageOrder.map((s, i) => {
                const passed = i <= stageIdx;
                const current = i === stageIdx;
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`h-1.5 w-full rounded-full ${
                        passed ? "bg-brand-500" : "bg-ink-100"
                      } ${current ? "ring-2 ring-brand-200 ring-offset-1" : ""}`}
                    />
                    <span
                      className={`text-[10px] ${
                        passed
                          ? "text-ink-700 font-semibold"
                          : "text-ink-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3 border-b border-ink-200 flex items-center gap-2 flex-wrap">
          <button className="btn-primary" type="button">
            <ArrowRight className="h-3.5 w-3.5" />
            Move stage
          </button>
          <button className="btn-secondary" type="button">
            <Phone className="h-3.5 w-3.5" />
            Log call
          </button>
          <button className="btn-secondary" type="button">
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>
          <button className="btn-secondary" type="button">
            <CheckSquare className="h-3.5 w-3.5" />
            Add task
          </button>
          <button
            type="button"
            onClick={() => openAI(lead.id)}
            className="btn-secondary text-brand-700 border-brand-200 hover:bg-brand-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI assistant
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-ink-200">
          <div className="flex gap-1 -mb-px">
            {(["overview", "activity", "tasks", "ai"] as const).map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-3 py-2 text-[12.5px] font-medium border-b-2 capitalize ${
                  tab === id
                    ? "border-brand-600 text-ink-900"
                    : "border-transparent text-ink-500 hover:text-ink-800"
                }`}
              >
                {id === "ai" ? "AI summary" : id}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && (
            <div className="p-5 space-y-5">
              {/* AI summary card */}
              <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-brand-700" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                    AI deal summary
                  </span>
                </div>
                <p className="text-[13.5px] text-ink-800 leading-relaxed">
                  {lead.aiSummary}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-brand-700">
                  <button
                    type="button"
                    onClick={() => openAI(lead.id)}
                    className="font-semibold hover:underline"
                  >
                    Open full assistant →
                  </button>
                </div>
              </div>

              {/* Two-up details */}
              <div className="grid grid-cols-2 gap-5">
                <Section title="Contact">
                  <Row icon={Mail} label="Email" value={lead.email} mono />
                  <Row icon={Phone} label="Phone" value={lead.phone} mono />
                  <Row
                    icon={Briefcase}
                    label="Title"
                    value={lead.title}
                  />
                  <Row
                    icon={Building2}
                    label="Company"
                    value={`${lead.company} · ${lead.employees}`}
                  />
                </Section>
                <Section title="Deal">
                  <Row
                    icon={TrendingUp}
                    label="Value"
                    value={fmtMoneyFull(lead.value)}
                  />
                  <Row
                    icon={CalendarClock}
                    label="Last touch"
                    value={`${fmtDate(lead.lastTouchAt)} (${relativeTime(lead.lastTouchAt)})`}
                  />
                  <Row
                    icon={CalendarClock}
                    label="Next touch"
                    value={
                      lead.nextTouchAt
                        ? `${fmtDate(lead.nextTouchAt)} (${relativeTime(lead.nextTouchAt)})`
                        : "—"
                    }
                  />
                  <Row
                    icon={Tag}
                    label="Source"
                    value={lead.source}
                  />
                </Section>
              </div>

              {/* Risk + scoring */}
              <Section title="Signal &amp; scoring">
                <div className="grid grid-cols-3 gap-3">
                  <Stat
                    label="Urgency"
                    value={String(lead.urgencyScore)}
                    sub="Composite score"
                    accent={
                      lead.urgencyScore >= 70
                        ? "danger"
                        : lead.urgencyScore >= 40
                          ? "warning"
                          : "neutral"
                    }
                  />
                  <Stat
                    label="Confidence"
                    value={`${lead.confidence}%`}
                    sub="Win likelihood"
                    accent={
                      lead.confidence >= 65
                        ? "success"
                        : lead.confidence >= 40
                          ? "neutral"
                          : "warning"
                    }
                  />
                  <Stat
                    label="Days inactive"
                    value={`${lead.daysInactive}d`}
                    sub="Since last touch"
                    accent={
                      lead.daysInactive >= 12
                        ? "danger"
                        : lead.daysInactive >= 7
                          ? "warning"
                          : "neutral"
                    }
                  />
                </div>
                <div className="mt-3 rounded-lg border border-ink-200 bg-ink-50/60 p-3 flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-warning-600 mt-0.5" />
                  <div className="text-[12.5px] text-ink-700">
                    <span className="font-semibold text-ink-900">
                      {lead.reasonSurfaced}.
                    </span>{" "}
                    Recommended next action:{" "}
                    <span className="text-brand-700 font-semibold">
                      {lead.recommendedAction}
                    </span>
                    .
                  </div>
                </div>
              </Section>

              {/* Notes */}
              <Section title="Notes">
                <p className="text-[13px] text-ink-700 leading-relaxed">
                  {lead.notes}
                </p>
                <button
                  type="button"
                  className="mt-3 text-[12px] inline-flex items-center gap-1 text-brand-700 font-semibold hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Add note
                </button>
              </Section>

              {/* Tags */}
              <Section title="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((t) => (
                    <span key={t} className="badge-neutral">
                      {t}
                    </span>
                  ))}
                </div>
              </Section>

              {/* Owner */}
              <Section title="Owner">
                <div className="flex items-center gap-2">
                  <Avatar ownerId={owner.id} size="md" />
                  <div>
                    <div className="text-[13px] font-semibold text-ink-800">
                      {owner.name}
                    </div>
                    <div className="text-[11.5px] text-ink-500">
                      {owner.email}
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {tab === "activity" && (
            <div className="p-5">
              <ol className="space-y-3.5 relative">
                {leadActivities.map((a) => (
                  <li
                    key={a.id}
                    className="relative pl-6 border-l-2 border-ink-100 ml-2 pb-2"
                  >
                    <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white" />
                    <div className="text-[13px] font-medium text-ink-900">
                      {a.summary}
                    </div>
                    {a.detail && (
                      <p className="text-[12px] text-ink-500 mt-0.5">
                        {a.detail}
                      </p>
                    )}
                    <div className="mt-1 text-[11px] text-ink-400 flex items-center gap-1.5">
                      <Avatar ownerId={a.ownerId} size="xs" />
                      <span className="font-medium text-ink-600">
                        {repsById[a.ownerId]?.name}
                      </span>
                      <span>·</span>
                      <span>{relativeTime(a.at)}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 pt-3 border-t border-ink-100 text-[11px] text-ink-400">
                Audit trail · {leadActivities.length} entries · created{" "}
                {fmtDate(lead.createdAt)}
              </div>
            </div>
          )}

          {tab === "tasks" && (
            <div className="p-5">
              {leadTasks.length === 0 ? (
                <EmptyState
                  title="No tasks for this deal yet"
                  body="Tasks created here will sync to your day-of plan."
                />
              ) : (
                <ul className="space-y-2">
                  {leadTasks.map((t) => {
                    const overdue =
                      !t.done && new Date(t.due).getTime() < Date.now();
                    return (
                      <li
                        key={t.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-ink-200 hover:bg-ink-50/40"
                      >
                        <input
                          type="checkbox"
                          checked={t.done}
                          readOnly
                          className="mt-1 h-4 w-4 rounded border-ink-300 text-brand-600"
                        />
                        <div className="flex-1">
                          <div
                            className={`text-[13px] font-medium ${
                              t.done
                                ? "line-through text-ink-400"
                                : "text-ink-900"
                            }`}
                          >
                            {t.title}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                            <span
                              className={`${
                                overdue
                                  ? "text-danger-700 font-semibold"
                                  : "text-ink-500"
                              }`}
                            >
                              Due {relativeTime(t.due)}
                            </span>
                            {t.priority === "high" && (
                              <Badge tone="warning">High priority</Badge>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <button
                type="button"
                className="mt-4 btn-secondary"
              >
                <Plus className="h-3.5 w-3.5" />
                New task
              </button>
            </div>
          )}

          {tab === "ai" && (
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-brand-700" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                    Deal narrative
                  </span>
                </div>
                <p className="text-[13.5px] text-ink-800 leading-relaxed">
                  {lead.aiSummary}
                </p>
              </div>

              <Section title="Likely objections">
                <ul className="text-[13px] text-ink-700 space-y-1.5 list-disc pl-5">
                  <li>Pricing for the second-year ramp may need to be capped.</li>
                  <li>
                    Procurement will require a formal security questionnaire
                    response.
                  </li>
                  <li>
                    Legal redlines around data ownership and termination clauses
                    are likely.
                  </li>
                </ul>
              </Section>

              <Section title="Suggested next move">
                <div className="rounded-lg border border-ink-200 p-3 bg-white">
                  <div className="text-[12.5px] font-semibold text-ink-900">
                    {lead.recommendedAction}
                  </div>
                  <p className="text-[12px] text-ink-500 mt-1">
                    Reasoning: {lead.reasonSurfaced}.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAI(lead.id)}
                    className="mt-3 btn-primary"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Open AI assistant
                  </button>
                </div>
              </Section>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="h-eyebrow mb-2">{title}</div>
      {children}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[12.5px] py-1">
      <Icon className="h-3.5 w-3.5 text-ink-400 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-ink-400 leading-tight">{label}</div>
        <div
          className={`text-ink-800 ${mono ? "font-mono text-[12.5px]" : ""} truncate`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "neutral" | "warning" | "danger" | "success";
}) {
  const accentClass: Record<typeof accent, string> = {
    neutral: "bg-ink-50 text-ink-800",
    warning: "bg-warning-50 text-warning-700",
    danger: "bg-danger-50 text-danger-700",
    success: "bg-success-50 text-success-700",
  } as const;
  return (
    <div className="rounded-lg border border-ink-200 p-3 bg-white">
      <div className="h-eyebrow">{label}</div>
      <div
        className={`mt-1 inline-flex items-baseline gap-1 px-1.5 rounded ${accentClass[accent]}`}
      >
        <span className="text-base font-semibold">{value}</span>
      </div>
      <div className="text-[11px] text-ink-500 mt-1">{sub}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-10 px-6 border border-dashed border-ink-200 rounded-xl">
      <div className="text-sm font-semibold text-ink-700">{title}</div>
      <div className="text-[12px] text-ink-500 mt-1">{body}</div>
    </div>
  );
}
