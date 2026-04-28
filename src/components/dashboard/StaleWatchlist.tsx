import { Card, CardHeader } from "../ui/Card";
import { Badge, RiskBadge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { useStore } from "../../state/DataStore";
import { fmtMoney } from "../../lib/format";
import { STAGES } from "../../data/types";
import { useAppState } from "../../state/AppState";
import { repsById } from "../../data/reps";
import { InlineActions } from "../actions/InlineActions";
import { BlockerPills, UnreadEmailPill } from "../signals/SignalPills";
import { depthFor } from "../../data/depth2";
import { AILine } from "../ai/AIHint";

export function StaleWatchlist() {
  const { role, currentUserId, openLead } = useAppState();
  const store = useStore();
  const pool = store.leads.filter(
    (l) =>
      l.stage !== "closed_won" &&
      l.stage !== "closed_lost" &&
      l.daysInactive >= 5,
  );
  const filtered =
    role === "rep" ? pool.filter((l) => l.ownerId === currentUserId) : pool;
  const sorted = [...filtered]
    .sort((a, b) => b.daysInactive - a.daysInactive)
    .slice(0, 6);

  return (
    <Card pad={false}>
      <div className="px-5 pt-5">
        <CardHeader
          eyebrow="Stale deals watchlist"
          title="At-risk deals losing momentum"
          description="Surfaced when there's been no inbound or outbound activity in 5+ days. Act inline to revive."
          right={
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{filtered.length} at risk</Badge>
              <button className="btn-ghost text-[12px]" type="button">
                Manage
              </button>
            </div>
          }
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-head pl-5">Lead</th>
              <th className="table-head">Stage</th>
              {role === "manager" && <th className="table-head">Owner</th>}
              <th className="table-head text-right">Value</th>
              <th className="table-head text-right">Inactive</th>
              <th className="table-head">Risk · blockers</th>
              <th className="table-head pr-5 text-right">Quick action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((l) => (
              <tr
                key={l.id}
                className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40 cursor-pointer transition-colors group"
                onClick={() => openLead(l.id)}
              >
                <td className="table-cell pl-5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink-900">
                      {l.name}
                    </span>
                    <UnreadEmailPill lead={l} />
                  </div>
                  <div className="text-[11.5px] text-ink-400">
                    {l.company}
                  </div>
                  {(() => {
                    const insight = depthFor(l.id).aiInsights[0];
                    return insight ? (
                      <div className="mt-1">
                        <AILine weight={insight.weight}>{insight.body}</AILine>
                      </div>
                    ) : null;
                  })()}
                </td>
                <td className="table-cell">
                  <Badge tone="neutral">
                    {STAGES.find((s) => s.id === l.stage)?.label}
                  </Badge>
                </td>
                {role === "manager" && (
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <Avatar ownerId={l.ownerId} size="xs" />
                      <span className="text-[12px] text-ink-700">
                        {repsById[l.ownerId]?.name.split(" ")[0]}
                      </span>
                    </div>
                  </td>
                )}
                <td className="table-cell text-right font-medium text-ink-900">
                  {fmtMoney(l.value)}
                </td>
                <td className="table-cell text-right">
                  <span
                    className={`text-[12px] font-semibold ${
                      l.daysInactive >= 12
                        ? "text-danger-700"
                        : l.daysInactive >= 7
                          ? "text-warning-700"
                          : "text-ink-700"
                    }`}
                  >
                    {l.daysInactive}d
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex flex-col gap-1">
                    <RiskBadge level={l.riskLevel} />
                    <BlockerPills lead={l} max={1} size="xs" />
                  </div>
                </td>
                <td
                  className="table-cell pr-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end opacity-70 group-hover:opacity-100">
                    <InlineActions lead={l} variant="compact" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
