import { Card, CardHeader } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { reps } from "../../data/reps";
import { leads } from "../../data/leads";
import { fmtMoney, fmtPct } from "../../lib/format";

export function RepLeaderboard() {
  const repRows = reps
    .filter((r) => r.role === "rep")
    .map((r) => {
      const owned = leads.filter((l) => l.ownerId === r.id);
      const won = owned.filter((l) => l.stage === "closed_won");
      const open = owned.filter(
        (l) => l.stage !== "closed_won" && l.stage !== "closed_lost",
      );
      const wonValue = won.reduce((s, l) => s + l.value, 0);
      const openValue = open.reduce((s, l) => s + l.value, 0);
      const attainment = r.quota ? wonValue / r.quota : 0;
      return {
        rep: r,
        won: won.length,
        wonValue,
        openValue,
        attainment,
        openCount: open.length,
      };
    })
    .sort((a, b) => b.wonValue - a.wonValue);

  return (
    <Card>
      <CardHeader
        eyebrow="Rep leaderboard"
        title="Quarter to date"
        description="Closed revenue, attainment vs. quota, and active pipeline."
        right={
          <select className="text-xs border border-ink-200 rounded-md px-2 py-1 bg-white text-ink-700">
            <option>QTD</option>
            <option>MTD</option>
            <option>YTD</option>
          </select>
        }
      />
      <div className="space-y-3">
        {repRows.map((row, idx) => {
          const pct = Math.min(100, Math.round(row.attainment * 100));
          return (
            <div key={row.rep.id} className="flex items-center gap-3">
              <span className="w-5 text-center text-[11px] font-semibold text-ink-400">
                {idx + 1}
              </span>
              <Avatar ownerId={row.rep.id} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ink-800 truncate">
                    {row.rep.name}
                  </span>
                  <span className="text-[12px] font-semibold text-ink-900">
                    {fmtMoney(row.wonValue)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 90
                          ? "bg-success-500"
                          : pct >= 60
                            ? "bg-brand-500"
                            : "bg-warning-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink-500 w-12 text-right">
                    {fmtPct(pct)}
                  </span>
                </div>
                <div className="text-[11px] text-ink-400 mt-0.5">
                  {row.openCount} open · {fmtMoney(row.openValue)} pipeline
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
