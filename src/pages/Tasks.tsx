import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  ListChecks,
  ScrollText,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { tasks } from "../data/activities";
import type { Task } from "../data/types";
import { leadsById } from "../data/leads";
import { repsById } from "../data/reps";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { fmtDate, fmtMoney, relativeTime } from "../lib/format";
import { useAppState } from "../state/AppState";

const kindIcon: Record<
  Task["kind"],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  follow_up: ListChecks,
  review: ScrollText,
};

type Tab = "today" | "overdue" | "upcoming" | "completed";

export function TasksPage() {
  const { role, currentUserId, openLead } = useAppState();
  const [tab, setTab] = useState<Tab>("today");
  const [query, setQuery] = useState("");

  const now = Date.now();

  const ownTasks = useMemo(
    () =>
      tasks.filter((t) =>
        role === "rep" ? t.ownerId === currentUserId : true,
      ),
    [role, currentUserId],
  );

  const counts = {
    today: ownTasks.filter(
      (t) => !t.done && sameDay(new Date(t.due), new Date(now)),
    ).length,
    overdue: ownTasks.filter((t) => !t.done && new Date(t.due).getTime() < now)
      .length,
    upcoming: ownTasks.filter(
      (t) => !t.done && new Date(t.due).getTime() > now,
    ).length,
    completed: ownTasks.filter((t) => t.done).length,
  };

  const filtered = ownTasks
    .filter((t) => {
      if (tab === "completed") return t.done;
      if (t.done) return false;
      const dueT = new Date(t.due).getTime();
      if (tab === "today") return sameDay(new Date(t.due), new Date(now));
      if (tab === "overdue") return dueT < now;
      if (tab === "upcoming") return dueT > now;
      return true;
    })
    .filter((t) =>
      query
        ? `${t.title} ${leadsById[t.leadId]?.company}`
            .toLowerCase()
            .includes(query.toLowerCase())
        : true,
    )
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Tasks
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {role === "rep"
              ? "Your day, prioritized — overdue first."
              : "Open tasks across the team."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
          </div>
          <button className="btn-secondary" type="button">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button className="btn-primary" type="button">
            <Plus className="h-3.5 w-3.5" />
            New task
          </button>
        </div>
      </div>

      <Card pad={false}>
        <div className="px-4 pt-3 border-b border-ink-200 flex items-center gap-1 -mb-px">
          <TabButton
            active={tab === "today"}
            onClick={() => setTab("today")}
            label="Today"
            count={counts.today}
          />
          <TabButton
            active={tab === "overdue"}
            onClick={() => setTab("overdue")}
            label="Overdue"
            count={counts.overdue}
            tone="danger"
          />
          <TabButton
            active={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
            label="Upcoming"
            count={counts.upcoming}
          />
          <TabButton
            active={tab === "completed"}
            onClick={() => setTab("completed")}
            label="Completed"
            count={counts.completed}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="h-8 w-8 text-success-500 mx-auto" />
            <div className="mt-2 text-sm font-semibold text-ink-800">
              You're all clear here.
            </div>
            <div className="text-[12px] text-ink-500">
              Nothing in this bucket right now.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {filtered.map((t) => {
              const lead = leadsById[t.leadId];
              const owner = repsById[t.ownerId];
              const Icon = kindIcon[t.kind];
              const overdue = !t.done && new Date(t.due).getTime() < now;
              return (
                <li
                  key={t.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-ink-50/60 cursor-pointer"
                  onClick={() => lead && openLead(lead.id)}
                >
                  <input
                    type="checkbox"
                    checked={t.done}
                    readOnly
                    className="mt-1.5 h-4 w-4 rounded border-ink-300 text-brand-600 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span
                    className={`mt-1 h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
                      t.kind === "call"
                        ? "bg-brand-50 text-brand-700"
                        : t.kind === "meeting"
                          ? "bg-warning-50 text-warning-700"
                          : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[13.5px] font-medium ${
                          t.done
                            ? "line-through text-ink-400"
                            : "text-ink-900"
                        }`}
                      >
                        {t.title}
                      </span>
                      {t.priority === "high" && (
                        <Badge tone="warning">High priority</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-500 flex-wrap">
                      {lead && (
                        <>
                          <span>{lead.company}</span>
                          <span>·</span>
                          <span>{fmtMoney(lead.value)}</span>
                          <span>·</span>
                        </>
                      )}
                      <span
                        className={
                          overdue
                            ? "text-danger-700 font-semibold"
                            : "text-ink-500"
                        }
                      >
                        Due {fmtDate(t.due)} ({relativeTime(t.due)})
                      </span>
                    </div>
                  </div>
                  {role === "manager" && (
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-500 shrink-0">
                      <Avatar ownerId={owner.id} size="xs" />
                      {owner.name.split(" ")[0]}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  tone = "neutral",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-[12.5px] font-medium border-b-2 ${
        active
          ? "border-brand-600 text-ink-900"
          : "border-transparent text-ink-500 hover:text-ink-800"
      }`}
      type="button"
    >
      {label}
      <span
        className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
          active
            ? tone === "danger"
              ? "bg-danger-100 text-danger-700"
              : "bg-brand-100 text-brand-700"
            : "bg-ink-100 text-ink-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
