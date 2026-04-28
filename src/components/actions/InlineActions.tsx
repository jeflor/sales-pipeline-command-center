import {
  Phone,
  Mail,
  StickyNote,
  CalendarClock,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  MoreHorizontal,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "../../state/DataStore";
import { useAppState } from "../../state/AppState";
import { useToast } from "../../state/Toaster";
import type { Lead } from "../../data/types";

type Variant = "compact" | "full";

export function InlineActions({
  lead,
  variant = "compact",
}: {
  lead: Lead;
  variant?: Variant;
}) {
  const store = useStore();
  const { currentUserId, openQuickLog, openAI, openLead } = useAppState();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const quickCall = (e: React.MouseEvent) => {
    stop(e);
    openQuickLog({ leadId: lead.id, initialMode: "call" });
  };
  const quickEmail = (e: React.MouseEvent) => {
    stop(e);
    openQuickLog({ leadId: lead.id, initialMode: "email" });
  };
  const quickNote = (e: React.MouseEvent) => {
    stop(e);
    openQuickLog({ leadId: lead.id, initialMode: "note" });
  };
  const quickTask = (e: React.MouseEvent) => {
    stop(e);
    openQuickLog({ leadId: lead.id, initialMode: "task" });
  };
  const aiAssist = (e: React.MouseEvent) => {
    stop(e);
    openAI(lead.id);
  };
  const scheduleTouch = (e: React.MouseEvent, days: number) => {
    stop(e);
    store.scheduleNextTouch({
      leadId: lead.id,
      actorId: currentUserId,
      inDays: days,
    });
    toast.success(
      `Next touch scheduled · ${days === 0 ? "today" : `in ${days}d`}`,
      { label: "Open lead", onClick: () => openLead(lead.id) },
    );
    setMenuOpen(false);
  };
  const markBlocked = (e: React.MouseEvent) => {
    stop(e);
    store.markBlocked({
      leadId: lead.id,
      actorId: currentUserId,
      kind: "no_response",
      label: "No response · 5+ days",
    });
    toast.warning("Marked blocked · No response · 5+ days");
    setMenuOpen(false);
  };
  const escalate = (e: React.MouseEvent) => {
    stop(e);
    store.escalateDeal({
      leadId: lead.id,
      actorId: currentUserId,
      reason: lead.recommendedAction,
    });
    toast.success(`Escalated to manager · ${lead.company}`, {
      label: "Open lead",
      onClick: () => openLead(lead.id),
    });
    setMenuOpen(false);
  };

  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-0.5">
        <IconButton title="Log call" onClick={quickCall} icon={Phone} />
        <IconButton title="Log email" onClick={quickEmail} icon={Mail} />
        <IconButton title="Add note" onClick={quickNote} icon={StickyNote} />
        <IconButton
          title="AI assist"
          onClick={aiAssist}
          icon={Sparkles}
          tone="brand"
        />
        <div className="relative">
          <IconButton
            title="More actions"
            onClick={(e) => {
              stop(e);
              setMenuOpen((v) => !v);
            }}
            icon={MoreHorizontal}
          />
          {menuOpen && (
            <div
              onClick={stop}
              className="absolute right-0 mt-1 w-56 bg-white border border-ink-200 rounded-lg shadow-pop z-30 py-1"
            >
              <MenuItem icon={CheckCircle2} onClick={quickTask}>
                New task
              </MenuItem>
              <MenuItem
                icon={CalendarClock}
                onClick={(e) => scheduleTouch(e, 0)}
              >
                Schedule touch · today
              </MenuItem>
              <MenuItem
                icon={CalendarClock}
                onClick={(e) => scheduleTouch(e, 1)}
              >
                Schedule touch · tomorrow
              </MenuItem>
              <MenuItem
                icon={CalendarClock}
                onClick={(e) => scheduleTouch(e, 3)}
              >
                Schedule touch · in 3 days
              </MenuItem>
              <div className="my-1 border-t border-ink-100" />
              <MenuItem
                icon={AlertOctagon}
                onClick={markBlocked}
                tone="warning"
              >
                Mark blocked
              </MenuItem>
              <MenuItem
                icon={ShieldAlert}
                onClick={escalate}
                tone="danger"
              >
                Escalate to manager
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <FullButton onClick={quickCall} icon={Phone}>
        Log call
      </FullButton>
      <FullButton onClick={quickEmail} icon={Mail}>
        Email
      </FullButton>
      <FullButton onClick={quickNote} icon={StickyNote}>
        Note
      </FullButton>
      <FullButton onClick={quickTask} icon={CheckCircle2}>
        Task
      </FullButton>
      <FullButton onClick={(e) => scheduleTouch(e, 1)} icon={CalendarClock}>
        +1d touch
      </FullButton>
      <FullButton onClick={markBlocked} icon={AlertOctagon} tone="warning">
        Block
      </FullButton>
      <FullButton onClick={escalate} icon={TrendingUp} tone="danger">
        Escalate
      </FullButton>
      <FullButton onClick={aiAssist} icon={Sparkles} tone="brand">
        AI
      </FullButton>
    </div>
  );
}

function IconButton({
  icon: Icon,
  title,
  onClick,
  tone,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  tone?: "brand";
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-ink-100 transition-colors ${
        tone === "brand" ? "text-brand-600" : "text-ink-500"
      } hover:text-ink-900`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function FullButton({
  icon: Icon,
  children,
  onClick,
  tone,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  tone?: "brand" | "warning" | "danger";
}) {
  const toneClass =
    tone === "brand"
      ? "text-brand-700 border-brand-200 hover:bg-brand-50"
      : tone === "warning"
        ? "text-warning-700 border-warning-200 hover:bg-warning-50"
        : tone === "danger"
          ? "text-danger-700 border-danger-200 hover:bg-danger-50"
          : "text-ink-700 border-ink-200 hover:bg-ink-50";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-medium border bg-white ${toneClass}`}
    >
      <Icon className="h-3 w-3" />
      {children}
    </button>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  tone,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
  onClick: (e: React.MouseEvent) => void;
  tone?: "warning" | "danger";
}) {
  const toneClass =
    tone === "warning"
      ? "text-warning-700"
      : tone === "danger"
        ? "text-danger-700"
        : "text-ink-700";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] hover:bg-ink-50 ${toneClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
