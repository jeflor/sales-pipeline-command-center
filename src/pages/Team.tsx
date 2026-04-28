import { Card, CardHeader } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { reps } from "../data/reps";
import { leads } from "../data/leads";
import { fmtMoney, fmtPct } from "../lib/format";
import { Mail } from "lucide-react";

export function TeamPage() {
  const repRows = reps
    .filter((r) => r.role === "rep")
    .map((r) => {
      const owned = leads.filter((l) => l.ownerId === r.id);
      const won = owned.filter((l) => l.stage === "closed_won");
      const open = owned.filter(
        (l) => l.stage !== "closed_won" && l.stage !== "closed_lost",
      );
      const lost = owned.filter((l) => l.stage === "closed_lost");
      const wonValue = won.reduce((s, l) => s + l.value, 0);
      const openValue = open.reduce((s, l) => s + l.value, 0);
      const winRate =
        won.length + lost.length > 0
          ? Math.round((won.length / (won.length + lost.length)) * 100)
          : 0;
      return {
        rep: r,
        won,
        open,
        wonValue,
        openValue,
        winRate,
        attainment: r.quota ? wonValue / r.quota : 0,
      };
    })
    .sort((a, b) => b.attainment - a.attainment);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
          Team
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          {repRows.length} reps · roster, attainment, and current pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {repRows.map((row) => {
          const pct = Math.min(100, Math.round(row.attainment * 100));
          return (
            <Card key={row.rep.id}>
              <div className="flex items-center gap-3">
                <Avatar ownerId={row.rep.id} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">
                      {row.rep.name}
                    </span>
                    <Badge tone="neutral">Account Executive</Badge>
                  </div>
                  <div className="text-[12px] text-ink-500 inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {row.rep.email}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-ink-500">QTD attainment</span>
                  <span className="font-semibold text-ink-800">
                    {fmtPct(pct)} of {fmtMoney(row.rep.quota)}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-ink-100 overflow-hidden">
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
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Stat label="Won" value={fmtMoney(row.wonValue)} sub={`${row.won.length} deals`} />
                <Stat label="Open" value={fmtMoney(row.openValue)} sub={`${row.open.length} deals`} />
                <Stat label="Win rate" value={`${row.winRate}%`} sub="QTD" />
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader
          eyebrow="Manager"
          title="Sales leadership"
          description="Owns forecasting, coverage targets, and rep coaching cadence."
        />
        <div className="flex items-center gap-3">
          <Avatar ownerId={reps.find((r) => r.role === "manager")!.id} size="lg" />
          <div>
            <div className="text-sm font-semibold text-ink-900">Jordan Reyes</div>
            <div className="text-[12px] text-ink-500">Sales Manager · jordan.reyes@northwind.io</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50/40 p-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-ink-900">{value}</div>
      <div className="text-[10.5px] text-ink-500">{sub}</div>
    </div>
  );
}
