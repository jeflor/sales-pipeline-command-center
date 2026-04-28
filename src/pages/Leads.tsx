import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  Sparkles,
  Bookmark,
  Download,
} from "lucide-react";
import { leads } from "../data/leads";
import { STAGES } from "../data/types";
import type { Stage } from "../data/types";
import { Avatar } from "../components/ui/Avatar";
import { Badge, RiskBadge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { fmtDate, fmtMoneyFull, relativeTime } from "../lib/format";
import { useAppState } from "../state/AppState";
import { repsById } from "../data/reps";

const savedViews = [
  { id: "all", label: "All deals", count: 22 },
  { id: "mine", label: "My open deals", count: 8 },
  { id: "atrisk", label: "At-risk this week", count: 6 },
  { id: "highvalue", label: "$50k+", count: 9 },
  { id: "stalled", label: "Stalled 7+ days", count: 4 },
];

export function LeadsPage() {
  const { role, currentUserId, openLead } = useAppState();
  const [view, setView] = useState("mine");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");

  const filtered = useMemo(() => {
    return leads
      .filter((l) => {
        if (view === "mine" && l.ownerId !== currentUserId) return false;
        if (view === "atrisk" && l.riskLevel !== "high" && l.riskLevel !== "critical")
          return false;
        if (view === "highvalue" && l.value < 50000) return false;
        if (view === "stalled" && l.daysInactive < 7) return false;
        if (stageFilter !== "all" && l.stage !== stageFilter) return false;
        if (
          query &&
          !`${l.name} ${l.company} ${l.industry}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.value - a.value);
  }, [view, query, stageFilter, currentUserId]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Leads
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {role === "rep"
              ? "Your assigned leads with full status and signal."
              : "All leads across the team."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" type="button">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button className="btn-primary" type="button">
            <Plus className="h-3.5 w-3.5" />
            Add lead
          </button>
        </div>
      </div>

      <Card pad={false}>
        <div className="px-4 pt-3 pb-3 border-b border-ink-200 flex items-center gap-2 flex-wrap">
          {savedViews.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              type="button"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12.5px] font-medium ${
                view === v.id
                  ? "bg-ink-900 text-white"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-200"
              }`}
            >
              {view === v.id && <Bookmark className="h-3 w-3" />}
              {v.label}
              <span
                className={`text-[10px] font-semibold ${
                  view === v.id ? "text-white/70" : "text-ink-400"
                }`}
              >
                · {v.count}
              </span>
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads…"
                className="pl-8 pr-3 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40 w-56"
              />
            </div>
            <div className="relative">
              <select
                value={stageFilter}
                onChange={(e) =>
                  setStageFilter(e.target.value as Stage | "all")
                }
                className="appearance-none pl-3 pr-7 h-8 text-sm rounded-lg bg-white border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                <option value="all">All stages</option>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            </div>
            <button className="btn-secondary" type="button">
              <Filter className="h-3.5 w-3.5" />
              More
            </button>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-head pl-4">Lead</th>
                <th className="table-head">Stage</th>
                <th className="table-head text-right">Value</th>
                <th className="table-head">Owner</th>
                <th className="table-head">Source</th>
                <th className="table-head">Risk</th>
                <th className="table-head">Last touch</th>
                <th className="table-head">Close date</th>
                <th className="table-head pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40 cursor-pointer transition-colors"
                  onClick={() => openLead(l.id)}
                >
                  <td className="table-cell pl-4">
                    <div className="font-medium text-ink-900">{l.name}</div>
                    <div className="text-[11.5px] text-ink-400">
                      {l.company} · {l.industry}
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge tone="neutral">
                      {STAGES.find((s) => s.id === l.stage)?.label}
                    </Badge>
                  </td>
                  <td className="table-cell text-right font-semibold text-ink-900">
                    {fmtMoneyFull(l.value)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <Avatar ownerId={l.ownerId} size="xs" />
                      <span className="text-[12px]">
                        {repsById[l.ownerId]?.name.split(" ")[0]}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell text-[12px] text-ink-600">
                    {l.source}
                  </td>
                  <td className="table-cell">
                    <RiskBadge level={l.riskLevel} />
                  </td>
                  <td className="table-cell text-[12px] text-ink-600">
                    {relativeTime(l.lastTouchAt)}
                  </td>
                  <td className="table-cell text-[12px] text-ink-600">
                    {fmtDate(l.closeDate)}
                  </td>
                  <td className="table-cell pr-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLead(l.id);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline"
                    >
                      <Sparkles className="h-3 w-3" />
                      Act
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-ink-500">
              No leads match the current filters.
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-ink-200 text-[11.5px] text-ink-500 flex items-center justify-between">
          <span>
            Showing <span className="font-semibold text-ink-700">{filtered.length}</span> of {leads.length} leads
          </span>
          <span>
            Total value:{" "}
            <span className="font-semibold text-ink-800">
              {fmtMoneyFull(filtered.reduce((s, l) => s + l.value, 0))}
            </span>
          </span>
        </div>
      </Card>
    </div>
  );
}
