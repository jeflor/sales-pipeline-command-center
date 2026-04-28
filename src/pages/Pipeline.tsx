import { useState } from "react";
import {
  Filter,
  Search,
  Sparkles,
  Plus,
  Clock,
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import { KANBAN_STAGES, STAGES } from "../data/types";
import type { Stage, Lead } from "../data/types";
import { leads } from "../data/leads";
import { fmtMoney, relativeTime } from "../lib/format";
import { Avatar } from "../components/ui/Avatar";
import { useAppState } from "../state/AppState";

const stageAccent: Record<Stage, string> = {
  new_lead: "bg-ink-300",
  contacted: "bg-brand-300",
  qualified: "bg-brand-500",
  proposal_sent: "bg-brand-600",
  negotiation: "bg-brand-700",
  closed_won: "bg-success-500",
  closed_lost: "bg-danger-500",
};

export function PipelinePage() {
  const { role, currentUserId, openLead } = useAppState();
  const [ownerFilter, setOwnerFilter] = useState<"mine" | "all">(
    role === "rep" ? "mine" : "all",
  );
  const [query, setQuery] = useState("");

  const visible = leads.filter((l) => {
    if (ownerFilter === "mine" && l.ownerId !== currentUserId) return false;
    if (
      query &&
      !`${l.name} ${l.company}`.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    return KANBAN_STAGES.includes(l.stage);
  });

  const byStage = (stage: Stage) =>
    visible
      .filter((l) => l.stage === stage)
      .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Pipeline
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {visible.length} deals · total{" "}
            {fmtMoney(visible.reduce((s, l) => s + l.value, 0))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deals…"
              className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
          </div>
          <div className="hidden md:flex items-center bg-white border border-ink-200 rounded-lg p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setOwnerFilter("mine")}
              className={`px-2.5 py-1 rounded-md ${
                ownerFilter === "mine"
                  ? "bg-ink-900 text-white"
                  : "text-ink-600"
              }`}
            >
              My deals
            </button>
            <button
              type="button"
              onClick={() => setOwnerFilter("all")}
              className={`px-2.5 py-1 rounded-md ${
                ownerFilter === "all"
                  ? "bg-ink-900 text-white"
                  : "text-ink-600"
              }`}
            >
              All
            </button>
          </div>
          <button className="btn-secondary" type="button">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          <button className="btn-primary" type="button">
            <Plus className="h-3.5 w-3.5" />
            Add deal
          </button>
        </div>
      </div>

      <div className="grid grid-flow-col auto-cols-[280px] gap-3 overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
        {KANBAN_STAGES.map((stageId) => {
          const stageLabel =
            STAGES.find((s) => s.id === stageId)?.label ?? stageId;
          const items = byStage(stageId);
          const total = items.reduce((s, l) => s + l.value, 0);
          return (
            <div
              key={stageId}
              className="flex flex-col bg-ink-100/60 rounded-xl border border-ink-200/60"
            >
              <div className="px-3 pt-3 pb-2.5 border-b border-ink-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${stageAccent[stageId]}`}
                    />
                    <span className="text-[12.5px] font-semibold text-ink-800">
                      {stageLabel}
                    </span>
                    <span className="text-[11px] text-ink-400 bg-white border border-ink-200 rounded px-1.5">
                      {items.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="h-6 w-6 inline-flex items-center justify-center text-ink-400 hover:text-ink-700"
                    title="Add to stage"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] text-ink-500">
                  {fmtMoney(total)} · stage value
                </div>
              </div>
              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                {items.map((l) => (
                  <DealCard key={l.id} lead={l} onClick={() => openLead(l.id)} />
                ))}
                {items.length === 0 && (
                  <div className="text-[11px] text-ink-400 italic px-2 py-6 text-center border border-dashed border-ink-200 rounded-lg">
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const overdue =
    lead.nextTouchAt && new Date(lead.nextTouchAt).getTime() < Date.now();
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white border border-ink-200 rounded-lg p-3 hover:border-brand-300 hover:shadow-card transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <GripVertical className="h-3.5 w-3.5 text-ink-300 -ml-1 opacity-0 group-hover:opacity-100" />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink-900 truncate">
              {lead.name}
            </div>
            <div className="text-[11.5px] text-ink-500 truncate">
              {lead.company}
            </div>
          </div>
        </div>
        <Avatar ownerId={lead.ownerId} size="xs" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-900">
          {fmtMoney(lead.value)}
        </span>
        {lead.urgencyScore >= 70 && (
          <span className="badge-danger">
            <AlertTriangle className="h-3 w-3" />
            Hot
          </span>
        )}
        {lead.urgencyScore < 70 && lead.urgencyScore >= 50 && (
          <span className="badge-warning">Watch</span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {relativeTime(lead.lastTouchAt)}
        </span>
        {overdue && lead.nextTouchAt && (
          <span className="text-danger-700 font-semibold">
            Overdue {relativeTime(lead.nextTouchAt)}
          </span>
        )}
        {!overdue && lead.nextTouchAt && (
          <span>Next {relativeTime(lead.nextTouchAt)}</span>
        )}
      </div>

      {lead.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded bg-ink-50 text-ink-600 border border-ink-200"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-ink-100 text-[11px] text-ink-400 flex items-center justify-between">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-brand-600" />
          {lead.recommendedAction.length > 28
            ? lead.recommendedAction.slice(0, 28) + "…"
            : lead.recommendedAction}
        </span>
      </div>
    </button>
  );
}
