import { useMemo, useState } from "react";
import {
  Phone,
  Mail,
  CheckSquare,
  Sparkles,
  Send,
  Edit3,
  Wand2,
  Clock,
  Check,
  X,
  Flame,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  PhoneIncoming,
  MailOpen,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { useStore } from "../../state/DataStore";
import { useToast } from "../../state/Toaster";
import { Card, CardHeader } from "../ui/Card";
import { fmtMoney, relativeTime } from "../../lib/format";
import {
  BlockerPills,
  UnreadEmailPill,
} from "../signals/SignalPills";
import { depthFor } from "../../data/depth2";
import { AILine } from "../ai/AIHint";
import { emailThreadsByLead } from "../../data/depth";
import type { Task, Lead } from "../../data/types";

// Inline AI draft for a task (e.g. "Send pricing follow-up...")
function draftFor(task: Task, lead: Lead | undefined) {
  if (!lead) return "";
  return [
    `Subject: ${task.title.replace(/^send /i, "").replace(/^reply to /i, "Re: ")} · ${lead.company}`,
    "",
    `Hi ${lead.name.split(" ")[0]},`,
    "",
    task.title.toLowerCase().includes("cfo")
      ? `Wanted to send over the ROI evidence Hannah asked about — attached is a one-pager covering payback period for two comparable customers. Both saw return inside 9 months.`
      : task.title.toLowerCase().includes("re-engage")
        ? `It's been a few days since I last reached out — wanted to make sure my note didn't get buried. Still very interested in helping ${lead.company} on what we discussed at the summit.`
        : task.title.toLowerCase().includes("champion")
          ? `Quick ask — for us to operationalize this beyond the exec sponsor level, who would you nominate as the day-to-day champion? Happy to walk them through the workflows so you don't have to repeat it.`
          : `Following up on where we left things — wanted to keep this moving on the timeline you mentioned.`,
    "",
    `Open to a 15-min slot Thursday or Friday afternoon if useful.`,
    "",
    "Best,",
    "Morgan",
  ].join("\n");
}

export function RepTodayView() {
  const { currentUser, currentUserId, openLead, openAI, openQuickLog } =
    useAppState();
  const store = useStore();
  const toast = useToast();

  const now = Date.now();

  const myLeads = useMemo(
    () =>
      store.leads.filter(
        (l) =>
          l.ownerId === currentUserId &&
          l.stage !== "closed_won" &&
          l.stage !== "closed_lost",
      ),
    [store.leads, currentUserId],
  );

  const myTasks = useMemo(
    () =>
      store.tasks
        .filter((t) => t.ownerId === currentUserId && !t.done)
        .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()),
    [store.tasks, currentUserId],
  );

  const overdueTasks = myTasks.filter((t) => new Date(t.due).getTime() < now);
  const todayTasks = myTasks.filter((t) => {
    const d = new Date(t.due);
    const today = new Date(now);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate() &&
      new Date(t.due).getTime() >= now
    );
  });
  const upcomingTasks = myTasks.filter((t) => {
    const d = new Date(t.due).getTime();
    return d > now && !todayTasks.includes(t);
  });

  // Top 3 to move = highest urgency open deals
  const topThree = useMemo(
    () => [...myLeads].sort((a, b) => b.urgencyScore - a.urgencyScore).slice(0, 3),
    [myLeads],
  );

  // Drafts ready = tasks with draftReady flag
  const draftsReady = myTasks.filter((t) => t.draftReady && !t.done);

  // Inbound replies awaiting (unread emails on my leads)
  const inboundReplies = myLeads.filter((l) => l.unreadEmails > 0);

  // Call queue = open leads where recommended action starts with "Call"
  const callQueue = useMemo(
    () =>
      myLeads
        .filter((l) =>
          l.recommendedAction.toLowerCase().startsWith("call"),
        )
        .sort((a, b) => b.urgencyScore - a.urgencyScore)
        .slice(0, 5),
    [myLeads],
  );

  // Quick stats — small strip, not the headline
  const totalPipeline = myLeads.reduce((s, l) => s + l.value, 0);
  const closingSoon = myLeads
    .filter(
      (l) =>
        new Date(l.closeDate).getTime() - now <= 30 * 86400000 &&
        new Date(l.closeDate).getTime() - now >= 0,
    )
    .reduce((s, l) => s + l.value, 0);
  const stalledCount = myLeads.filter((l) => l.daysInactive >= 5).length;

  return (
    <div className="space-y-5">
      {/* Page header — execution framing */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[12px] text-ink-500 inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
            Live · {currentUser.name.split(" ")[0]}'s desk · Tuesday afternoon
          </div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Your day, not your dashboard
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            <span className="font-semibold text-ink-700">
              {overdueTasks.length}
            </span>{" "}
            overdue ·{" "}
            <span className="font-semibold text-ink-700">
              {todayTasks.length}
            </span>{" "}
            due today ·{" "}
            <span className="font-semibold text-ink-700">
              {inboundReplies.length}
            </span>{" "}
            inbound waiting · ~{Math.max(15, overdueTasks.length * 5 + todayTasks.length * 4)} min focus block
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openQuickLog({ initialMode: "call" })}
            className="btn-secondary"
          >
            <Phone className="h-3.5 w-3.5" />
            Log call
          </button>
          <button
            type="button"
            onClick={() => openQuickLog({ initialMode: "note" })}
            className="btn-secondary"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Quick note
          </button>
          <button
            type="button"
            onClick={() => openAI(null)}
            className="btn-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Plan my day
          </button>
        </div>
      </div>

      {/* Top 3 to move today — the headline focus card */}
      <Card className="border-brand-200">
        <CardHeader
          eyebrow="Top 3 to move today"
          title="If you do nothing else, do these"
          description="Each card has a one-tap recommended action and an inline AI draft when relevant."
          right={
            <span className="badge-brand">
              <Flame className="h-3 w-3" />
              ~$
              {Math.round(
                topThree.reduce((s, l) => s + l.value, 0) / 1000,
              )}
              k at stake
            </span>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {topThree.map((l, idx) => (
            <FocusCard key={l.id} lead={l} rank={idx + 1} />
          ))}
        </div>
      </Card>

      {/* Drafts ready + Inbound replies */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            eyebrow="Drafts ready"
            title="AI prepared these — review and send"
            description="Each draft is grounded in the deal's history. Send, edit, or regenerate."
          />
          {draftsReady.length === 0 ? (
            <EmptyMini body="No drafts queued. Open the AI assistant on a lead to generate one." />
          ) : (
            <ul className="space-y-2">
              {draftsReady.map((t) => {
                const lead = store.leadById(t.leadId);
                return (
                  <DraftRow
                    key={t.id}
                    task={t}
                    lead={lead}
                    onSend={() => {
                      if (!lead) return;
                      store.logEmail({
                        leadId: lead.id,
                        actorId: currentUserId,
                        subject: `Re: ${lead.company}`,
                      });
                      store.completeTask({
                        taskId: t.id,
                        actorId: currentUserId,
                      });
                      toast.success(`Sent · marked task done · ${lead.company}`);
                    }}
                    onOpen={() => lead && openLead(lead.id)}
                    onAI={() => lead && openAI(lead.id)}
                  />
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            eyebrow="Inbound waiting"
            title="Replies that haven't been answered"
            description="Reps who reply within an hour win 2× more often."
          />
          {inboundReplies.length === 0 ? (
            <EmptyMini body="Inbox is clear. No prospects waiting on a reply." />
          ) : (
            <ul className="space-y-1.5">
              {inboundReplies.slice(0, 4).map((l) => {
                const thread = emailThreadsByLead[l.id] ?? [];
                const lastIn = thread
                  .filter((m) => m.direction === "in")
                  .sort((a, b) => (a.at < b.at ? 1 : -1))[0];
                return (
                  <li
                    key={l.id}
                    className="rounded-lg border border-ink-200 hover:border-brand-300 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => openLead(l.id)}
                      className="w-full p-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <MailOpen className="h-3.5 w-3.5 text-success-600 shrink-0" />
                            <span className="text-[13px] font-semibold text-ink-900 truncate">
                              {l.name}
                            </span>
                            <span className="text-[12px] text-ink-500 truncate">
                              · {l.company}
                            </span>
                            <UnreadEmailPill lead={l} />
                          </div>
                          {lastIn && (
                            <div className="mt-1 text-[12px] text-ink-700 line-clamp-2">
                              "{lastIn.body}"
                            </div>
                          )}
                          <div className="mt-1 text-[11px] text-ink-400">
                            {lastIn ? relativeTime(lastIn.at) : "—"} · {fmtMoney(l.value)}
                          </div>
                        </div>
                      </div>
                      <div
                        className="mt-2 flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openAI(l.id)}
                          className="text-[11px] font-semibold text-brand-700 inline-flex items-center gap-1 hover:underline"
                        >
                          <Sparkles className="h-3 w-3" />
                          Draft reply with AI
                        </button>
                        <span className="text-ink-300">·</span>
                        <button
                          type="button"
                          onClick={() =>
                            openQuickLog({
                              leadId: l.id,
                              initialMode: "email",
                            })
                          }
                          className="text-[11px] font-medium text-ink-600 hover:underline"
                        >
                          Log reply
                        </button>
                        <span className="text-ink-300">·</span>
                        <button
                          type="button"
                          onClick={() => {
                            store.markEmailsRead(l.id);
                            toast.info("Marked as read");
                          }}
                          className="text-[11px] font-medium text-ink-600 hover:underline"
                        >
                          Mark read
                        </button>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Call queue + Task list */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Call queue */}
        <Card>
          <CardHeader
            eyebrow="Call queue"
            title="Tap to log outcome"
            description={`${callQueue.length} prospects to reach today.`}
          />
          {callQueue.length === 0 ? (
            <EmptyMini body="No calls in the queue." />
          ) : (
            <ul className="space-y-1.5">
              {callQueue.map((l) => (
                <CallQueueRow key={l.id} lead={l} />
              ))}
            </ul>
          )}
        </Card>

        {/* Today + overdue tasks */}
        <div className="xl:col-span-2 space-y-5">
          <Card pad={false}>
            <div className="px-5 pt-5">
              <CardHeader
                eyebrow="Today's tasks"
                title="Knock these out"
                description="Check off as you go. Click any task to open the lead in context."
                right={
                  <span className="text-[12px] text-ink-500">
                    <span className="font-semibold text-ink-800">
                      {todayTasks.length + overdueTasks.length}
                    </span>{" "}
                    total · {overdueTasks.length} overdue
                  </span>
                }
              />
            </div>
            <ul className="divide-y divide-ink-100">
              {[...overdueTasks, ...todayTasks].slice(0, 6).map((t) => (
                <TaskRow key={t.id} task={t} overdue={new Date(t.due).getTime() < now} />
              ))}
              {overdueTasks.length === 0 && todayTasks.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-ink-500">
                  Nothing on deck for today.
                </li>
              )}
            </ul>
            {upcomingTasks.length > 0 && (
              <UpcomingDisclosure tasks={upcomingTasks.slice(0, 6)} />
            )}
          </Card>
        </div>
      </div>

      {/* Compact KPI strip — info, not headline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="My pipeline" value={fmtMoney(totalPipeline)} sub={`${myLeads.length} open`} />
        <MiniStat label="Closing 30d" value={fmtMoney(closingSoon)} sub="Best case" />
        <MiniStat
          label="Stalled"
          value={String(stalledCount)}
          sub="5+ days quiet"
          tone={stalledCount > 2 ? "warning" : "neutral"}
        />
        <MiniStat
          label="Drafts ready"
          value={String(draftsReady.length)}
          sub="Sitting in your queue"
          tone={draftsReady.length > 0 ? "brand" : "neutral"}
        />
      </div>
    </div>
  );
}

function FocusCard({ lead, rank }: { lead: Lead; rank: number }) {
  const { openLead, openAI, currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  const insight = depthFor(lead.id).aiInsights[0];
  return (
    <button
      type="button"
      onClick={() => openLead(lead.id)}
      className="rounded-xl border border-brand-200 bg-gradient-to-b from-brand-50/40 to-white p-3 text-left hover:shadow-card transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-1.5 rounded">
            #{rank}
          </span>
          <span className="text-[10px] text-ink-500 font-semibold uppercase tracking-wider">
            urgency {lead.urgencyScore}
          </span>
        </div>
        <span className="text-[13px] font-bold text-ink-900">
          {fmtMoney(lead.value)}
        </span>
      </div>
      <div className="mt-2 text-sm font-semibold text-ink-900 truncate">
        {lead.name}
      </div>
      <div className="text-[12px] text-ink-500 truncate">{lead.company}</div>
      {lead.blockers.length > 0 && (
        <div className="mt-1.5">
          <BlockerPills lead={lead} max={1} size="xs" />
        </div>
      )}
      {insight && (
        <div className="mt-1.5">
          <AILine weight={insight.weight}>{insight.body}</AILine>
        </div>
      )}
      <div className="mt-2 rounded-md bg-ink-50/60 border border-ink-200 p-2 text-[12px] text-ink-700">
        <span className="font-semibold text-ink-900">Do this:</span>{" "}
        {lead.recommendedAction}
      </div>
      <div
        className="mt-2 grid grid-cols-2 gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            // Recommended-action shortcut — treat as send + advance
            store.logEmail({
              leadId: lead.id,
              actorId: currentUserId,
              subject: `Following up · ${lead.company}`,
            });
            store.scheduleNextTouch({
              leadId: lead.id,
              actorId: currentUserId,
              inDays: 2,
            });
            toast.success(`Touch logged · ${lead.company}`);
          }}
          className="btn-primary justify-center"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Do it
        </button>
        <button
          type="button"
          onClick={() => openAI(lead.id)}
          className="btn-secondary justify-center text-brand-700 border-brand-200"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Help draft
        </button>
      </div>
    </button>
  );
}

function DraftRow({
  task,
  lead,
  onSend,
  onOpen,
  onAI,
}: {
  task: Task;
  lead: Lead | undefined;
  onSend: () => void;
  onOpen: () => void;
  onAI: () => void;
}) {
  const [open, setOpen] = useState(false);
  const draft = useMemo(() => draftFor(task, lead), [task, lead]);
  return (
    <li className="rounded-lg border border-ink-200">
      <div className="px-3 py-2.5 flex items-start gap-2.5">
        <span className="mt-0.5 h-7 w-7 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-medium text-ink-900">
              {task.title}
            </span>
            <span className="badge-brand">AI draft</span>
          </div>
          {lead && (
            <div className="text-[11.5px] text-ink-500 mt-0.5">
              {lead.company} · {fmtMoney(lead.value)} · due {relativeTime(task.due)}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] text-ink-500 inline-flex items-center gap-0.5"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          {open ? "Hide" : "Preview"}
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3">
          <pre className="whitespace-pre-wrap text-[12.5px] text-ink-800 leading-relaxed bg-ink-50/40 border border-ink-200 rounded-md p-3 max-h-64 overflow-y-auto font-sans">
            {draft}
          </pre>
        </div>
      )}
      <div className="px-3 pb-3 flex items-center gap-1.5">
        <button type="button" onClick={onSend} className="btn-primary">
          <Send className="h-3.5 w-3.5" />
          Send
        </button>
        <button type="button" onClick={onOpen} className="btn-secondary">
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onAI}
          className="btn-secondary text-brand-700 border-brand-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Regenerate
        </button>
      </div>
    </li>
  );
}

function CallQueueRow({ lead }: { lead: Lead }) {
  const { openLead, currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();
  const [logging, setLogging] = useState(false);
  return (
    <li className="rounded-lg border border-ink-200">
      <button
        type="button"
        onClick={() => openLead(lead.id)}
        className="w-full p-2.5 text-left flex items-start gap-2.5"
      >
        <span className="mt-0.5 h-7 w-7 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
          <PhoneIncoming className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink-900 truncate">
            {lead.name}{" "}
            <span className="font-normal text-ink-500">· {lead.company}</span>
          </div>
          <div className="text-[11.5px] text-ink-500 truncate">
            {lead.phone} · {fmtMoney(lead.value)} · {lead.daysInactive}d quiet
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLogging((v) => !v);
          }}
          className="text-[11px] text-brand-700 font-semibold hover:underline"
        >
          {logging ? "Cancel" : "Log outcome"}
        </button>
      </button>
      {logging && (
        <div className="px-2.5 pb-2.5 grid grid-cols-2 gap-1">
          {[
            "Voicemail",
            "Reached, talked",
            "Confirmed budget",
            "Needs follow-up",
          ].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                store.logCall({
                  leadId: lead.id,
                  actorId: currentUserId,
                  durationMin:
                    o === "Voicemail" ? 1 : o === "Reached, talked" ? 18 : 10,
                  outcome: o,
                });
                toast.success(`${o} · ${lead.company}`);
                setLogging(false);
              }}
              className="text-[11.5px] py-1 px-2 rounded border border-ink-200 hover:bg-brand-50 text-ink-800"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

function TaskRow({ task, overdue }: { task: Task; overdue: boolean }) {
  const { currentUserId, openLead, openAI } = useAppState();
  const store = useStore();
  const toast = useToast();
  const lead = store.leadById(task.leadId);
  const [showDraft, setShowDraft] = useState(false);
  const draft = useMemo(() => draftFor(task, lead), [task, lead]);

  const Icon =
    task.kind === "call"
      ? Phone
      : task.kind === "meeting"
        ? Clock
        : task.kind === "email"
          ? Mail
          : CheckSquare;

  return (
    <li className="px-5 py-3 flex items-start gap-3 hover:bg-ink-50/40 group">
      <button
        type="button"
        onClick={() => {
          store.completeTask({ taskId: task.id, actorId: currentUserId });
          toast.success(`Done: ${task.title}`);
        }}
        className="mt-1 h-4 w-4 rounded border border-ink-300 text-brand-600 hover:border-brand-500 inline-flex items-center justify-center"
      >
        <Check className="h-3 w-3 opacity-0 group-hover:opacity-50" />
      </button>
      <span
        className={`mt-0.5 h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
          task.kind === "call"
            ? "bg-brand-50 text-brand-700"
            : "bg-ink-100 text-ink-700"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={() => lead && openLead(lead.id)}
          className="text-[13px] font-medium text-ink-900 text-left hover:underline"
        >
          {task.title}
        </button>
        <div className="mt-0.5 flex items-center gap-2 text-[11.5px]">
          {lead && (
            <>
              <span className="text-ink-500">{lead.company}</span>
              <span className="text-ink-300">·</span>
              <span className="text-ink-500">{fmtMoney(lead.value)}</span>
              <span className="text-ink-300">·</span>
            </>
          )}
          <span
            className={`${
              overdue ? "text-danger-700 font-semibold" : "text-ink-500"
            }`}
          >
            {overdue ? "Overdue" : `Due ${relativeTime(task.due)}`}
          </span>
          {task.priority === "high" && (
            <>
              <span className="text-ink-300">·</span>
              <span className="text-warning-700 font-semibold">High priority</span>
            </>
          )}
          {task.draftReady && (
            <>
              <span className="text-ink-300">·</span>
              <button
                type="button"
                onClick={() => setShowDraft((v) => !v)}
                className="text-brand-700 font-semibold inline-flex items-center gap-0.5 hover:underline"
              >
                <Sparkles className="h-3 w-3" />
                {showDraft ? "Hide draft" : "Show AI draft"}
              </button>
            </>
          )}
        </div>
        {showDraft && task.draftReady && (
          <div className="mt-2 rounded-md bg-ink-50/40 border border-ink-200 p-3 text-[12.5px] text-ink-800 whitespace-pre-wrap leading-relaxed font-sans max-h-56 overflow-y-auto">
            {draft}
          </div>
        )}
      </div>
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {task.draftReady && (
          <button
            type="button"
            onClick={() => {
              if (!lead) return;
              store.logEmail({
                leadId: lead.id,
                actorId: currentUserId,
                subject: `Re: ${lead.company}`,
              });
              store.completeTask({
                taskId: task.id,
                actorId: currentUserId,
              });
              toast.success("Sent + task done");
            }}
            className="btn-primary text-[11.5px] py-1 px-2"
          >
            <Send className="h-3 w-3" />
            Send
          </button>
        )}
        <button
          type="button"
          onClick={() => lead && openAI(lead.id)}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-brand-50 text-brand-600"
          title="AI assist"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            store.uncompleteTask({ taskId: task.id, actorId: currentUserId });
            toast.info("Skipped for now");
          }}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
          title="Skip"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function UpcomingDisclosure({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-ink-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-2.5 text-left text-[12px] font-medium text-ink-500 hover:bg-ink-50/40 inline-flex items-center gap-1"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Upcoming ({tasks.length})
      </button>
      {open && (
        <ul className="divide-y divide-ink-100">
          {tasks.map((t) => (
            <li key={t.id} className="px-5 py-2 flex items-center gap-2 text-[12.5px]">
              <CheckSquare className="h-3 w-3 text-ink-400" />
              <span className="truncate">{t.title}</span>
              <span className="ml-auto text-[11px] text-ink-500">
                {relativeTime(t.due)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "neutral" | "warning" | "brand";
}) {
  const ring =
    tone === "warning"
      ? "ring-warning-200 bg-warning-50/30"
      : tone === "brand"
        ? "ring-brand-200 bg-brand-50/30"
        : "ring-ink-200 bg-white";
  return (
    <div className={`rounded-lg ring-1 ring-inset px-3 py-2.5 ${ring}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </div>
      <div className="text-base font-semibold text-ink-900 mt-0.5">{value}</div>
      <div className="text-[11px] text-ink-500">{sub}</div>
    </div>
  );
}

function EmptyMini({ body }: { body: string }) {
  return (
    <div className="text-center py-6 px-3 border border-dashed border-ink-200 rounded-lg text-[12px] text-ink-500">
      {body}
    </div>
  );
}
