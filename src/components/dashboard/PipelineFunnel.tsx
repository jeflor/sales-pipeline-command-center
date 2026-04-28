import { Card, CardHeader } from "../ui/Card";
import { ACTIVE_STAGES, STAGES } from "../../data/types";
import { useStore } from "../../state/DataStore";
import { fmtMoney } from "../../lib/format";

const stageColor: Record<string, string> = {
  new_lead: "#94a3b8",
  contacted: "#60a5fa",
  qualified: "#5a85fb",
  proposal_sent: "#3a62ee",
  negotiation: "#1f3284",
};

export function PipelineFunnel() {
  const store = useStore();
  // Always include closed_won at the tail for context
  const stages = [...ACTIVE_STAGES, "closed_won" as const];

  const counts = stages.map((id) => {
    const items = store.leads.filter((l) => l.stage === id);
    return {
      id,
      label: STAGES.find((s) => s.id === id)?.label ?? id,
      count: items.length,
      value: items.reduce((s, l) => s + l.value, 0),
    };
  });

  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <Card>
      <CardHeader
        eyebrow="Pipeline funnel"
        title="Stage-by-stage health"
        description="Deal counts and value across active stages, with conversion drop-off."
        right={
          <select className="text-xs border border-ink-200 rounded-md px-2 py-1 bg-white text-ink-700">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Quarter to date</option>
          </select>
        }
      />
      <div className="space-y-2.5">
        {counts.map((c, idx) => {
          const widthPct = (c.count / max) * 100;
          const next = counts[idx + 1];
          const conversion =
            next && c.count > 0
              ? Math.round((next.count / c.count) * 100)
              : null;
          return (
            <div key={c.id} className="group">
              <div className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <div className="text-[12.5px] font-medium text-ink-800">
                    {c.label}
                  </div>
                  <div className="text-[11px] text-ink-400">
                    {c.count} {c.count === 1 ? "deal" : "deals"}
                  </div>
                </div>
                <div className="flex-1 relative">
                  <div className="h-7 rounded-md bg-ink-100 overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor:
                          stageColor[c.id] ?? "#3a62ee",
                      }}
                    />
                  </div>
                  <span className="absolute inset-y-0 left-2.5 flex items-center text-[12px] font-semibold text-white drop-shadow">
                    {fmtMoney(c.value)}
                  </span>
                </div>
                <div className="w-20 text-right">
                  {conversion !== null && (
                    <span
                      className={`text-[11px] font-semibold ${
                        conversion >= 50
                          ? "text-success-700"
                          : conversion >= 30
                            ? "text-warning-700"
                            : "text-danger-700"
                      }`}
                    >
                      {conversion}% →
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between text-[12px] text-ink-500">
        <span>
          Total active pipeline:{" "}
          <span className="font-semibold text-ink-800">
            {fmtMoney(
              counts
                .filter((c) => c.id !== "closed_won")
                .reduce((s, c) => s + c.value, 0),
            )}
          </span>
        </span>
        <span>
          Stage-to-stage avg conversion:{" "}
          <span className="font-semibold text-ink-800">42%</span>
        </span>
      </div>
    </Card>
  );
}
