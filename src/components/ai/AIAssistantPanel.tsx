import { useEffect, useMemo, useState } from "react";
import {
  X,
  Sparkles,
  Mail,
  ShieldAlert,
  Compass,
  Repeat,
  ScrollText,
  MessageCircleQuestion,
  Send,
  Copy,
  Check,
} from "lucide-react";
import { useAppState } from "../../state/AppState";
import { leads, leadsById } from "../../data/leads";
import { Avatar } from "../ui/Avatar";
import { fmtMoney } from "../../lib/format";

type Action =
  | "draft_followup"
  | "summarize_risk"
  | "next_action"
  | "reengage"
  | "summarize_history"
  | "objections";

type Msg = {
  id: string;
  role: "user" | "assistant";
  body: string;
  meta?: string;
};

const actionMeta: Record<
  Action,
  {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    chip: string;
  }
> = {
  draft_followup: { label: "Draft follow-up email", icon: Mail, chip: "Email" },
  summarize_risk: {
    label: "Summarize deal risk",
    icon: ShieldAlert,
    chip: "Risk",
  },
  next_action: {
    label: "Suggest next best action",
    icon: Compass,
    chip: "Action",
  },
  reengage: {
    label: "Generate re-engagement message",
    icon: Repeat,
    chip: "Re-engage",
  },
  summarize_history: {
    label: "Summarize lead history",
    icon: ScrollText,
    chip: "History",
  },
  objections: {
    label: "Identify likely objections",
    icon: MessageCircleQuestion,
    chip: "Objections",
  },
};

function generateOutput(action: Action, leadId: string | null): string {
  const lead = leadId ? leadsById[leadId] : null;
  if (!lead) {
    // No-context fallback uses team-wide insight
    if (action === "next_action")
      return [
        "Three highest-leverage moves across your active pipeline:",
        "",
        "1. Helix Robotics ($84k) — Avery hasn't replied in 6 days and the close date is 9 days out. Direct call within 2 hours, then escalate the MSA review to legal.",
        "2. Aldridge Manufacturing ($128k) — 12 days inactive on your largest top-of-funnel deal. Send a tight ROI re-engage referencing Theo's summit comments.",
        "3. Pacific Ridge Logistics ($72k) — competing vendor in eval; lead with multi-site rollout speed, not feature parity.",
        "",
        "Doing all three this week pushes ~$284k of pipeline forward.",
      ].join("\n");
    return "Open a specific lead to get a tailored draft. From the Priority Queue or Pipeline view, click any deal and re-open the assistant — output will be grounded in that deal's history.";
  }
  switch (action) {
    case "draft_followup":
      return [
        `Subject: Quick follow-up on ${lead.company} — next steps`,
        "",
        `Hi ${lead.name.split(" ")[0]},`,
        "",
        `Following up on where we left things — I want to make it easy for you to bring this across the finish line on the ${new Date(lead.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} timeline you mentioned.`,
        "",
        lead.stage === "negotiation"
          ? `On the contract side, I've flagged the open redlines internally and can have a redline turn back to you within 24 hours. If your team prefers a 20-minute call with our counsel, I'm happy to set that up this week.`
          : `Based on what your team flagged on our last call, I put together a one-pager covering the two questions you raised (attached). Happy to walk through it live or just answer async — whichever is least friction for ${lead.company}.`,
        "",
        "Is Thursday or Friday afternoon better for a 20-minute working session?",
        "",
        "Best,",
        "Morgan",
      ].join("\n");
    case "summarize_risk":
      return [
        `${lead.company} risk read · confidence ${lead.confidence}%`,
        "",
        `Top risks:`,
        `• ${lead.reasonSurfaced}`,
        `• ${lead.daysInactive >= 7 ? `${lead.daysInactive} days of silence — well above the ${lead.stage} stage average of 3.4 days` : "Cycle time is on track for stage average"}`,
        `• ${lead.value >= 80000 ? "High-value deal — exec sponsor engagement is critical" : "Mid-market motion — speed of follow-up is the dominant variable"}`,
        "",
        `Mitigations to take this week:`,
        `1. ${lead.recommendedAction}`,
        `2. Confirm the economic buyer in writing`,
        `3. Pre-empt one objection (pricing OR security) before they ask`,
        "",
        `If no progress by EOW, escalate to manager review.`,
      ].join("\n");
    case "next_action":
      return [
        `Recommended next move for ${lead.company}:`,
        "",
        `→ ${lead.recommendedAction}`,
        "",
        `Why this and not something else:`,
        `${lead.aiSummary}`,
        "",
        `Time-to-execute: ~${lead.urgencyScore >= 70 ? "30 minutes" : "2 hours"}.`,
        `Expected impact: pushes deal to ${lead.stage === "negotiation" || lead.stage === "proposal_sent" ? "Closed Won candidate" : "next stage"} within 5-7 days.`,
      ].join("\n");
    case "reengage":
      return [
        `Subject: ${lead.company} — picking back up where we left off`,
        "",
        `Hi ${lead.name.split(" ")[0]},`,
        "",
        `It's been a few days since I last sent over the ${lead.stage === "proposal_sent" ? "proposal" : "materials"} and I don't want it to fall off your radar.`,
        "",
        `When we last spoke, the ${lead.tags[0] ?? "core use case"} was the part you were most interested in pressure-testing. I have a 10-minute version of that walkthrough that I can do live this week, or I can send a 90-second Loom — whichever is easier on your end.`,
        "",
        `If timing has shifted, just let me know — happy to pause the thread and pick it up at a better moment.`,
        "",
        "Best,",
        "Morgan",
      ].join("\n");
    case "summarize_history":
      return [
        `${lead.company} · ${lead.id} · history at a glance`,
        "",
        `• Created ${new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} from ${lead.source}`,
        `• Currently in ${lead.stage.replace("_", " ")} — ${lead.daysInactive} days since last touch`,
        `• Total touches: ~14 across email, calls, and meetings`,
        `• Stakeholders surfaced: ${lead.name} (${lead.title})${lead.value >= 80000 ? " + 2 additional from procurement/legal" : ""}`,
        `• Key concession asked for: ${lead.tags.find((t) => t.includes("pilot")) ? "extended pilot terms" : lead.tags.find((t) => t.includes("MSA")) ? "MSA redlines" : "ROI evidence + references"}`,
        "",
        `One-line: ${lead.aiSummary.split(".")[0]}.`,
      ].join("\n");
    case "objections":
      return [
        `Likely objections from ${lead.name} at ${lead.company}:`,
        "",
        `1. Pricing — particularly second-year ramp clauses. They've previously asked for value-based discounting at this stage.`,
        `2. Implementation timeline — ${lead.industry} buyers in this size band typically require ${lead.value > 60000 ? "8–12" : "4–6"} weeks to onboard.`,
        `3. Internal champion bandwidth — ${lead.tags.find((t) => t.includes("champion")) ? "champion is identified but not heavily resourced" : "no clear champion has been confirmed yet"}.`,
        "",
        `Pre-empts to consider:`,
        `• Send a price-locked option (annual prepay) ahead of the call`,
        `• Include a tightened 4-week onboarding plan tailored to ${lead.industry}`,
        `• Offer to staff a CSM pre-sale to take some champion load`,
      ].join("\n");
  }
}

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

export function AIAssistantPanel() {
  const { ai, closeAI } = useAppState();
  const lead = ai.contextLeadId ? leadsById[ai.contextLeadId] : null;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);

  // Reset thread on context change
  useEffect(() => {
    if (!ai.open) return;
    setMessages([
      {
        id: newId(),
        role: "assistant",
        body: lead
          ? `I've loaded the full history for ${lead.company}. I can draft an email, summarize risk, or suggest the next best move. What would you like?`
          : "Hi — ask me anything about your pipeline. I can draft follow-ups, summarize deal risk, or identify which deals deserve your attention this week.",
        meta: lead ? `Context: ${lead.company} · ${lead.id}` : "Pipeline-wide",
      },
    ]);
  }, [ai.open, ai.contextLeadId, lead]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAI();
    };
    if (ai.open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ai.open, closeAI]);

  const runAction = (a: Action) => {
    const meta = actionMeta[a];
    setMessages((m) => [
      ...m,
      {
        id: newId(),
        role: "user",
        body: meta.label,
      },
    ]);
    setGenerating(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "assistant",
          body: generateOutput(a, ai.contextLeadId),
          meta: lead ? `${meta.chip} · ${lead.company}` : meta.chip,
        },
      ]);
      setGenerating(false);
    }, 700);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { id: newId(), role: "user", body: text }]);
    setInput("");
    setGenerating(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: "assistant",
          body: lead
            ? `Working from ${lead.company} context, here's what I'd do: ${lead.recommendedAction}. ${lead.aiSummary}`
            : `Across your open pipeline, the highest-leverage focus this week is your top 3 stalled deals — together about $284k. Want me to draft a touch for each?`,
          meta: lead ? `Reply · ${lead.company}` : "Reply",
        },
      ]);
      setGenerating(false);
    }, 700);
  };

  const suggestedDeals = useMemo(
    () =>
      [...leads]
        .filter(
          (l) => l.stage !== "closed_won" && l.stage !== "closed_lost",
        )
        .sort((a, b) => b.urgencyScore - a.urgencyScore)
        .slice(0, 3),
    [],
  );

  if (!ai.open) return null;

  return (
    <>
      <div
        onClick={closeAI}
        className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-40"
      />
      <aside className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white shadow-drawer z-50 flex flex-col">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-ink-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink-900 leading-tight">
                  AI Sales Copilot
                </div>
                <div className="text-[11px] text-ink-500">
                  {lead
                    ? `Context: ${lead.company} · ${fmtMoney(lead.value)}`
                    : "Pipeline-wide context"}
                </div>
              </div>
            </div>
            <button
              onClick={closeAI}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-ink-100 text-ink-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-5 py-3 border-b border-ink-200">
          <div className="h-eyebrow mb-2">Quick actions</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(actionMeta) as Action[]).map((a) => {
              const meta = actionMeta[a];
              const Icon = meta.icon;
              return (
                <button
                  key={a}
                  onClick={() => runAction(a)}
                  className="flex items-center gap-2 text-left px-2.5 py-2 rounded-lg border border-ink-200 hover:border-brand-300 hover:bg-brand-50/40 transition-colors text-[12px]"
                >
                  <Icon className="h-3.5 w-3.5 text-brand-600" />
                  <span className="text-ink-800 font-medium leading-tight">
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-ink-50/40">
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {generating && (
            <div className="flex items-start gap-2.5">
              <span className="h-7 w-7 rounded-md bg-brand-600 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="bg-white border border-ink-200 rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                <Dot />
                <Dot delay={120} />
                <Dot delay={240} />
              </div>
            </div>
          )}

          {!lead && messages.length <= 1 && (
            <div>
              <div className="h-eyebrow mb-2">Suggested deals</div>
              <div className="space-y-1.5">
                {suggestedDeals.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white border border-ink-200 hover:border-brand-300 transition-colors text-left"
                  >
                    <Avatar ownerId={d.ownerId} size="xs" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium text-ink-900 truncate">
                        {d.name}
                        <span className="text-ink-400 font-normal">
                          {" "}
                          · {d.company}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-500 truncate">
                        {d.recommendedAction}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-ink-700">
                      {fmtMoney(d.value)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={send}
          className="px-5 pt-3 pb-4 border-t border-ink-200 bg-white"
        >
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(e);
                }
              }}
              rows={2}
              placeholder={
                lead
                  ? `Ask about ${lead.company}…`
                  : "Ask about your pipeline…"
              }
              className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 pr-10 text-[13px] text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-300"
            />
            <button
              type="submit"
              className="absolute right-1.5 bottom-1.5 h-7 w-7 inline-flex items-center justify-center rounded-md bg-brand-600 hover:bg-brand-700 text-white"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-400">
            <span>Demo assistant · responses are simulated</span>
            <span>⏎ to send · ⇧⏎ for newline</span>
          </div>
        </form>
      </aside>
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const [copied, setCopied] = useState(false);
  if (msg.role === "user") {
    return (
      <div className="flex items-start justify-end">
        <div className="max-w-[85%] bg-brand-600 text-white rounded-xl rounded-tr-sm px-3 py-2 text-[13px] shadow-sm">
          {msg.body}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <span className="h-7 w-7 rounded-md bg-brand-600 flex items-center justify-center shrink-0">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </span>
      <div className="max-w-[88%] flex-1">
        {msg.meta && (
          <div className="text-[10.5px] font-semibold text-brand-700 uppercase tracking-wider mb-1">
            {msg.meta}
          </div>
        )}
        <div className="bg-white border border-ink-200 rounded-xl rounded-tl-sm px-3 py-2 text-[13px] text-ink-800 whitespace-pre-wrap leading-relaxed">
          {msg.body}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(msg.body);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="text-[11px] inline-flex items-center gap-1 text-ink-500 hover:text-ink-800"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            className="text-[11px] text-ink-500 hover:text-ink-800"
          >
            Insert into email
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-ink-300 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
