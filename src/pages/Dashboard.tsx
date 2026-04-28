import { Calendar, Filter, Sparkles } from "lucide-react";
import { Kpi } from "../components/dashboard/KpiCards";
import { PipelineFunnel } from "../components/dashboard/PipelineFunnel";
import { PriorityQueue } from "../components/dashboard/PriorityQueue";
import { StaleWatchlist } from "../components/dashboard/StaleWatchlist";
import { ActivityTimeline } from "../components/dashboard/ActivityTimeline";
import { RepLeaderboard } from "../components/dashboard/RepLeaderboard";
import { ForecastCard } from "../components/dashboard/ForecastCard";
import { useAppState } from "../state/AppState";
import { leads } from "../data/leads";
import { tasks } from "../data/activities";
import { fmtMoney } from "../lib/format";

export function DashboardPage() {
  const { role, currentUserId, currentUser, openAI } = useAppState();

  const owned =
    role === "rep"
      ? leads.filter((l) => l.ownerId === currentUserId)
      : leads;

  const open = owned.filter(
    (l) => l.stage !== "closed_won" && l.stage !== "closed_lost",
  );
  const totalPipeline = open.reduce((s, l) => s + l.value, 0);

  // Closing this month — close date within next 30 days
  const now = new Date("2026-04-28T15:00:00.000Z").getTime();
  const closingThisMonth = open.filter((l) => {
    const t = new Date(l.closeDate).getTime();
    return t - now <= 30 * 86400000 && t - now >= 0;
  });
  const closingValue = closingThisMonth.reduce((s, l) => s + l.value, 0);

  const overdueTasks = tasks.filter(
    (t) =>
      !t.done &&
      new Date(t.due).getTime() < now &&
      (role === "manager" || t.ownerId === currentUserId),
  );

  // Recent closes for win-rate
  const recent = owned.filter((l) => l.closedAt);
  const wins = recent.filter((l) => l.stage === "closed_won");
  const winRate = recent.length
    ? Math.round((wins.length / recent.length) * 100)
    : 0;

  // Sales cycle: avg days from createdAt to closedAt for wins
  const winCycles = wins
    .filter((l) => l.closedAt)
    .map(
      (l) =>
        (new Date(l.closedAt!).getTime() -
          new Date(l.createdAt).getTime()) /
        86400000,
    );
  const avgCycle = winCycles.length
    ? Math.round(winCycles.reduce((a, b) => a + b, 0) / winCycles.length)
    : 0;

  const stalled = open.filter((l) => l.daysInactive >= 5).length;

  // Sparkline mocks (small but distinctive shapes)
  const sparkUp = [40, 42, 41, 48, 52, 50, 58].map((v) => ({ v }));
  const sparkDown = [62, 58, 55, 50, 48, 44, 41].map((v) => ({ v }));
  const sparkFlat = [40, 41, 42, 41, 43, 42, 42].map((v) => ({ v }));
  const sparkSpike = [21, 24, 25, 28, 32, 35, 41].map((v) => ({ v }));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[12px] text-ink-500">
            {role === "manager"
              ? `Welcome back, ${currentUser.name.split(" ")[0]} · Sales Manager view`
              : `Welcome back, ${currentUser.name.split(" ")[0]} · Account Executive view`}
          </div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            {role === "manager"
              ? "Team revenue command"
              : "Today's command deck"}
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {role === "manager"
              ? "Coverage, attainment, and pipeline health across the team."
              : "Your highest-leverage actions, prioritized by urgency and deal value."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" type="button">
            <Calendar className="h-4 w-4" />
            Last 30 days
          </button>
          <button className="btn-secondary" type="button">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => openAI(null)}
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi
          label="Total pipeline"
          value={fmtMoney(totalPipeline)}
          sub={`${open.length} open deals`}
          trend={{ delta: 8.4, label: "vs. last 30 days" }}
          spark={sparkUp}
          accent="#3a62ee"
        />
        <Kpi
          label="Closing this month"
          value={fmtMoney(closingValue)}
          sub={`${closingThisMonth.length} deals · within 30d`}
          trend={{ delta: 12.1, label: "vs. last month" }}
          spark={sparkSpike}
          accent="#10b981"
        />
        <Kpi
          label="Overdue follow-ups"
          value={String(overdueTasks.length)}
          sub="Tasks past due date"
          trend={{ delta: 3, label: "+3 vs. yesterday", good: "down" }}
          spark={sparkFlat}
          accent="#ef4444"
        />
        <Kpi
          label="Win rate"
          value={`${winRate}%`}
          sub={`${wins.length} of ${recent.length} recent`}
          trend={{ delta: 4.2, label: "vs. trailing 90d" }}
          spark={sparkUp}
          accent="#10b981"
        />
        <Kpi
          label="Avg sales cycle"
          value={`${avgCycle}d`}
          sub="From created to won"
          trend={{ delta: 2.3, label: "vs. trailing 90d", good: "down" }}
          spark={sparkDown}
          accent="#3a62ee"
        />
        <Kpi
          label="Stalled deals"
          value={String(stalled)}
          sub="No activity in 5+ days"
          trend={{ delta: 1.7, label: "vs. last week", good: "down" }}
          spark={sparkFlat}
          accent="#f59e0b"
        />
      </div>

      {/* Manager-only forecast row */}
      {role === "manager" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ForecastCard />
          </div>
          <RepLeaderboard />
        </div>
      )}

      {/* Funnel + Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PipelineFunnel />
        </div>
        <PriorityQueue />
      </div>

      {/* Stale + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <StaleWatchlist />
        </div>
        <ActivityTimeline />
      </div>
    </div>
  );
}
