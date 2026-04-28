import { useEffect, useState } from "react";
import {
  X,
  Building2,
  Briefcase,
  Mail,
  MailOpen,
  Phone,
  CalendarClock,
  Tag,
  Sparkles,
  CheckSquare,
  Plus,
  ArrowRight,
  ShieldAlert,
  TrendingUp,
  Users,
  AlertOctagon,
  Paperclip,
  MessageSquare,
  ScrollText,
  Send,
  AtSign,
  Star,
  Copy,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { useStore } from "../../state/DataStore";
import { useToast } from "../../state/Toaster";
import { repsById } from "../../data/reps";
import { activityForLead } from "../../data/activities";
import { STAGES } from "../../data/types";
import type { Stage } from "../../data/types";
import {
  emailThreadsByLead,
  attachmentsByLead,
} from "../../data/depth";
import { Avatar } from "../ui/Avatar";
import { Badge, RiskBadge } from "../ui/Badge";
import {
  DataIssuePills,
  DuplicatePill,
  EscalationPill,
} from "../signals/SignalPills";
import type { EmailMessage, Attachment } from "../../data/types";
import { fmtDate, fmtMoneyFull, relativeTime } from "../../lib/format";

const stageOrder = STAGES.filter((s) => !s.closed || s.id === "closed_won");

type Tab = "overview" | "stakeholders" | "blockers" | "emails" | "tasks" | "comments" | "files" | "history";

export function LeadDrawer() {
  const { openLeadId, closeLead, openAI, openQuickLog, currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  const lead = openLeadId ? store.leadById(openLeadId) : null;

  const [tab, setTab] = useState<Tab>("overview");
  const [stageMenuOpen, setStageMenuOpen] = useState(false);

  useEffect(() => {
    setTab("overview");
    setStageMenuOpen(false);
  }, [openLeadId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLead();
    };
    if (openLeadId) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openLeadId, closeLead]);

  // Mark inbound emails as read when the user opens the email tab
  useEffect(() => {
    if (lead && tab === "emails" && lead.unreadEmails > 0) {
      const t = setTimeout(() => store.markEmailsRead(lead.id), 600);
      return () => clearTimeout(t);
    }
  }, [tab, lead, store]);

  if (!lead) return null;

  const owner = repsById[lead.ownerId];
  const stageIdx = stageOrder.findIndex((s) => s.id === lead.stage);
  const leadActivities = activityForLead(lead.id);
  const leadTasks = store.tasks.filter((t) => t.leadId === lead.id);
  const emails = emailThreadsByLead[lead.id] ?? [];
  const attachments = attachmentsByLead[lead.id] ?? [];
  const comments = store.internalComments.filter((c) => c.leadId === lead.id);

  const moveStage = (to: Stage) => {
    store.changeStage({ leadId: lead.id, actorId: currentUserId, to });
    toast.success(`Stage → ${to.replace("_", " ")} · ${lead.company}`);
    setStageMenuOpen(false);
  };

  return (
    <>
      <div
        onClick={closeLead}
        className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-40"
      />
      <aside className="fixed top-0 right-0 h-screen w-full sm:w-[680px] bg-white shadow-drawer z-50 flex flex-col">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-ink-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="neutral">{lead.id}</Badge>
              <RiskBadge level={lead.riskLevel} />
              <Badge tone="brand">{lead.source}</Badge>
              <DuplicatePill lead={lead} />
              {store.activities.some(
                (a) => a.leadId === lead.id && a.type === "escalation",
              ) && <EscalationPill />}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => store.toggleStar({ leadId: lead.id })}
                className={`h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-ink-100 ${
                  lead.starred ? "text-warning-500" : "text-ink-400"
                }`}
                title={lead.starred ? "Unstar" : "Star"}
              >
                <Star className="h-4 w-4" fill={lead.starred ? "currentColor" : "none"} />
              </button>
              <button
                onClick={closeLead}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
                {lead.title} ·{" "}
                <span className="text-ink-700">{lead.company}</span>
              </div>
              <div className="mt-1 text-[12px] text-ink-400 flex items-center gap-3 flex-wrap">
                <span>{lead.industry}</span>
                <span>·</span>
                <span>{lead.employees} employees</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Avatar ownerId={owner.id} size="xs" />
                  {owner.name}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
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
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => moveStage(s.id)}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`Move to ${s.label}`}
                  >
                    <div
                      className={`h-1.5 w-full rounded-full transition-colors ${
                        passed ? "bg-brand-500" : "bg-ink-100"
                      } ${current ? "ring-2 ring-brand-200 ring-offset-1" : ""} group-hover:bg-brand-400`}
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Always-on action bar — primary cockpit */}
        <div className="px-5 py-3 border-b border-ink-200 bg-ink-50/40 flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => openQuickLog({ leadId: lead.id, initialMode: "call" })}
            className="btn-primary"
          >
            <Phone className="h-3.5 w-3.5" />
            Log call
          </button>
          <button
            type="button"
            onClick={() =>
              openQuickLog({ leadId: lead.id, initialMode: "email" })
            }
            className="btn-secondary"
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>
          <button
            type="button"
            onClick={() =>
              openQuickLog({ leadId: lead.id, initialMode: "note" })
            }
            className="btn-secondary"
          >
            <ScrollText className="h-3.5 w-3.5" />
            Note
          </button>
          <button
            type="button"
            onClick={() =>
              openQuickLog({ leadId: lead.id, initialMode: "task" })
            }
            className="btn-secondary"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Task
          </button>
          <button
            type="button"
            onClick={() => {
              store.scheduleNextTouch({
                leadId: lead.id,
                actorId: currentUserId,
                inDays: 1,
              });
              toast.success("Next touch scheduled · tomorrow");
            }}
            className="btn-secondary"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            +1d touch
          </button>
          <button
            type="button"
            onClick={() => {
              store.markBlocked({
                leadId: lead.id,
                actorId: currentUserId,
                kind: "no_response",
                label: "No response · escalating",
              });
              toast.warning("Marked blocked");
            }}
            className="btn-secondary text-warning-700 border-warning-200"
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            Block
          </button>
          <button
            type="button"
            onClick={() => {
              store.escalateDeal({
                leadId: lead.id,
                actorId: currentUserId,
                reason: lead.recommendedAction,
              });
              toast.success("Escalated to manager");
            }}
            className="btn-secondary text-danger-700 border-danger-200"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Escalate
          </button>
          <div className="ml-auto relative">
            <button
              type="button"
              onClick={() => setStageMenuOpen((v) => !v)}
              className="btn-secondary"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Move stage
              <ChevronDown className="h-3 w-3 -mr-0.5" />
            </button>
            {stageMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-ink-200 rounded-lg shadow-pop z-30 py-1">
                {stageOrder.concat({ id: "closed_lost", label: "Closed Lost", closed: "lost" }).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => moveStage(s.id)}
                    className={`w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-ink-50 ${
                      s.id === lead.stage ? "text-brand-700 font-semibold" : "text-ink-700"
                    }`}
                  >
                    {s.label}
                    {s.id === lead.stage && " · current"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => openAI(lead.id)}
            className="btn-primary bg-brand-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI
          </button>
        </div>

        {/* Active blockers banner — most credibility-bearing surface */}
        {lead.blockers.length > 0 && (
          <div className="px-5 py-2.5 bg-warning-50 border-b border-warning-100">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-4 w-4 text-warning-700 mt-0.5 shrink-0" />
              <div className="flex-1 text-[12.5px] text-warning-800">
                <span className="font-semibold">
                  Active {lead.blockers.length === 1 ? "blocker" : "blockers"}:
                </span>{" "}
                {lead.blockers.map((b, i) => (
                  <span key={b.id}>
                    {i > 0 && " · "}
                    <span className="font-semibold">{b.label}</span>{" "}
                    <span className="text-warning-700/80">
                      ({relativeTime(b.since)})
                    </span>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setTab("blockers")}
                className="text-[11px] font-semibold text-warning-700 hover:underline"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* Data issues banner */}
        {(lead.dataIssues.length > 0 || lead.duplicateOf) && (
          <div className="px-5 py-2 bg-ink-50/80 border-b border-ink-100 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Data issues:
            </span>
            <DataIssuePills lead={lead} max={5} />
            {lead.duplicateOf && (
              <button
                type="button"
                onClick={() => store.leadById(lead.duplicateOf!) && (() => {})()}
                className="text-[11.5px] text-warning-700 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Copy className="h-3 w-3" />
                Possible duplicate of {lead.duplicateOf}
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="px-5 border-b border-ink-200 overflow-x-auto">
          <div className="flex gap-1 -mb-px whitespace-nowrap">
            <TabBtn id="overview" tab={tab} onClick={() => setTab("overview")}>
              Overview
            </TabBtn>
            <TabBtn id="stakeholders" tab={tab} onClick={() => setTab("stakeholders")}>
              Stakeholders
              <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                {lead.stakeholders.length}
              </span>
            </TabBtn>
            <TabBtn id="blockers" tab={tab} onClick={() => setTab("blockers")}>
              Blockers
              {lead.blockers.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] bg-warning-100 text-warning-700 rounded-full px-1.5">
                  {lead.blockers.length}
                </span>
              )}
            </TabBtn>
            <TabBtn id="emails" tab={tab} onClick={() => setTab("emails")}>
              Emails
              {lead.unreadEmails > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] bg-brand-100 text-brand-700 rounded-full px-1.5">
                  {lead.unreadEmails}
                </span>
              )}
            </TabBtn>
            <TabBtn id="tasks" tab={tab} onClick={() => setTab("tasks")}>
              Tasks
              <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                {leadTasks.filter((t) => !t.done).length}
              </span>
            </TabBtn>
            <TabBtn id="comments" tab={tab} onClick={() => setTab("comments")}>
              Internal
              {comments.length > 0 && (
                <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                  {comments.length}
                </span>
              )}
            </TabBtn>
            <TabBtn id="files" tab={tab} onClick={() => setTab("files")}>
              Files
              <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                {attachments.length}
              </span>
            </TabBtn>
            <TabBtn id="history" tab={tab} onClick={() => setTab("history")}>
              History
            </TabBtn>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && <OverviewTab lead={lead} />}
          {tab === "stakeholders" && <StakeholdersTab lead={lead} />}
          {tab === "blockers" && <BlockersTab lead={lead} />}
          {tab === "emails" && <EmailsTab lead={lead} emails={emails} />}
          {tab === "tasks" && <TasksTab lead={lead} tasks={leadTasks} />}
          {tab === "comments" && (
            <CommentsTab lead={lead} comments={comments} />
          )}
          {tab === "files" && <FilesTab attachments={attachments} />}
          {tab === "history" && (
            <HistoryTab lead={lead} activities={leadActivities} />
          )}
        </div>
      </aside>
    </>
  );
}

function TabBtn({
  id,
  tab,
  onClick,
  children,
}: {
  id: Tab;
  tab: Tab;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-3 py-2 text-[12.5px] font-medium border-b-2 inline-flex items-center ${
        tab === id
          ? "border-brand-600 text-ink-900"
          : "border-transparent text-ink-500 hover:text-ink-800"
      }`}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="h-eyebrow">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function OverviewTab({ lead }: { lead: ReturnType<typeof useStore>["leads"][number] }) {
  const { openAI } = useAppState();
  return (
    <div className="p-5 space-y-5">
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
        <button
          type="button"
          onClick={() => openAI(lead.id)}
          className="mt-3 text-[11px] font-semibold text-brand-700 hover:underline"
        >
          Open full assistant →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Section title="Contact">
          <Row icon={Mail} label="Email" value={lead.email} mono />
          <Row icon={Phone} label="Phone" value={lead.phone} mono />
          <Row icon={Briefcase} label="Title" value={lead.title} />
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
                : "— (set one)"
            }
          />
          <Row icon={Tag} label="Source" value={lead.source} />
        </Section>
      </div>

      <Section title="Signal & scoring">
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

      <Section title="Notes">
        <p className="text-[13px] text-ink-700 leading-relaxed">{lead.notes}</p>
      </Section>

      <Section title="Tags">
        <div className="flex flex-wrap gap-1.5">
          {lead.tags.map((t) => (
            <span key={t} className="badge-neutral">
              {t}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

function StakeholdersTab({
  lead,
}: {
  lead: ReturnType<typeof useStore>["leads"][number];
}) {
  if (lead.stakeholders.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No stakeholders mapped yet"
          body="Identify champion, economic buyer, and any blockers — deals with mapped stakeholders close 1.7× faster."
        />
      </div>
    );
  }
  return (
    <div className="p-5 space-y-3">
      <div className="text-[12px] text-ink-500">
        {lead.stakeholders.length} stakeholders ·{" "}
        {lead.stakeholders.filter((s) => s.role === "Champion").length} champion
        ·{" "}
        {lead.stakeholders.filter((s) => s.role === "Economic Buyer").length} EB
      </div>
      <ul className="space-y-2">
        {lead.stakeholders.map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-ink-200 p-3 flex items-start gap-3"
          >
            <span
              className={`mt-1 h-2 w-2 rounded-full ${
                s.status === "engaged"
                  ? "bg-success-500"
                  : s.status === "warm"
                    ? "bg-warning-500"
                    : s.status === "blocking"
                      ? "bg-danger-500"
                      : s.status === "cold"
                        ? "bg-ink-400"
                        : "bg-ink-300"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13.5px] font-semibold text-ink-900">
                  {s.name}
                </span>
                <span className="text-[12px] text-ink-500">{s.title}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11.5px]">
                <Badge tone={s.role === "Champion" ? "success" : s.role === "Legal" || s.role === "Skeptic" ? "warning" : "neutral"}>
                  {s.role}
                </Badge>
                <span className="text-ink-500">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      s.status === "engaged"
                        ? "text-success-700"
                        : s.status === "warm"
                          ? "text-warning-700"
                          : s.status === "blocking"
                            ? "text-danger-700"
                            : "text-ink-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </span>
                {s.lastContactAt && (
                  <span className="text-ink-400">
                    · last contact {relativeTime(s.lastContactAt)}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn-secondary"
      >
        <Plus className="h-3.5 w-3.5" />
        Add stakeholder
      </button>
    </div>
  );
}

function BlockersTab({
  lead,
}: {
  lead: ReturnType<typeof useStore>["leads"][number];
}) {
  const { currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  if (lead.blockers.length === 0 && lead.dataIssues.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No active blockers"
          body="When friction shows up — legal review, no response, missing decision-maker — flag it here."
        />
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              store.markBlocked({
                leadId: lead.id,
                actorId: currentUserId,
                kind: "no_response",
                label: "No response · 5+ days",
              });
              toast.warning("Marked blocked");
            }}
            className="btn-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add blocker
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-5 space-y-4">
      {lead.blockers.length > 0 && (
        <div>
          <div className="h-eyebrow mb-2">Active blockers</div>
          <ul className="space-y-2">
            {lead.blockers.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-warning-200 bg-warning-50/40 p-3 flex items-start gap-3"
              >
                <AlertOctagon className="h-4 w-4 text-warning-700 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink-900">
                    {b.label}
                  </div>
                  {b.detail && (
                    <p className="text-[12px] text-ink-700 mt-0.5">
                      {b.detail}
                    </p>
                  )}
                  <div className="mt-1 text-[11px] text-ink-500">
                    Set by {repsById[b.setBy]?.name.split(" ")[0]} ·{" "}
                    {relativeTime(b.since)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    store.clearBlocker({
                      leadId: lead.id,
                      actorId: currentUserId,
                      blockerId: b.id,
                    });
                    toast.success("Blocker cleared");
                  }}
                  className="text-[11px] font-semibold text-success-700 hover:underline shrink-0"
                >
                  Clear
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lead.dataIssues.length > 0 && (
        <div>
          <div className="h-eyebrow mb-2">Data hygiene</div>
          <DataIssuePills lead={lead} max={10} />
        </div>
      )}
    </div>
  );
}

function EmailsTab({
  lead,
  emails,
}: {
  lead: ReturnType<typeof useStore>["leads"][number];
  emails: EmailMessage[];
}) {
  const { openAI } = useAppState();
  if (!emails || emails.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No email thread on file"
          body="Emails synced from your inbox will appear here in chronological reverse order."
        />
      </div>
    );
  }
  const sorted = [...emails].sort((a, b) => (a.at < b.at ? 1 : -1));
  return (
    <div className="p-5 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[12px] text-ink-500">
          {sorted.length} {sorted.length === 1 ? "message" : "messages"} ·{" "}
          {emails.filter((e) => e.unread).length} unread
        </div>
        <button
          type="button"
          onClick={() => openAI(lead.id)}
          className="text-[11.5px] font-semibold text-brand-700 inline-flex items-center gap-1 hover:underline"
        >
          <Sparkles className="h-3 w-3" />
          AI: draft reply
        </button>
      </div>
      <ul className="space-y-2">
        {sorted.map((e) => (
          <li
            key={e.id}
            className={`rounded-lg border p-3 ${
              e.unread
                ? "border-brand-200 bg-brand-50/30"
                : "border-ink-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
                    e.direction === "in"
                      ? "bg-success-50 text-success-700"
                      : "bg-ink-100 text-ink-700"
                  }`}
                >
                  {e.direction === "in" ? (
                    <MailOpen className="h-3.5 w-3.5" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-ink-900 truncate">
                    {e.subject}
                  </div>
                  <div className="text-[11px] text-ink-500 truncate">
                    {e.direction === "in" ? "From" : "To"}: {e.direction === "in" ? e.from : e.to}
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] text-ink-400 shrink-0">
                {relativeTime(e.at)}
                {e.unread && (
                  <span className="block badge-brand mt-0.5">Unread</span>
                )}
              </div>
            </div>
            <p className="mt-2 text-[12.5px] text-ink-700 leading-relaxed">
              {e.body}
            </p>
            {e.attachments && e.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {e.attachments.map((a) => (
                  <span
                    key={a.name}
                    className="inline-flex items-center gap-1.5 text-[11px] text-ink-700 border border-ink-200 rounded-md px-2 py-0.5"
                  >
                    <Paperclip className="h-3 w-3" />
                    {a.name}{" "}
                    <span className="text-ink-400">· {a.size}</span>
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TasksTab({
  lead,
  tasks,
}: {
  lead: ReturnType<typeof useStore>["leads"][number];
  tasks: ReturnType<typeof useStore>["tasks"];
}) {
  const { currentUserId, openQuickLog } = useAppState();
  const store = useStore();
  const toast = useToast();
  if (tasks.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No tasks for this deal"
          body="Tasks created here will sync to your day-of plan."
        />
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => openQuickLog({ leadId: lead.id, initialMode: "task" })}
            className="btn-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            New task
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-5">
      <ul className="space-y-2">
        {tasks.map((t) => {
          const overdue = !t.done && new Date(t.due).getTime() < Date.now();
          return (
            <li
              key={t.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-ink-200"
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => {
                  if (t.done) {
                    store.uncompleteTask({
                      taskId: t.id,
                      actorId: currentUserId,
                    });
                  } else {
                    store.completeTask({
                      taskId: t.id,
                      actorId: currentUserId,
                    });
                    toast.success(`Done: ${t.title}`);
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-ink-300 text-brand-600 cursor-pointer"
              />
              <div className="flex-1">
                <div
                  className={`text-[13px] font-medium ${
                    t.done ? "line-through text-ink-400" : "text-ink-900"
                  }`}
                >
                  {t.title}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                  <span
                    className={`${
                      overdue ? "text-danger-700 font-semibold" : "text-ink-500"
                    }`}
                  >
                    Due {relativeTime(t.due)}
                  </span>
                  {t.priority === "high" && (
                    <Badge tone="warning">High priority</Badge>
                  )}
                  {t.draftReady && (
                    <Badge tone="brand">
                      <Sparkles className="h-3 w-3" />
                      AI draft
                    </Badge>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => openQuickLog({ leadId: lead.id, initialMode: "task" })}
        className="mt-4 btn-secondary"
      >
        <Plus className="h-3.5 w-3.5" />
        New task
      </button>
    </div>
  );
}

function CommentsTab({
  lead,
  comments,
}: {
  lead: ReturnType<typeof useStore>["leads"][number];
  comments: ReturnType<typeof useStore>["internalComments"];
}) {
  const { currentUserId } = useAppState();
  const store = useStore();
  const [draft, setDraft] = useState("");
  const sorted = [...comments].sort((a, b) => (a.at < b.at ? 1 : -1));
  const submit = () => {
    if (!draft.trim()) return;
    store.addInternalComment({
      leadId: lead.id,
      authorId: currentUserId,
      body: draft.trim(),
    });
    setDraft("");
  };
  return (
    <div className="p-5 space-y-3">
      <div className="text-[12px] text-ink-500 inline-flex items-center gap-1.5">
        <MessageSquare className="h-3 w-3" />
        Internal-only · not visible to the prospect
      </div>
      {sorted.length === 0 && (
        <EmptyState
          title="No internal comments yet"
          body="Use this for team coordination — @mentions, deal context for handoffs, manager notes."
        />
      )}
      <ul className="space-y-3">
        {sorted.map((c) => {
          const author = repsById[c.authorId];
          return (
            <li key={c.id} className="flex items-start gap-2.5">
              <Avatar ownerId={author?.id} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-ink-900">
                    {author?.name ?? "Unknown"}
                  </span>
                  <span className="text-[11px] text-ink-400">
                    · {relativeTime(c.at)}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-ink-700 leading-relaxed">
                  {c.body.split(/(@\w+)/g).map((part, i) =>
                    part.startsWith("@") ? (
                      <span
                        key={i}
                        className="text-brand-700 font-semibold"
                      >
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    ),
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="rounded-lg border border-ink-200 p-2 mt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-500 mb-1.5">
          <AtSign className="h-3 w-3" />
          @mention a teammate (e.g. @jordan, @priya)
        </div>
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
          placeholder="Internal note for the team…"
          className="w-full text-[12.5px] resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] text-ink-400">⌘⏎ to post</span>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className="btn-primary text-[11.5px] py-1"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

function FilesTab({
  attachments,
}: {
  attachments: Attachment[];
}) {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No files on this deal"
          body="Drop in a proposal, MSA, deck, or RFP and it'll appear here."
        />
      </div>
    );
  }
  return (
    <div className="p-5 space-y-2">
      <ul className="divide-y divide-ink-100 border border-ink-200 rounded-lg overflow-hidden">
        {attachments.map((a) => {
          const author = repsById[a.uploadedBy];
          return (
            <li
              key={a.id}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-ink-50/40"
            >
              <span className="h-8 w-8 rounded-md bg-ink-100 flex items-center justify-center text-ink-600">
                <Paperclip className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-ink-900 truncate">
                  {a.name}
                </div>
                <div className="text-[11px] text-ink-500">
                  {a.size} · {a.kind} · uploaded by{" "}
                  {author?.name.split(" ")[0]} · {relativeTime(a.at)}
                </div>
              </div>
              <button
                type="button"
                className="text-ink-400 hover:text-ink-700"
                title="Open"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="btn-secondary mt-2">
        <Plus className="h-3.5 w-3.5" />
        Upload file
      </button>
    </div>
  );
}

function HistoryTab({
  lead,
  activities,
}: {
  lead: ReturnType<typeof useStore>["leads"][number];
  activities: ReturnType<typeof activityForLead>;
}) {
  const store = useStore();
  // Merge real-time activities from the store with the seeded history
  const liveExtra = store.activities.filter(
    (a) =>
      a.leadId === lead.id &&
      !activities.some((x) => x.id === a.id),
  );
  const merged = [...liveExtra, ...activities].sort((a, b) =>
    a.at < b.at ? 1 : -1,
  );
  return (
    <div className="p-5">
      <ol className="space-y-3.5 relative">
        {merged.map((a) => (
          <li
            key={a.id}
            className="relative pl-6 border-l-2 border-ink-100 ml-2 pb-2"
          >
            <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white" />
            <div className="text-[13px] font-medium text-ink-900">
              {a.summary}
            </div>
            {a.detail && (
              <p className="text-[12px] text-ink-500 mt-0.5">{a.detail}</p>
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
      <div className="mt-4 pt-3 border-t border-ink-100 text-[11px] text-ink-400 flex items-center gap-1.5">
        <Users className="h-3 w-3" />
        Audit trail · {merged.length} events · created{" "}
        {fmtDate(lead.createdAt)}
      </div>
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
