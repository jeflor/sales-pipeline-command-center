import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  KanbanSquare,
  CheckSquare,
  Users,
  Activity as ActivityIcon,
  BarChart3,
  Users2,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAppState } from "../../state/AppState";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/activity", label: "Activity", icon: ActivityIcon },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/team", label: "Team", icon: Users2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { openAI } = useAppState();
  return (
    <aside className="w-60 shrink-0 border-r border-ink-200 bg-ink-50 hidden md:flex flex-col">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-ink-200">
        <div className="h-8 w-8 rounded-lg bg-ink-900 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="h-5 w-5">
            <path
              d="M7 22 L13 14 L17 18 L25 9"
              stroke="#5a85fb"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="25" cy="9" r="2.4" fill="#5a85fb" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold text-ink-900">
            Northwind RevOps
          </span>
          <span className="text-[11px] text-ink-400">Command Center</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? "nav-item-active" : "nav-item"
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => openAI(null)}
          className="w-full flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5 text-left hover:bg-brand-100 transition-colors"
        >
          <span className="h-7 w-7 rounded-md bg-brand-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[12px] font-semibold text-brand-700">
              AI Sales Copilot
            </span>
            <span className="text-[11px] text-brand-700/70">
              Drafts, summaries, next moves
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
