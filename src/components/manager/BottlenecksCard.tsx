import { Card, CardHeader } from "../ui/Card";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { fmtMoney } from "../../lib/format";
import { AlertTriangle, ArrowRight, Snowflake, ScrollText, Ban, UserMinus } from "lucide-react";

const bottleneckMeta = [
  {
    kind: "legal_review",
    label: "Stuck in legal review",
    Icon: ScrollText,
    tone: "text-warning-700",
  },
  {
    kind: "champion_dark",
    label: "Champion went dark",
    Icon: UserMinus,
    tone: "text-danger-700",
  },
  {
    kind: "competitive",
    label: "Competitive eval",
    Icon: Ban,
    tone: "text-warning-700",
  },
  {
    kind: "procurement_freeze",
    label: "Procurement / budget freeze",
    Icon: Snowflake,
    tone: "text-ink-700",
  },
];

export function BottlenecksCard() {
  const store = useStore();
  const { openLead } = useAppState();
  const open = store.leads.filter(
    (l) => l.stage !== "closed_won" && l.stage !== "closed_lost",
  );

  const groups = bottleneckMeta
    .map((m) => {
      const items = open.filter((l) =>
        l.blockers.some((b) => b.kind === m.kind),
      );
      const total = items.reduce((s, l) => s + l.value, 0);
      return { ...m, items, total };
    })
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardHeader
        eyebrow="Bottlenecks"
        title="Where deals are stuck"
        description="Open pipeline at risk by blocker type. Click a row to drill in."
      />
      {groups.length === 0 ? (
        <div className="text-sm text-ink-500 py-4">
          No flagged blockers across the team. Healthy.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {groups.map((g) => (
            <li key={g.kind}>
              <details className="group rounded-lg border border-ink-200 hover:border-warning-200">
                <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center gap-2.5">
                  <span className={`h-7 w-7 rounded-md bg-ink-50 flex items-center justify-center ${g.tone}`}>
                    <g.Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink-900">
                      {g.label}
                    </div>
                    <div className="text-[11.5px] text-ink-500">
                      {g.items.length} deals · {fmtMoney(g.total)} at risk
                    </div>
                  </div>
                  <span className="text-[11px] text-ink-400 font-semibold inline-flex items-center gap-0.5 group-open:rotate-90 transition-transform">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </summary>
                <ul className="border-t border-ink-100 divide-y divide-ink-100">
                  {g.items.slice(0, 5).map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => openLead(l.id)}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-ink-50/40"
                      >
                        <AlertTriangle className="h-3 w-3 text-warning-500 shrink-0" />
                        <span className="text-[12.5px] text-ink-800 truncate flex-1">
                          {l.name}{" "}
                          <span className="text-ink-400 font-normal">
                            · {l.company}
                          </span>
                        </span>
                        <span className="text-[12px] text-ink-700 font-semibold">
                          {fmtMoney(l.value)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
