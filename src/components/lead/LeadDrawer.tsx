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
  Target,
  History,
  Eye,
  CircleHelp,
  CheckCircle2,
  Pin,
  Link2,
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
import { depthFor } from "../../data/depth2";
import { avgDaysInStage } from "../../data/benchmarks";
import { Avatar } from "../ui/Avatar";
import { Badge, RiskBadge } from "../ui/Badge";
import {
  DataIssuePills,
  DuplicatePill,
  EscalationPill,
} from "../signals/SignalPills";
import { AIHint, AILine } from "../ai/AIHint";
import type {
  EmailMessage,
  Attachment,
  Objection,
  ObjectionStatus,
  ScorecardEntry,
  StageHistoryEntry,
  IntentSignal,
  ManualOverride,
  Lead,
} from "../../data/types";
import { fmtDate, fmtMoneyFull, relativeTime } from "../../lib/format";

const stageOrder = STAGES.filter((s) => !s.closed || s.id === "closed_won");

type Tab =
  | "overview"
  | "scorecard"
  | "objections"
  | "stakeholders"
  | "blockers"
  | "intent"
  | "emails"
  | "tasks"
  | "comments"
  | "files"
  | "history";

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
  const depth = depthFor(lead.id);
  const openObjections = depth.objections.filter(
    (o) => o.status !== "answered" && o.status !== "deferred",
  );

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
              {/* Lived-in flags */}
              {depth.flags.includes("decision_maker_changed") && (
                <span className="badge-warning">Decision-maker changed</span>
              )}
              {depth.flags.includes("champion_ghosted") && (
                <span className="badge-danger">Champion ghosted</span>
              )}
              {depth.flags.includes("manually_advanced") && (
                <span className="badge-warning">Manually advanced</span>
              )}
              {depth.flags.includes("rep_handoff") && (
                <span className="badge-neutral">Rep handoff</span>
              )}
              {depth.flags.includes("legacy_migrated") && (
                <span
                  className="text-[10px] text-ink-400 font-mono"
                  title="Migrated from legacy CRM"
                >
                  legacy
                </span>
              )}
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
            <TabBtn id="scorecard" tab={tab} onClick={() => setTab("scorecard")}>
              Scorecard
              {depth.scorecard.length > 0 && (
                <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                  {depth.scorecard.filter((s) => s.value).length}/
                  {depth.scorecard.length}
                </span>
              )}
            </TabBtn>
            <TabBtn id="objections" tab={tab} onClick={() => setTab("objections")}>
              Objections
              {openObjections.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] bg-warning-100 text-warning-700 rounded-full px-1.5">
                  {openObjections.length} open
                </span>
              )}
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
            <TabBtn id="intent" tab={tab} onClick={() => setTab("intent")}>
              Intent
              {depth.intentSignals.length > 0 && (
                <span className="ml-1 text-[10px] text-ink-400 font-semibold">
                  {depth.intentSignals.length}
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
          {tab === "overview" && (
            <OverviewTab lead={lead} depth={depth} openObjections={openObjections} />
          )}
          {tab === "scorecard" && (
            <ScorecardTab lead={lead} entries={depth.scorecard} />
          )}
          {tab === "objections" && (
            <ObjectionsTab lead={lead} objections={depth.objections} />
          )}
          {tab === "stakeholders" && <StakeholdersTab lead={lead} />}
          {tab === "blockers" && <BlockersTab lead={lead} />}
          {tab === "intent" && (
            <IntentTab
              lead={lead}
              signals={depth.intentSignals}
              touchPattern={depth.recentTouchPattern}
              championEngagement={depth.championEngagement}
            />
          )}
          {tab === "emails" && <EmailsTab lead={lead} emails={emails} />}
          {tab === "tasks" && <TasksTab lead={lead} tasks={leadTasks} />}
          {tab === "comments" && (
            <CommentsTab lead={lead} comments={comments} />
          )}
          {tab === "files" && <FilesTab attachments={attachments} />}
          {tab === "history" && (
            <HistoryTab
              lead={lead}
              activities={leadActivities}
              stageHistory={depth.stageHistory}
              overrides={depth.manualOverrides}
            />
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

function OverviewTab({
  lead,
  depth,
  openObjections,
}: {
  lead: Lead;
  depth: ReturnType<typeof depthFor>;
  openObjections: Objection[];
}) {
  const { openAI, currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  const [draftNote, setDraftNote] = useState("");
  const currentStageEntered = depth.stageHistory.find(
    (h) => h.stage === lead.stage,
  );
  const daysInStage = currentStageEntered
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(currentStageEntered.enteredAt).getTime()) /
            86400000,
        ),
      )
    : null;
  const stageAvg = avgDaysInStage[lead.stage];
  const lastConfidenceOverride = depth.manualOverrides.find(
    (m) => m.field === "confidence",
  );
  const lastDateOverride = depth.manualOverrides.find(
    (m) => m.field === "close_date",
  );
  const lastStageOverride = depth.manualOverrides.find(
    (m) => m.field === "stage",
  );
  const lastOwnerOverride = depth.manualOverrides.find(
    (m) => m.field === "owner",
  );
  const pinnedNote = depth.fieldNotes.find((n) => n.pinned);

  return (
    <div className="p-5 space-y-5">
      {/* AI deal summary + ambient insights */}
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
        {depth.aiInsights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {depth.aiInsights.map((i) => (
              <li key={i.id} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                    i.weight === "high"
                      ? "bg-warning-500"
                      : i.weight === "medium"
                        ? "bg-brand-500"
                        : "bg-ink-300"
                  }`}
                />
                <span className="text-[12.5px] text-ink-800">{i.body}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => openAI(lead.id)}
          className="mt-3 text-[11px] font-semibold text-brand-700 hover:underline"
        >
          Open full assistant →
        </button>
      </div>

      {/* Pinned note (if any) — sloppy, lived-in, in the rep's voice */}
      {pinnedNote && (
        <div className="rounded-lg border border-warning-200 bg-warning-50/40 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Pin className="h-3.5 w-3.5 text-warning-700" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-warning-700">
              Pinned by {repsById[pinnedNote.by]?.name.split(" ")[0] ?? "owner"}
            </span>
            <span className="text-[10px] text-ink-400">
              · {relativeTime(pinnedNote.at)}
            </span>
          </div>
          <p className="text-[12.5px] text-ink-800 italic leading-relaxed">
            "{pinnedNote.body}"
          </p>
        </div>
      )}

      {/* Open objections — compact view */}
      {openObjections.length > 0 && (
        <Section
          title={`Open objections (${openObjections.length})`}
          right={
            <button
              type="button"
              onClick={() => openAI(lead.id)}
              className="text-[11px] text-brand-700 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <Sparkles className="h-3 w-3" />
              AI: prep responses
            </button>
          }
        >
          <ul className="space-y-1.5">
            {openObjections.slice(0, 3).map((o) => (
              <li
                key={o.id}
                className="flex items-start gap-2 p-2 rounded-md border border-ink-200 bg-white"
              >
                <CircleHelp className="h-3.5 w-3.5 text-warning-600 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-ink-900">
                    {o.topic}
                  </div>
                  <div className="text-[11px] text-ink-500">
                    {o.raisedBy} · {relativeTime(o.raisedAt)} ·{" "}
                    <ObjectionStatusPill status={o.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

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
            warn={!lead.nextTouchAt}
          />
          <Row icon={Tag} label="Source" value={lead.source} />
          {depth.conflictingSource && (
            <Row
              icon={AlertOctagon}
              label="Source conflict"
              value={depth.conflictingSource}
              warn
            />
          )}
          {depth.bestCallWindow && (
            <div className="mt-2">
              <AIHint weight="medium">
                Best call window: {depth.bestCallWindow}
              </AIHint>
            </div>
          )}
        </Section>
      </div>

      {/* Signal + scoring with ambient AI + override surfacing */}
      <Section title="Signal & scoring">
        <div className="grid grid-cols-3 gap-3">
          <Stat
            label="Urgency"
            value={String(lead.urgencyScore)}
            sub="Composite"
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
            sub={
              lastConfidenceOverride
                ? `Manual: ${lastConfidenceOverride.oldValue} → ${lastConfidenceOverride.newValue}`
                : "Win likelihood"
            }
            accent={
              lead.confidence >= 65
                ? "success"
                : lead.confidence >= 40
                  ? "neutral"
                  : "warning"
            }
            override={!!lastConfidenceOverride}
          />
          <Stat
            label="Time in stage"
            value={daysInStage !== null ? `${daysInStage}d` : "—"}
            sub={
              stageAvg
                ? `vs ${stageAvg}d avg`
                : "—"
            }
            accent={
              daysInStage !== null && stageAvg && daysInStage > stageAvg * 1.5
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

        {/* Manual override audit — surface that humans have touched this */}
        {(lastDateOverride || lastStageOverride || lastOwnerOverride) && (
          <ul className="mt-3 space-y-1 text-[11.5px]">
            {lastDateOverride && (
              <li className="flex items-center gap-1.5 text-ink-600">
                <History className="h-3 w-3 text-ink-400" />
                Close date manually moved{" "}
                <span className="font-semibold text-ink-800">
                  {lastDateOverride.oldValue} → {lastDateOverride.newValue}
                </span>{" "}
                by {repsById[lastDateOverride.by]?.name.split(" ")[0]} ·{" "}
                {relativeTime(lastDateOverride.at)}
              </li>
            )}
            {lastStageOverride && (
              <li className="flex items-center gap-1.5 text-ink-600">
                <History className="h-3 w-3 text-ink-400" />
                Stage manually advanced from{" "}
                <span className="font-semibold text-ink-800">
                  {lastStageOverride.oldValue} → {lastStageOverride.newValue}
                </span>{" "}
                by {repsById[lastStageOverride.by]?.name.split(" ")[0]} ·{" "}
                {relativeTime(lastStageOverride.at)}
              </li>
            )}
            {lastOwnerOverride && (
              <li className="flex items-center gap-1.5 text-ink-600">
                <History className="h-3 w-3 text-ink-400" />
                Reassigned from{" "}
                {repsById[lastOwnerOverride.oldValue]?.name.split(" ")[0] ??
                  "former owner"}{" "}
                by {repsById[lastOwnerOverride.by]?.name.split(" ")[0]} ·{" "}
                {relativeTime(lastOwnerOverride.at)}
              </li>
            )}
          </ul>
        )}

        {/* Linked deals */}
        {depth.linkedDeals && depth.linkedDeals.length > 0 && (
          <div className="mt-3 text-[11.5px] text-ink-600">
            <span className="inline-flex items-center gap-1">
              <Link2 className="h-3 w-3 text-ink-400" />
              Linked:
            </span>{" "}
            {depth.linkedDeals.map((d, i) => (
              <span key={d.id}>
                {i > 0 && ", "}
                <span className="font-semibold text-ink-800">{d.id}</span>{" "}
                <span className="text-ink-500">({d.relationship})</span>
              </span>
            ))}
          </div>
        )}

        {/* Legacy ID — migration trace */}
        {depth.legacyId && (
          <div className="mt-1 text-[11px] text-ink-400 font-mono">
            Migrated from HubSpot · legacy ID: {depth.legacyId}
          </div>
        )}
      </Section>

      <Section title="Field notes">
        {/* Original notes (from base lead) */}
        <p className="text-[13px] text-ink-700 leading-relaxed mb-3">
          {lead.notes}
        </p>

        {/* Sloppy field notes — the kind reps actually leave */}
        {depth.fieldNotes.length > 0 && (
          <ul className="space-y-2">
            {depth.fieldNotes
              .filter((n) => !n.pinned)
              .map((n) => (
                <li
                  key={n.id}
                  className="rounded-md border border-ink-200 bg-white p-2.5"
                >
                  <p className="text-[12.5px] text-ink-700 leading-relaxed italic">
                    "{n.body}"
                  </p>
                  <div className="mt-1 text-[10.5px] text-ink-400">
                    {repsById[n.by]?.name.split(" ")[0] ?? "rep"} ·{" "}
                    {relativeTime(n.at)}
                  </div>
                </li>
              ))}
          </ul>
        )}

        {/* Quick-add note inline */}
        <div className="mt-3 rounded-md border border-ink-200 p-2 bg-ink-50/40">
          <textarea
            rows={2}
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Add a quick note (typos welcome)…"
            className="w-full text-[12.5px] resize-none focus:outline-none bg-transparent"
          />
          <div className="flex items-center justify-end">
            <button
              type="button"
              disabled={!draftNote.trim()}
              onClick={() => {
                store.addNote({
                  leadId: lead.id,
                  actorId: currentUserId,
                  body: draftNote.trim(),
                });
                toast.success("Note saved");
                setDraftNote("");
              }}
              className="btn-primary text-[11.5px] py-1 px-2"
            >
              Save note
            </button>
          </div>
        </div>
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

function ObjectionStatusPill({ status }: { status: ObjectionStatus }) {
  const map: Record<
    ObjectionStatus,
    { label: string; cls: string }
  > = {
    open: { label: "Open", cls: "bg-warning-50 text-warning-700 ring-warning-100" },
    answered: {
      label: "Answered",
      cls: "bg-success-50 text-success-700 ring-success-100",
    },
    waiting_on_us: {
      label: "Waiting on us",
      cls: "bg-danger-50 text-danger-700 ring-danger-100",
    },
    waiting_on_them: {
      label: "Waiting on them",
      cls: "bg-ink-100 text-ink-600 ring-ink-200",
    },
    deferred: { label: "Deferred", cls: "bg-ink-100 text-ink-500 ring-ink-200" },
  };
  const c = map[status];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0 rounded-md ring-1 ring-inset text-[10.5px] font-semibold ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

function ScorecardTab({
  lead,
  entries,
}: {
  lead: Lead;
  entries: ScorecardEntry[];
}) {
  const { openAI } = useAppState();
  if (entries.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No scorecard yet"
          body="Use this section to map MEDDIC-style decision criteria as you discover them."
        />
      </div>
    );
  }
  const filled = entries.filter((e) => e.value).length;
  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between text-[12px] text-ink-500">
        <span>
          <span className="font-semibold text-ink-800">
            {filled}/{entries.length}
          </span>{" "}
          slots filled · partial scorecards are normal — fill as you learn
        </span>
        <button
          type="button"
          onClick={() => openAI(lead.id)}
          className="text-[11.5px] text-brand-700 font-semibold inline-flex items-center gap-1 hover:underline"
        >
          <Sparkles className="h-3 w-3" />
          AI: suggest discovery questions
        </button>
      </div>
      <ul className="space-y-1.5">
        {entries.map((e) => {
          const empty = !e.value;
          return (
            <li
              key={e.slot}
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                empty
                  ? "border-dashed border-ink-200 bg-ink-50/30"
                  : "border-ink-200 bg-white"
              }`}
            >
              <Target
                className={`h-4 w-4 mt-0.5 shrink-0 ${
                  empty ? "text-ink-300" : "text-brand-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-ink-900">
                    {e.slot}
                  </span>
                  {e.confidence && (
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 rounded ${
                        e.confidence === "high"
                          ? "bg-success-50 text-success-700"
                          : e.confidence === "medium"
                            ? "bg-warning-50 text-warning-700"
                            : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {e.confidence}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-0.5 text-[13px] leading-relaxed ${
                    empty ? "text-ink-400 italic" : "text-ink-700"
                  }`}
                >
                  {e.value ?? "Unknown — needs discovery"}
                </p>
              </div>
              {empty && (
                <button
                  type="button"
                  className="text-[11px] text-brand-700 font-semibold hover:underline shrink-0"
                >
                  Fill
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ObjectionsTab({
  lead,
  objections,
}: {
  lead: Lead;
  objections: Objection[];
}) {
  const { openAI } = useAppState();
  if (objections.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          title="No objections logged"
          body="When prospects raise pricing, security, timing, or competitive concerns — log them here so they don't slip."
        />
      </div>
    );
  }
  const open = objections.filter(
    (o) => o.status !== "answered" && o.status !== "deferred",
  );
  const closed = objections.filter(
    (o) => o.status === "answered" || o.status === "deferred",
  );
  return (
    <div className="p-5 space-y-4">
      {open.length > 0 && (
        <div>
          <div className="h-eyebrow mb-2 inline-flex items-center gap-1">
            Open ({open.length})
            <button
              type="button"
              onClick={() => openAI(lead.id)}
              className="ml-2 text-[11px] text-brand-700 font-semibold hover:underline normal-case tracking-normal inline-flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              AI: prep responses
            </button>
          </div>
          <ul className="space-y-2">
            {open.map((o) => (
              <ObjectionRow key={o.id} o={o} />
            ))}
          </ul>
        </div>
      )}
      {closed.length > 0 && (
        <div>
          <div className="h-eyebrow mb-2">
            Resolved ({closed.length})
          </div>
          <ul className="space-y-2">
            {closed.map((o) => (
              <ObjectionRow key={o.id} o={o} muted />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ObjectionRow({ o, muted }: { o: Objection; muted?: boolean }) {
  return (
    <li
      className={`rounded-lg border p-3 ${
        muted
          ? "border-ink-200 bg-ink-50/40 opacity-80"
          : "border-warning-200 bg-warning-50/30"
      }`}
    >
      <div className="flex items-start gap-2">
        <CircleHelp
          className={`h-4 w-4 mt-0.5 ${muted ? "text-ink-400" : "text-warning-700"}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[13px] font-semibold ${muted ? "text-ink-700" : "text-ink-900"}`}
            >
              {o.topic}
            </span>
            <ObjectionStatusPill status={o.status} />
          </div>
          {o.detail && (
            <p className="text-[12px] text-ink-700 mt-0.5">{o.detail}</p>
          )}
          {o.ownerNote && (
            <p className="text-[11.5px] text-ink-500 mt-1 italic">
              Owner note: {o.ownerNote}
            </p>
          )}
          <div className="mt-1 text-[11px] text-ink-400">
            Raised by {o.raisedBy} · {relativeTime(o.raisedAt)}
          </div>
        </div>
        {!muted && (
          <button
            type="button"
            className="text-[11px] font-semibold text-success-700 hover:underline shrink-0"
          >
            Mark answered
          </button>
        )}
      </div>
    </li>
  );
}

function IntentTab({
  signals,
  touchPattern,
  championEngagement,
}: {
  lead: Lead;
  signals: IntentSignal[];
  touchPattern?: number[];
  championEngagement?: number[];
}) {
  return (
    <div className="p-5 space-y-5">
      {/* Touch cadence sparkbars */}
      {touchPattern && (
        <Section
          title="Touch cadence · last 14 days"
          right={
            <AILine weight="medium">
              {touchPattern.reduce((a, b) => a + b, 0)} touches in window
            </AILine>
          }
        >
          <div className="flex items-end gap-1 h-10">
            {touchPattern.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-ink-200"
                style={{
                  height: `${Math.max(4, v * 18)}%`,
                  backgroundColor: v === 0 ? "#eef0f4" : "#3a62ee",
                }}
                title={`${v} touch${v === 1 ? "" : "es"} on day ${i - 13 < 0 ? `${i - 13}d` : "today"}`}
              />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10.5px] text-ink-400">
            <span>14d ago</span>
            <span>Today</span>
          </div>
        </Section>
      )}

      {/* Champion engagement trajectory */}
      {championEngagement && (
        <Section title="Champion engagement · last 6 weeks">
          <div className="flex items-end gap-1 h-10">
            {championEngagement.map((v, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${
                  v >= 7
                    ? "bg-success-500"
                    : v >= 4
                      ? "bg-warning-500"
                      : "bg-danger-500"
                }`}
                style={{ height: `${(v / 10) * 100}%` }}
                title={`Week ${i + 1}: ${v}/10`}
              />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10.5px] text-ink-400">
            <span>6 weeks ago</span>
            <span>This week ({championEngagement[championEngagement.length - 1]}/10)</span>
          </div>
        </Section>
      )}

      {/* Intent signals feed */}
      <Section title={`Intent signals (${signals.length})`}>
        {signals.length === 0 ? (
          <div className="text-[12px] text-ink-500 italic">
            No intent signals captured for this deal yet.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {signals
              .sort((a, b) => (a.at < b.at ? 1 : -1))
              .map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-ink-200 p-2.5 flex items-start gap-3"
                >
                  <Eye className="h-3.5 w-3.5 text-brand-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-ink-800">{s.detail}</div>
                    <div className="text-[10.5px] text-ink-400 mt-0.5">
                      {relativeTime(s.at)} · weight {s.weight}/10
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
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
  stageHistory,
  overrides,
}: {
  lead: Lead;
  activities: ReturnType<typeof activityForLead>;
  stageHistory: StageHistoryEntry[];
  overrides: ManualOverride[];
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
    <div className="p-5 space-y-5">
      {/* Stage progression with manual override flags */}
      {stageHistory.length > 0 && (
        <Section title="Stage progression">
          <ol className="space-y-1">
            {stageHistory.map((h, i) => {
              const next = stageHistory[i + 1];
              const inStageDays = next
                ? Math.floor(
                    (new Date(next.enteredAt).getTime() -
                      new Date(h.enteredAt).getTime()) /
                      86400000,
                  )
                : Math.floor(
                    (Date.now() - new Date(h.enteredAt).getTime()) / 86400000,
                  );
              const avg = avgDaysInStage[h.stage];
              const slow = avg && inStageDays > avg * 1.5;
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-md border border-ink-200 bg-white px-3 py-2"
                >
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${
                      h.manualOverride ? "text-warning-600" : "text-brand-600"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-ink-900">
                      {STAGES.find((s) => s.id === h.stage)?.label}
                      {h.manualOverride && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold text-warning-700 bg-warning-50 px-1 rounded">
                          Manual
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      Entered {fmtDate(h.enteredAt)} ·{" "}
                      {repsById[h.by]?.name.split(" ")[0] ?? h.by}
                      {h.note && ` · ${h.note}`}
                    </div>
                  </div>
                  <span
                    className={`text-[11.5px] font-semibold shrink-0 ${
                      slow ? "text-warning-700" : "text-ink-700"
                    }`}
                  >
                    {inStageDays}d{avg ? ` (avg ${avg}d)` : ""}
                  </span>
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {/* Manual overrides — visible audit */}
      {overrides.length > 0 && (
        <Section title={`Manual overrides (${overrides.length})`}>
          <ul className="space-y-1.5">
            {overrides.map((o) => (
              <li
                key={o.id}
                className="flex items-start gap-2 rounded-md border border-ink-200 bg-warning-50/30 px-3 py-2"
              >
                <History className="h-3.5 w-3.5 text-warning-600 mt-0.5" />
                <div className="flex-1 min-w-0 text-[12px]">
                  <div className="text-ink-800">
                    <span className="font-semibold capitalize">
                      {o.field.replace("_", " ")}
                    </span>
                    : <span className="text-ink-500">{o.oldValue}</span>{" "}
                    →{" "}
                    <span className="font-semibold text-ink-900">
                      {o.newValue}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-500">
                    {repsById[o.by]?.name.split(" ")[0]} ·{" "}
                    {relativeTime(o.at)}
                    {o.note && ` · ${o.note}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`Activity log (${merged.length})`}>
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
      </Section>

      <div className="pt-3 border-t border-ink-100 text-[11px] text-ink-400 flex items-center gap-1.5">
        <Users className="h-3 w-3" />
        Audit trail · {merged.length} activity events · {overrides.length}{" "}
        manual overrides · created {fmtDate(lead.createdAt)}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
  warn,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  mono?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[12.5px] py-1">
      <Icon
        className={`h-3.5 w-3.5 mt-0.5 ${warn ? "text-warning-600" : "text-ink-400"}`}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`text-[11px] leading-tight ${warn ? "text-warning-700" : "text-ink-400"}`}
        >
          {label}
        </div>
        <div
          className={`${mono ? "font-mono text-[12.5px]" : ""} ${warn ? "text-warning-800" : "text-ink-800"} truncate`}
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
  override,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "neutral" | "warning" | "danger" | "success";
  override?: boolean;
}) {
  const accentClass: Record<typeof accent, string> = {
    neutral: "bg-ink-50 text-ink-800",
    warning: "bg-warning-50 text-warning-700",
    danger: "bg-danger-50 text-danger-700",
    success: "bg-success-50 text-success-700",
  } as const;
  return (
    <div className="rounded-lg border border-ink-200 p-3 bg-white relative">
      <div className="h-eyebrow flex items-center gap-1">
        {label}
        {override && (
          <span
            title="Manually overridden"
            className="text-[9px] uppercase tracking-wider font-bold text-warning-600 bg-warning-50 px-1 rounded"
          >
            ovr
          </span>
        )}
      </div>
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
