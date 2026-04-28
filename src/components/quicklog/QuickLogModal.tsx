import { useEffect, useMemo, useState } from "react";
import {
  X,
  Phone,
  Mail,
  StickyNote,
  CheckSquare,
  Search,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { useStore } from "../../state/DataStore";
import { useToast } from "../../state/Toaster";
import { Avatar } from "../ui/Avatar";
import { fmtMoney } from "../../lib/format";

type Mode = "call" | "email" | "note" | "task";

const tabs: { id: Mode; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; tone: string }[] = [
  { id: "call", label: "Log call", Icon: Phone, tone: "text-brand-700" },
  { id: "email", label: "Log email", Icon: Mail, tone: "text-ink-700" },
  { id: "note", label: "Add note", Icon: StickyNote, tone: "text-ink-700" },
  { id: "task", label: "New task", Icon: CheckSquare, tone: "text-success-700" },
];

const callOutcomes = [
  "Discovery — moving forward",
  "Voicemail · left message",
  "Reached, asked to follow up later",
  "Confirmed budget",
  "Qualified out",
  "Champion engaged",
];

export function QuickLogModal() {
  const { quickLog, closeQuickLog, currentUserId } = useAppState();
  const store = useStore();
  const toast = useToast();

  const [mode, setMode] = useState<Mode>(quickLog.initialMode ?? "note");
  const [leadId, setLeadId] = useState<string | null>(quickLog.leadId ?? null);
  const [query, setQuery] = useState("");

  // Form fields (per-mode)
  const [callDuration, setCallDuration] = useState(15);
  const [callOutcome, setCallOutcome] = useState(callOutcomes[0]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskKind, setTaskKind] = useState<"call" | "email" | "meeting" | "follow_up" | "review">("follow_up");
  const [taskDueDays, setTaskDueDays] = useState(1);
  const [taskPriority, setTaskPriority] = useState<"normal" | "high">("normal");

  // Reset state on open
  useEffect(() => {
    if (!quickLog.open) return;
    setMode(quickLog.initialMode ?? "note");
    setLeadId(quickLog.leadId ?? null);
    setQuery("");
    setCallDuration(15);
    setCallOutcome(callOutcomes[0]);
    setEmailSubject("");
    setEmailBody("");
    setNoteBody("");
    setTaskTitle("");
    setTaskDueDays(1);
    setTaskPriority("normal");
  }, [quickLog.open, quickLog.initialMode, quickLog.leadId]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuickLog();
    };
    if (quickLog.open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickLog.open, closeQuickLog]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.leads
      .filter((l) => l.stage !== "closed_won" && l.stage !== "closed_lost")
      .filter((l) =>
        q
          ? `${l.name} ${l.company} ${l.id}`.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 6);
  }, [query, store.leads]);

  const lead = leadId ? store.leadById(leadId) : undefined;

  if (!quickLog.open) return null;

  const submit = () => {
    if (!lead) return;
    if (mode === "call") {
      store.logCall({
        leadId: lead.id,
        actorId: currentUserId,
        durationMin: callDuration,
        outcome: callOutcome,
      });
      toast.success(`Logged ${callDuration}-min call · ${lead.company}`);
    } else if (mode === "email") {
      const subject = emailSubject.trim() || `Following up · ${lead.company}`;
      store.logEmail({
        leadId: lead.id,
        actorId: currentUserId,
        subject,
        body: emailBody,
      });
      toast.success(`Email logged · ${lead.company}`);
    } else if (mode === "note") {
      const body = noteBody.trim();
      if (!body) {
        toast.warning("Note can't be empty");
        return;
      }
      store.addNote({ leadId: lead.id, actorId: currentUserId, body });
      toast.success(`Note saved · ${lead.company}`);
    } else if (mode === "task") {
      const title = taskTitle.trim();
      if (!title) {
        toast.warning("Task title required");
        return;
      }
      store.addTask({
        leadId: lead.id,
        actorId: currentUserId,
        title,
        kind: taskKind,
        dueInDays: taskDueDays,
        priority: taskPriority,
      });
      toast.success(`Task created · due in ${taskDueDays}d`);
    }
    closeQuickLog();
  };

  return (
    <>
      <div
        onClick={closeQuickLog}
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-50"
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-pop border border-ink-200 pointer-events-auto overflow-hidden">
          {/* Tabs */}
          <div className="px-3 pt-3 pb-2 border-b border-ink-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {tabs.map(({ id, label, Icon, tone }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`px-2.5 py-1.5 rounded-md text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                    mode === id
                      ? `bg-ink-900 text-white`
                      : `${tone} hover:bg-ink-100`
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={closeQuickLog}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Lead picker */}
          <div className="px-4 py-3 border-b border-ink-100">
            <div className="h-eyebrow mb-1.5">Deal</div>
            {lead ? (
              <button
                type="button"
                onClick={() => setLeadId(null)}
                className="w-full flex items-center gap-2.5 p-2 rounded-md border border-ink-200 hover:border-brand-300 text-left"
              >
                <Avatar ownerId={lead.ownerId} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink-900 truncate">
                    {lead.name}{" "}
                    <span className="text-ink-400 font-normal">
                      · {lead.company}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-ink-500">
                    {fmtMoney(lead.value)} · {lead.stage.replace("_", " ")}
                  </div>
                </div>
                <span className="text-[11px] text-brand-700 font-semibold">
                  Change
                </span>
              </button>
            ) : (
              <>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by lead, company, or ID…"
                    className="w-full pl-8 pr-3 h-9 text-sm rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
                  />
                </div>
                <ul className="mt-2 max-h-56 overflow-y-auto divide-y divide-ink-100 border border-ink-200 rounded-md">
                  {matches.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => setLeadId(l.id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-brand-50/50 text-left"
                      >
                        <Avatar ownerId={l.ownerId} size="xs" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-medium text-ink-900 truncate">
                            {l.name}{" "}
                            <span className="text-ink-400 font-normal">
                              · {l.company}
                            </span>
                          </div>
                          <div className="text-[11px] text-ink-500">
                            {fmtMoney(l.value)} · {l.stage.replace("_", " ")} · {l.daysInactive}d quiet
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-ink-400" />
                      </button>
                    </li>
                  ))}
                  {matches.length === 0 && (
                    <li className="px-3 py-4 text-[12px] text-ink-500 text-center">
                      No deals match "{query}"
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>

          {/* Mode-specific form */}
          <div className="px-4 py-3.5 space-y-3">
            {mode === "call" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="h-eyebrow mb-1.5 inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Duration
                    </div>
                    <div className="flex items-center gap-1">
                      {[5, 10, 15, 30, 45].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setCallDuration(d)}
                          className={`px-2 py-1 rounded-md text-[12px] font-medium ${
                            callDuration === d
                              ? "bg-brand-600 text-white"
                              : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                          }`}
                        >
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="h-eyebrow mb-1.5">Outcome</div>
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value)}
                      className="w-full h-8 text-sm rounded-md border border-ink-200 px-2 bg-white"
                    >
                      {callOutcomes.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {mode === "email" && (
              <>
                <div>
                  <div className="h-eyebrow mb-1.5">Subject</div>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder={
                      lead ? `Following up · ${lead.company}` : "Subject…"
                    }
                    className="w-full h-9 text-sm rounded-md border border-ink-200 px-2.5"
                  />
                </div>
                <div>
                  <div className="h-eyebrow mb-1.5">
                    Body{" "}
                    <span className="text-[10px] text-ink-400 font-normal">
                      (optional summary)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Short summary of what you sent…"
                    className="w-full text-[13px] rounded-md border border-ink-200 px-2.5 py-2 resize-none"
                  />
                </div>
              </>
            )}

            {mode === "note" && (
              <div>
                <div className="h-eyebrow mb-1.5">Note</div>
                <textarea
                  autoFocus
                  rows={4}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="What did you learn? Decisions, blockers, signal…"
                  className="w-full text-[13px] rounded-md border border-ink-200 px-2.5 py-2 resize-none"
                />
              </div>
            )}

            {mode === "task" && (
              <>
                <div>
                  <div className="h-eyebrow mb-1.5">Task</div>
                  <input
                    autoFocus
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="What needs to happen?"
                    className="w-full h-9 text-sm rounded-md border border-ink-200 px-2.5"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="h-eyebrow mb-1.5">Type</div>
                    <select
                      value={taskKind}
                      onChange={(e) =>
                        setTaskKind(e.target.value as typeof taskKind)
                      }
                      className="w-full h-8 text-sm rounded-md border border-ink-200 px-2 bg-white"
                    >
                      <option value="follow_up">Follow up</option>
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="review">Review</option>
                    </select>
                  </div>
                  <div>
                    <div className="h-eyebrow mb-1.5">Due</div>
                    <select
                      value={taskDueDays}
                      onChange={(e) => setTaskDueDays(Number(e.target.value))}
                      className="w-full h-8 text-sm rounded-md border border-ink-200 px-2 bg-white"
                    >
                      <option value={0}>Today</option>
                      <option value={1}>Tomorrow</option>
                      <option value={3}>In 3 days</option>
                      <option value={7}>Next week</option>
                      <option value={14}>In 2 weeks</option>
                    </select>
                  </div>
                  <div>
                    <div className="h-eyebrow mb-1.5">Priority</div>
                    <div className="flex items-center bg-ink-100 p-0.5 rounded-md text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setTaskPriority("normal")}
                        className={`flex-1 py-1 rounded ${
                          taskPriority === "normal"
                            ? "bg-white text-ink-900 shadow-card"
                            : "text-ink-500"
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskPriority("high")}
                        className={`flex-1 py-1 rounded ${
                          taskPriority === "high"
                            ? "bg-white text-warning-700 shadow-card"
                            : "text-ink-500"
                        }`}
                      >
                        High
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="px-4 py-3 border-t border-ink-100 bg-ink-50/40 flex items-center justify-between">
            <span className="text-[11px] text-ink-500">
              ⌘L opens this anywhere · ⏎ to save
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeQuickLog}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!lead}
                className="btn-primary"
              >
                {mode === "call"
                  ? "Save call"
                  : mode === "email"
                    ? "Log email"
                    : mode === "note"
                      ? "Save note"
                      : "Create task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
