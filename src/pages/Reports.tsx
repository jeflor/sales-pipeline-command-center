import {
  ResponsiveContainer,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Line,
  Legend,
  ComposedChart,
} from "recharts";
import { Calendar, Download, Filter } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import {
  monthlyRevenue,
  winRateByRep,
  pipelineBySource,
  closeRateByStage,
  lostByReason,
  repActivity,
} from "../data/reports";
import { fmtMoney } from "../lib/format";

const palette = ["#3a62ee", "#5a85fb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5e9"];

export function ReportsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
            Reports
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Revenue, conversion, and team performance — last 6 months.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" type="button">
            <Calendar className="h-4 w-4" />
            FY26 · QTD
          </button>
          <button className="btn-secondary" type="button">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="btn-secondary" type="button">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              eyebrow="Monthly revenue"
              title="Booked revenue vs. target"
              description="Closed-won bookings against monthly target."
            />
            <div className="h-72">
              <ResponsiveContainer>
                <ComposedChart
                  data={monthlyRevenue}
                  margin={{ top: 10, right: 16, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3a62ee" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3a62ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef0f4" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#8d97aa"
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#8d97aa"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => fmtMoney(v as number)}
                    style={{ fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "#5e6878", fontSize: 11 }}
                    formatter={moneyFormatter}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="booked"
                    stroke="#3a62ee"
                    strokeWidth={2}
                    fill="url(#rev)"
                    name="Booked"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#8d97aa"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="Target"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            eyebrow="Win rate by rep"
            title="Conversion leaderboard"
          />
          <div className="space-y-3">
            {winRateByRep
              .slice()
              .sort((a, b) => b.winRate - a.winRate)
              .map((r) => (
                <div key={r.rep} className="">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="font-medium text-ink-800">{r.rep}</span>
                    <span className="text-ink-700 font-semibold">
                      {r.winRate}%{" "}
                      <span className="text-ink-400 font-normal">
                        · {r.deals} deals
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(r.winRate / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader
            eyebrow="Pipeline by source"
            title="Where deals come from"
          />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pipelineBySource}
                  dataKey="value"
                  nameKey="source"
                  innerRadius={50}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="#fff"
                >
                  {pipelineBySource.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={moneyFormatter} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-y-1 gap-x-3">
            {pipelineBySource.map((s, i) => (
              <div
                key={s.source}
                className="flex items-center gap-2 text-[11.5px]"
              >
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ background: palette[i % palette.length] }}
                />
                <span className="text-ink-600 truncate">{s.source}</span>
                <span className="ml-auto text-ink-800 font-medium">
                  {fmtMoney(s.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Close rate by stage"
            title="Conversion through the funnel"
          />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart
                data={closeRateByStage}
                margin={{ top: 10, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid stroke="#eef0f4" vertical={false} />
                <XAxis
                  dataKey="stage"
                  stroke="#8d97aa"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: 10 }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  stroke="#8d97aa"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  style={{ fontSize: 11 }}
                  width={40}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v}%`, "Close rate"]}
                />
                <Bar dataKey="rate" fill="#3a62ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Lost deals by reason"
            title="Top loss drivers"
          />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={lostByReason}
                margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
              >
                <CartesianGrid stroke="#eef0f4" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#8d97aa"
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="reason"
                  stroke="#8d97aa"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  style={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v} deals`, "Count"]}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          eyebrow="Rep activity"
          title="Calls, emails, and meetings · last 30 days"
          description="Activity is a leading indicator. Track to spot reps under-investing in their pipeline."
        />
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart
              data={repActivity}
              margin={{ top: 10, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke="#eef0f4" vertical={false} />
              <XAxis
                dataKey="rep"
                stroke="#8d97aa"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: 11 }}
              />
              <YAxis
                stroke="#8d97aa"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: 11 }}
                width={40}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="calls" fill="#3a62ee" radius={[4, 4, 0, 0]} />
              <Bar dataKey="emails" fill="#5a85fb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meetings" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #dde1e9",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 8px 24px -8px rgba(16,24,40,0.18)",
};

function moneyFormatter(value: unknown, name: unknown): [string, string] {
  const num = typeof value === "number" ? value : Number(value) || 0;
  return [fmtMoney(num), String(name ?? "")];
}
