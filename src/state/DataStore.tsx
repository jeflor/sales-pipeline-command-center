import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  Lead,
  Task,
  Activity,
  Stage,
  BlockerKind,
  AuditEvent,
} from "../data/types";
import { leads as seedLeads } from "../data/leads";
import { activities as seedActivities, tasks as seedTasks } from "../data/activities";
import { internalCommentsByLead } from "../data/depth";
import type { InternalComment } from "../data/types";

type DataStoreValue = {
  leads: Lead[];
  leadById: (id: string) => Lead | undefined;
  tasks: Task[];
  activities: Activity[];
  internalComments: InternalComment[];
  audit: AuditEvent[];
  // Mutating actions
  logCall: (input: {
    leadId: string;
    actorId: string;
    durationMin?: number;
    outcome: string;
  }) => void;
  logEmail: (input: {
    leadId: string;
    actorId: string;
    subject: string;
    body?: string;
  }) => void;
  addNote: (input: { leadId: string; actorId: string; body: string }) => void;
  scheduleNextTouch: (input: {
    leadId: string;
    actorId: string;
    inDays: number;
  }) => void;
  markBlocked: (input: {
    leadId: string;
    actorId: string;
    kind: BlockerKind;
    label: string;
    detail?: string;
  }) => void;
  clearBlocker: (input: { leadId: string; actorId: string; blockerId: string }) => void;
  escalateDeal: (input: { leadId: string; actorId: string; reason?: string }) => void;
  changeStage: (input: { leadId: string; actorId: string; to: Stage }) => void;
  completeTask: (input: { taskId: string; actorId: string }) => void;
  uncompleteTask: (input: { taskId: string; actorId: string }) => void;
  addTask: (input: {
    leadId: string;
    actorId: string;
    title: string;
    kind: Task["kind"];
    dueInDays: number;
    priority?: Task["priority"];
  }) => void;
  addInternalComment: (input: {
    leadId: string;
    authorId: string;
    body: string;
  }) => void;
  toggleStar: (input: { leadId: string }) => void;
  markEmailsRead: (leadId: string) => void;
};

const Ctx = createContext<DataStoreValue | null>(null);

let nextId = 9000;
const newId = (prefix: string) => `${prefix}-${++nextId}`;

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() =>
    seedLeads.map((l) => ({ ...l, blockers: [...l.blockers] })),
  );
  const [tasks, setTasks] = useState<Task[]>(() => [...seedTasks]);
  const [activities, setActivities] = useState<Activity[]>(() => [
    ...seedActivities,
  ]);
  const [internalComments, setInternalComments] = useState<InternalComment[]>(
    () => Object.values(internalCommentsByLead).flat(),
  );
  const [audit, setAudit] = useState<AuditEvent[]>([]);

  // ----- helpers -----
  const recordActivity = useCallback((a: Omit<Activity, "id">) => {
    setActivities((prev) => [{ id: newId("a"), ...a }, ...prev]);
  }, []);

  const recordAudit = useCallback(
    (
      actor: string,
      action: string,
      leadId?: string,
      detail?: string,
    ) => {
      setAudit((prev) => [
        {
          id: newId("au"),
          at: new Date().toISOString(),
          actor,
          action,
          leadId,
          detail,
        },
        ...prev,
      ]);
    },
    [],
  );

  const updateLead = useCallback(
    (leadId: string, patch: (l: Lead) => Lead) => {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? patch(l) : l)));
    },
    [],
  );

  // ----- actions -----
  const logCall: DataStoreValue["logCall"] = useCallback(
    ({ leadId, actorId, durationMin = 18, outcome }) => {
      const at = new Date().toISOString();
      recordActivity({
        leadId,
        type: "call",
        ownerId: actorId,
        at,
        summary: `Call (${durationMin} min) · ${outcome}`,
      });
      updateLead(leadId, (l) => ({
        ...l,
        lastTouchAt: at,
        daysInactive: 0,
        riskLevel: l.riskLevel === "critical" ? "high" : l.riskLevel,
      }));
      recordAudit(actorId, "Logged call", leadId, outcome);
    },
    [recordActivity, updateLead, recordAudit],
  );

  const logEmail: DataStoreValue["logEmail"] = useCallback(
    ({ leadId, actorId, subject }) => {
      const at = new Date().toISOString();
      recordActivity({
        leadId,
        type: "email_sent",
        ownerId: actorId,
        at,
        summary: `Sent: ${subject}`,
      });
      updateLead(leadId, (l) => ({
        ...l,
        lastTouchAt: at,
        daysInactive: 0,
        unreadEmails: 0,
      }));
      recordAudit(actorId, "Sent email", leadId, subject);
    },
    [recordActivity, updateLead, recordAudit],
  );

  const addNote: DataStoreValue["addNote"] = useCallback(
    ({ leadId, actorId, body }) => {
      const at = new Date().toISOString();
      recordActivity({
        leadId,
        type: "note",
        ownerId: actorId,
        at,
        summary: `Note: ${body.slice(0, 80)}${body.length > 80 ? "…" : ""}`,
        detail: body.length > 80 ? body : undefined,
      });
      recordAudit(actorId, "Added note", leadId);
    },
    [recordActivity, recordAudit],
  );

  const scheduleNextTouch: DataStoreValue["scheduleNextTouch"] = useCallback(
    ({ leadId, actorId, inDays }) => {
      const next = new Date(Date.now() + inDays * 86400000).toISOString();
      updateLead(leadId, (l) => ({ ...l, nextTouchAt: next }));
      recordAudit(actorId, `Scheduled next touch in ${inDays} day(s)`, leadId);
    },
    [updateLead, recordAudit],
  );

  const markBlocked: DataStoreValue["markBlocked"] = useCallback(
    ({ leadId, actorId, kind, label, detail }) => {
      const id = newId("b");
      const since = new Date().toISOString();
      updateLead(leadId, (l) => ({
        ...l,
        blockers: [
          ...l.blockers,
          { id, kind, label, since, setBy: actorId, detail },
        ],
      }));
      recordActivity({
        leadId,
        type: "blocker_set",
        ownerId: actorId,
        at: since,
        summary: `Blocker set · ${label}`,
        detail,
      });
      recordAudit(actorId, `Marked blocked: ${label}`, leadId);
    },
    [updateLead, recordActivity, recordAudit],
  );

  const clearBlocker: DataStoreValue["clearBlocker"] = useCallback(
    ({ leadId, actorId, blockerId }) => {
      let cleared: string | undefined;
      updateLead(leadId, (l) => {
        const b = l.blockers.find((x) => x.id === blockerId);
        cleared = b?.label;
        return { ...l, blockers: l.blockers.filter((x) => x.id !== blockerId) };
      });
      recordAudit(actorId, `Cleared blocker: ${cleared ?? blockerId}`, leadId);
    },
    [updateLead, recordAudit],
  );

  const escalateDeal: DataStoreValue["escalateDeal"] = useCallback(
    ({ leadId, actorId, reason }) => {
      const at = new Date().toISOString();
      recordActivity({
        leadId,
        type: "escalation",
        ownerId: actorId,
        at,
        summary: `Escalated to manager${reason ? ` · ${reason}` : ""}`,
      });
      recordAudit(actorId, "Escalated deal to manager", leadId, reason);
    },
    [recordActivity, recordAudit],
  );

  const changeStage: DataStoreValue["changeStage"] = useCallback(
    ({ leadId, actorId, to }) => {
      const at = new Date().toISOString();
      const closed = to === "closed_won" || to === "closed_lost";
      updateLead(leadId, (l) => ({
        ...l,
        stage: to,
        closedAt: closed ? at : l.closedAt,
        confidence: to === "closed_won" ? 100 : to === "closed_lost" ? 0 : l.confidence,
      }));
      recordActivity({
        leadId,
        type: "stage_change",
        ownerId: actorId,
        at,
        summary: `Moved to ${to.replace("_", " ")}`,
      });
      recordAudit(actorId, `Stage → ${to}`, leadId);
    },
    [updateLead, recordActivity, recordAudit],
  );

  const completeTask: DataStoreValue["completeTask"] = useCallback(
    ({ taskId, actorId }) => {
      let leadId: string | undefined;
      let title: string | undefined;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            leadId = t.leadId;
            title = t.title;
            return { ...t, done: true };
          }
          return t;
        }),
      );
      const at = new Date().toISOString();
      if (leadId && title) {
        recordActivity({
          leadId,
          type: "task_completed",
          ownerId: actorId,
          at,
          summary: `Task done: ${title}`,
        });
        updateLead(leadId, (l) => ({ ...l, lastTouchAt: at, daysInactive: 0 }));
        recordAudit(actorId, `Completed task: ${title}`, leadId);
      }
    },
    [recordActivity, updateLead, recordAudit],
  );

  const uncompleteTask: DataStoreValue["uncompleteTask"] = useCallback(
    ({ taskId, actorId }) => {
      let leadId: string | undefined;
      let title: string | undefined;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            leadId = t.leadId;
            title = t.title;
            return { ...t, done: false };
          }
          return t;
        }),
      );
      if (leadId) recordAudit(actorId, `Reopened task: ${title}`, leadId);
    },
    [recordAudit],
  );

  const addTask: DataStoreValue["addTask"] = useCallback(
    ({ leadId, actorId, title, kind, dueInDays, priority = "normal" }) => {
      const due = new Date(Date.now() + dueInDays * 86400000).toISOString();
      setTasks((prev) => [
        {
          id: newId("t"),
          leadId,
          ownerId: actorId,
          title,
          due,
          done: false,
          priority,
          kind,
        },
        ...prev,
      ]);
      recordAudit(actorId, `Created task: ${title}`, leadId);
    },
    [recordAudit],
  );

  const addInternalComment: DataStoreValue["addInternalComment"] = useCallback(
    ({ leadId, authorId, body }) => {
      setInternalComments((prev) => [
        {
          id: newId("ic"),
          leadId,
          authorId,
          body,
          at: new Date().toISOString(),
        },
        ...prev,
      ]);
      recordAudit(authorId, "Posted internal comment", leadId);
    },
    [recordAudit],
  );

  const toggleStar: DataStoreValue["toggleStar"] = useCallback(
    ({ leadId }) => {
      updateLead(leadId, (l) => ({ ...l, starred: !l.starred }));
    },
    [updateLead],
  );

  const markEmailsRead: DataStoreValue["markEmailsRead"] = useCallback(
    (leadId) => {
      updateLead(leadId, (l) => ({ ...l, unreadEmails: 0 }));
    },
    [updateLead],
  );

  const leadById = useCallback(
    (id: string) => leads.find((l) => l.id === id),
    [leads],
  );

  // Recompute derived fields (daysInactive, riskLevel, urgencyScore) when lastTouchAt changes
  useEffect(() => {
    setLeads((prev) => {
      const now = Date.now();
      return prev.map((l) => {
        const inactive = Math.floor(
          (now - new Date(l.lastTouchAt).getTime()) / 86400000,
        );
        if (inactive === l.daysInactive) return l;
        return { ...l, daysInactive: Math.max(0, inactive) };
      });
    });
    // run once on mount; subsequent updates happen inside actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<DataStoreValue>(
    () => ({
      leads,
      leadById,
      tasks,
      activities,
      internalComments,
      audit,
      logCall,
      logEmail,
      addNote,
      scheduleNextTouch,
      markBlocked,
      clearBlocker,
      escalateDeal,
      changeStage,
      completeTask,
      uncompleteTask,
      addTask,
      addInternalComment,
      toggleStar,
      markEmailsRead,
    }),
    [
      leads,
      leadById,
      tasks,
      activities,
      internalComments,
      audit,
      logCall,
      logEmail,
      addNote,
      scheduleNextTouch,
      markBlocked,
      clearBlocker,
      escalateDeal,
      changeStage,
      completeTask,
      uncompleteTask,
      addTask,
      addInternalComment,
      toggleStar,
      markEmailsRead,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): DataStoreValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside DataStoreProvider");
  return ctx;
}
