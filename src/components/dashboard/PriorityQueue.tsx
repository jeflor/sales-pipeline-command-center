import { ChevronRight, Phone, Mail, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { leads } from "../../data/leads";
import { fmtMoney } from "../../lib/format";
import { useAppState } from "../../state/AppState";
import { STAGES } from "../../data/types";

const stageLabel = (id: string) =>
  STAGES.find((s) => s.id === id)?.label ?? id;

function actionIcon(action: string) {
  if (action.toLowerCase().startsWith("call")) return Phone;
  if (action.toLowerCase().startsWith("send")) return Mail;
  if (action.toLowerCase().startsWith("re-engage")) return AlertTriangle;
  return Sparkles;
}

export function PriorityQueue() {
  const { role, currentUserId, openLead, openAI } = useAppState();
  const pool = leads.filter(
    (l) => l.stage !== "closed_won" && l.stage !== "closed_lost",
  );
  const filtered =
    role === "rep" ? pool.filter((l) => l.ownerId === currentUserId) : pool;
  const ranked = [...filtered]
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        eyebrow="Priority action queue"
        title={
          role === "rep"
            ? "What needs you now"
            : "Team-wide attention required"
        }
        description={
          role === "rep"
            ? "Ranked by urgency, deal value, and inactivity. Tackle these first."
            : "Highest-leverage interventions across the team's open pipeline."
        }
        right={
          <button className="btn-ghost text-[12px]" type="button">
            View all
          </button>
        }
      />
      <ul className="divide-y divide-ink-100 -mx-1">
        {ranked.map((l) => {
          const Icon = actionIcon(l.recommendedAction);
          return (
            <li key={l.id} className="px-1">
              <button
                type="button"
                onClick={() => openLead(l.id)}
                className="w-full text-left py-3 flex items-start gap-3 hover:bg-ink-50/60 rounded-md px-2 transition-colors group"
              >
                <div className="flex flex-col items-center pt-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 rounded ${
                      l.urgencyScore >= 80
                        ? "bg-danger-50 text-danger-700"
                        : l.urgencyScore >= 60
                          ? "bg-warning-50 text-warning-700"
                          : "bg-ink-100 text-ink-600"
                    }`}
                  >
                    {l.urgencyScore}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink-900 truncate">
                      {l.name}
                    </span>
                    <span className="text-[12px] text-ink-500 truncate">
                      · {l.company}
                    </span>
                    <Badge tone="neutral">{stageLabel(l.stage)}</Badge>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-ink-500 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-ink-400" />
                    <span className="font-medium text-ink-800">
                      {l.recommendedAction}
                    </span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-ink-400">
                    {l.reasonSurfaced}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-semibold text-ink-900">
                    {fmtMoney(l.value)}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    {role === "manager" && (
                      <Avatar ownerId={l.ownerId} size="xs" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAI(l.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] inline-flex items-center gap-1 text-brand-700 font-semibold"
                      title="Open AI assistant for this lead"
                    >
                      <Sparkles className="h-3 w-3" />
                      AI
                    </button>
                    <ChevronRight className="h-4 w-4 text-ink-400 group-hover:text-ink-600" />
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
