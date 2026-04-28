import {
  Search,
  Bell,
  Plus,
  Sparkles,
  ChevronDown,
  UserRound,
  Briefcase,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { Avatar } from "../ui/Avatar";

export function TopNav() {
  const { role, setRole, currentUser, openAI } = useAppState();
  return (
    <header className="h-14 border-b border-ink-200 bg-white/95 backdrop-blur sticky top-0 z-30 flex items-center px-4 gap-3">
      <div className="md:hidden flex items-center gap-2 mr-2">
        <div className="h-7 w-7 rounded-md bg-ink-900 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="h-4 w-4">
            <path
              d="M7 22 L13 14 L17 18 L25 9"
              stroke="#5a85fb"
              strokeWidth={2.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="25" cy="9" r="2.4" fill="#5a85fb" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-ink-900">
          Command Center
        </span>
      </div>

      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            placeholder="Search leads, companies, deals…"
            className="w-full pl-9 pr-16 h-9 rounded-lg bg-ink-50 border border-ink-200 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-300 focus:bg-white"
          />
          <kbd className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-ink-400 border border-ink-200 rounded px-1.5 py-0.5 bg-white">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Role toggle */}
        <div className="hidden sm:flex items-center bg-ink-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setRole("rep")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              role === "rep"
                ? "bg-white text-ink-900 shadow-card"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            <UserRound className="h-3.5 w-3.5" />
            Rep
          </button>
          <button
            type="button"
            onClick={() => setRole("manager")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              role === "manager"
                ? "bg-white text-ink-900 shadow-card"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Manager
          </button>
        </div>

        <button
          type="button"
          onClick={() => openAI(null)}
          className="hidden md:inline-flex btn-secondary"
          title="Open AI assistant"
        >
          <Sparkles className="h-4 w-4 text-brand-600" />
          AI
        </button>

        <button type="button" className="btn-primary hidden sm:inline-flex">
          <Plus className="h-4 w-4" />
          New deal
        </button>

        <button
          type="button"
          className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-600"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-ink-100"
        >
          <Avatar ownerId={currentUser.id} size="sm" />
          <span className="hidden lg:flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold text-ink-800">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-ink-400">
              {role === "manager" ? "Sales Manager" : "Account Executive"}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </button>
      </div>
    </header>
  );
}
