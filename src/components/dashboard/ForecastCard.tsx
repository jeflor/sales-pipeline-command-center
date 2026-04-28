import { Card, CardHeader } from "../ui/Card";
import { fmtMoney, fmtPct } from "../../lib/format";
import { forecast } from "../../data/reports";

export function ForecastCard() {
  const commitPct = Math.min(
    100,
    Math.round((forecast.commit / forecast.target) * 100),
  );
  const bestCasePct = Math.min(
    100,
    Math.round((forecast.bestCase / forecast.target) * 100),
  );
  return (
    <Card>
      <CardHeader
        eyebrow="Forecast · April"
        title="Coverage and confidence"
        description="Real-time view of commit, best case, and pipeline coverage."
      />
      <div className="grid grid-cols-3 gap-4">
        <Stat
          label="Commit"
          value={fmtMoney(forecast.commit)}
          sub={`${commitPct}% of target`}
        />
        <Stat
          label="Best case"
          value={fmtMoney(forecast.bestCase)}
          sub={`${bestCasePct}% of target`}
        />
        <Stat
          label="Pipeline"
          value={fmtMoney(forecast.pipeline)}
          sub={`${forecast.coverage.toFixed(1)}× coverage`}
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1">
          <span>Progress to target</span>
          <span className="font-semibold text-ink-800">
            {fmtMoney(forecast.target)}
          </span>
        </div>
        <div className="relative h-2.5 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-brand-500 rounded-full"
            style={{ width: `${commitPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 border-r border-dashed border-brand-300 rounded-full opacity-70"
            style={{ width: `${bestCasePct}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] text-ink-500">
          <span>
            Forecast confidence:{" "}
            <span className="font-semibold text-ink-800">
              {fmtPct(forecast.confidence)}
            </span>
          </span>
          <span className="text-[11px] text-ink-400">
            Updated 12 minutes ago
          </span>
        </div>
      </div>
    </Card>
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
    <div>
      <div className="h-eyebrow">{label}</div>
      <div className="text-lg font-semibold text-ink-900 mt-0.5">{value}</div>
      <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div>
    </div>
  );
}
