import { Card, CardHeader } from "../ui/Card";
import { useStore } from "../../state/DataStore";
import { reps } from "../../data/reps";
import { Avatar } from "../ui/Avatar";
import { fmtMoney } from "../../lib/format";
import { GraduationCap, MessageCircle, Sparkles } from "lucide-react";
import { useAppState } from "../../state/AppState";

type CoachingItem = {
  repId: string;
  why: string;
  topic: string;
  metric: string;
  metricValue: string;
};

export function CoachingCard() {
  const store = useStore();
  const { openAI } = useAppState();

  // Build derived coaching opportunities
  const items: CoachingItem[] = [];

  for (const r of reps.filter((x) => x.role === "rep")) {
    const owned = store.leads.filter(
      (l) =>
        l.ownerId === r.id &&
        l.stage !== "closed_won" &&
        l.stage !== "closed_lost",
    );
    const stalled = owned.filter((l) => l.daysInactive >= 7);
    const blocked = owned.filter((l) => l.blockers.length > 0);
    const propValue = owned
      .filter((l) => l.stage === "proposal_sent" || l.stage === "negotiation")
      .reduce((s, l) => s + l.value, 0);

    if (stalled.length >= 2) {
      items.push({
        repId: r.id,
        why: `${stalled.length} deals stalled 7+ days`,
        topic: "Re-engagement cadence · structured 3-touch follow-up",
        metric: "At risk",
        metricValue: fmtMoney(stalled.reduce((s, l) => s + l.value, 0)),
      });
    }
    if (blocked.length >= 1 && propValue > 50000) {
      items.push({
        repId: r.id,
        why: `${blocked.length} late-stage deals with active blockers`,
        topic: "Pre-empting procurement / legal pushback in negotiation",
        metric: "Blocked value",
        metricValue: fmtMoney(blocked.reduce((s, l) => s + l.value, 0)),
      });
    }
  }

  return (
    <Card>
      <CardHeader
        eyebrow="Coaching opportunities"
        title="Where 1:1s would move the needle"
        description="AI-surfaced coaching topics, ranked by deal value at stake."
        right={
          <span className="badge-brand">
            <Sparkles className="h-3 w-3" />
            AI-surfaced
          </span>
        }
      />
      {items.length === 0 ? (
        <div className="text-sm text-ink-500 py-4">
          No high-priority coaching topics this week.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 4).map((it, i) => {
            const r = reps.find((x) => x.id === it.repId)!;
            return (
              <li
                key={i}
                className="rounded-lg border border-ink-200 p-3 hover:border-brand-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar ownerId={r.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink-900">
                        {r.name}
                      </span>
                      <span className="text-[11px] text-ink-500">
                        · {it.why}
                      </span>
                    </div>
                    <div className="mt-1 text-[12.5px] text-ink-700 inline-flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-brand-600" />
                      <span className="font-medium">{it.topic}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-ink-400 uppercase tracking-wider font-semibold">
                      {it.metric}
                    </div>
                    <div className="text-[13px] font-semibold text-ink-900">
                      {it.metricValue}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    className="btn-secondary text-[11.5px] py-1 px-2"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Schedule 1:1
                  </button>
                  <button
                    type="button"
                    onClick={() => openAI(null)}
                    className="btn-secondary text-[11.5px] py-1 px-2 text-brand-700 border-brand-200"
                  >
                    <Sparkles className="h-3 w-3" />
                    Draft talking points
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
