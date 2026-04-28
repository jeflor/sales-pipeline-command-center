import { ChevronRight, Phone, Mail, Sparkles, AlertTriangle, Wand2 } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { useStore } from "../../state/DataStore";
import { fmtMoney } from "../../lib/format";
import { useAppState } from "../../state/AppState";
import { useToast } from "../../state/Toaster";
import { STAGES } from "../../data/types";
import { InlineActions } from "../actions/InlineActions";
import {
  BlockerPills,
  UnreadEmailPill,
} from "../signals/SignalPills";

const stageLabel = (id: string) =>
  STAGES.find((s) => s.id === id)?.label ?? id;

function actionIcon(action: string) {
  if (action.toLowerCase().startsWith("call")) return Phone;
  if (action.toLowerCase().startsWith("send")) return Mail;
  if (action.toLowerCase().startsWith("re-engage")) return AlertTriangle;
  return Sparkles;
}

export function PriorityQueue() {
  const { role, currentUserId, openLead } = useAppState();
  const store = useStore();
  const toast = useToast();
  const pool = store.leads.filter(
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
            ? "Ranked by urgency, deal value, and inactivity. Act inline — no need to leave this view."
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
            <li
              key={l.id}
              className="px-1 py-2.5 hover:bg-ink-50/60 rounded-md group cursor-pointer"
              onClick={() => openLead(l.id)}
            >
              <div className="flex items-start gap-3">
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
                    <UnreadEmailPill lead={l} />
                  </div>
                  <div className="mt-1 text-[12.5px] text-ink-500 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-ink-400" />
                    <span className="font-medium text-ink-800">
                      {l.recommendedAction}
                    </span>
                  </div>
                  {l.blockers.length > 0 && (
                    <div className="mt-1.5">
                      <BlockerPills lead={l} max={2} />
                    </div>
                  )}
                  <div className="mt-1 text-[11px] text-ink-400">
                    {l.reasonSurfaced}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <div className="text-[13px] font-semibold text-ink-900">
                    {fmtMoney(l.value)}
                  </div>
                  {role === "manager" && (
                    <Avatar ownerId={l.ownerId} size="xs" />
                  )}
                  <ChevronRight className="h-4 w-4 text-ink-300 mt-1" />
                </div>
              </div>

              {/* Inline action row — appears below content, hover-prominent */}
              <div className="mt-2 ml-7 flex items-center justify-between">
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  <InlineActions lead={l} variant="compact" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // 1-click: log a quick "Followed up" + advance touch — fastest action
                    store.logEmail({
                      leadId: l.id,
                      actorId: currentUserId,
                      subject: `Following up · ${l.company}`,
                    });
                    store.scheduleNextTouch({
                      leadId: l.id,
                      actorId: currentUserId,
                      inDays: 2,
                    });
                    toast.success(
                      `Logged touch + scheduled +2d · ${l.company}`,
                      {
                        label: "Open",
                        onClick: () => openLead(l.id),
                      },
                    );
                  }}
                  className="text-[11px] font-semibold text-brand-700 inline-flex items-center gap-1 hover:underline"
                >
                  <Wand2 className="h-3 w-3" />
                  Do recommended action
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
