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
import { useStore } from "../state/DataStore";
import { fmtMoney, relativeTime } from "../lib/format";
import { Avatar } from "../components/ui/Avatar";
import { useAppState } from "../state/AppState";
import { InlineActions } from "../components/actions/InlineActions";
import {
  BlockerPills,
  UnreadEmailPill,
  DataIssuePills,
  DuplicatePill,
} from "../components/signals/SignalPills";
import { depthFor } from "../data/depth2";
import { avgDaysInStage } from "../data/benchmarks";
import { AILine } from "../components/ai/AIHint";
import { Ban, MessageCircle } from "lucide-react";

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
  const store = useStore();
  const [ownerFilter, setOwnerFilter] = useState<"mine" | "all">(
    role === "rep" ? "mine" : "all",
  );
  const [query, setQuery] = useState("");

  const visible = store.leads.filter((l) => {
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
  const champion = lead.stakeholders.find((s) => s.role === "Champion");
  const depth = depthFor(lead.id);
  const openObjections = depth.objections.filter(
    (o) => o.status !== "answered" && o.status !== "deferred",
  );
  const currentStageEntry = depth.stageHistory.find(
    (h) => h.stage === lead.stage,
  );
  const daysInStage = currentStageEntry
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(currentStageEntry.enteredAt).getTime()) /
            86400000,
        ),
      )
    : null;
  const stageAvg = avgDaysInStage[lead.stage];
  const slowStage =
    daysInStage !== null && stageAvg && daysInStage > stageAvg * 1.5;
  const competitorFlagged = depth.flags.includes("competitor_mentioned");
  const champEngagement = depth.championEngagement;
  const topInsight = depth.aiInsights[0];
  return (
    <div
      onClick={onClick}
      className="bg-white border border-ink-200 rounded-lg p-3 hover:border-brand-300 hover:shadow-card transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <GripVertical className="h-3.5 w-3.5 text-ink-300 -ml-1 opacity-0 group-hover:opacity-100" />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink-900 truncate flex items-center gap-1">
              {lead.name}
              <UnreadEmailPill lead={lead} />
            </div>
            <div className="text-[11.5px] text-ink-500 truncate">
              {lead.company} · {lead.id}
            </div>
          </div>
        </div>
        <Avatar ownerId={lead.ownerId} size="xs" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-900">
          {fmtMoney(lead.value)}
        </span>
        <div className="flex items-center gap-1">
          {lead.urgencyScore >= 70 && (
            <span className="badge-danger">
              <AlertTriangle className="h-3 w-3" />
              Hot
            </span>
          )}
          {lead.urgencyScore < 70 && lead.urgencyScore >= 50 && (
            <span className="badge-warning">Watch</span>
          )}
          <DuplicatePill lead={lead} />
        </div>
      </div>

      {/* Champion + engagement micro-bar */}
      {champion && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-ink-600 min-w-0 flex-1">
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                champion.status === "engaged"
                  ? "bg-success-500"
                  : champion.status === "warm"
                    ? "bg-warning-500"
                    : champion.status === "blocking"
                      ? "bg-danger-500"
                      : "bg-ink-400"
              }`}
            />
            <span className="font-medium truncate">{champion.name}</span>
            <span className="text-ink-400 truncate">
              · {champion.status}
            </span>
          </div>
          {champEngagement && (
            <div
              className="flex items-end gap-px h-3 shrink-0"
              title={`Champion engagement (last 6 weeks): ${champEngagement.join(", ")}`}
            >
              {champEngagement.map((v, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-sm ${
                    v >= 7
                      ? "bg-success-500"
                      : v >= 4
                        ? "bg-warning-500"
                        : "bg-danger-500"
                  }`}
                  style={{ height: `${(v / 10) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friction signals row — objections, competitor, blockers, data issues */}
      <div className="mt-1.5 flex items-center gap-1 flex-wrap">
        {openObjections.length > 0 && (
          <span
            title={openObjections.map((o) => o.topic).join(" · ")}
            className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-warning-200 bg-warning-50 text-warning-700 px-1.5 py-0 text-[10.5px] font-medium"
          >
            <MessageCircle className="h-3 w-3" />
            {openObjections.length} open obj
          </span>
        )}
        {competitorFlagged && (
          <span
            className="inline-flex items-center gap-1 rounded-md ring-1 ring-inset ring-danger-200 bg-danger-50 text-danger-700 px-1.5 py-0 text-[10.5px] font-medium"
            title="Competitor mentioned"
          >
            <Ban className="h-3 w-3" />
            Competitor
          </span>
        )}
        <BlockerPills lead={lead} max={1} size="xs" />
        <DataIssuePills lead={lead} max={1} />
      </div>

      {/* Days in stage vs avg */}
      {daysInStage !== null && stageAvg ? (
        <div className="mt-1 text-[10.5px] text-ink-500">
          <span
            className={
              slowStage ? "text-warning-700 font-semibold" : "text-ink-600"
            }
          >
            {daysInStage}d in stage
          </span>{" "}
          <span className="text-ink-400">· avg {stageAvg}d</span>
        </div>
      ) : null}

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
        {!lead.nextTouchAt && (
          <span className="text-warning-700">No next touch</span>
        )}
      </div>

      {/* AI insight (ambient, in-context) */}
      {topInsight && (
        <div className="mt-1.5">
          <AILine weight={topInsight.weight}>{topInsight.body}</AILine>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-ink-100 flex items-center justify-between">
        <span className="text-[11px] text-ink-500 inline-flex items-center gap-1 truncate flex-1 min-w-0">
          <Sparkles className="h-3 w-3 text-brand-600" />
          <span className="truncate">{lead.recommendedAction}</span>
        </span>
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <InlineActions lead={lead} variant="compact" />
        </div>
      </div>
    </div>
  );
}
