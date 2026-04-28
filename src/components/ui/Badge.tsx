import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "badge-neutral",
  brand: "badge-brand",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
};

export function Badge({
  tone = "neutral",
  children,
  dot,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={toneClass[tone]}>
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            tone === "success"
              ? "bg-success-500"
              : tone === "warning"
                ? "bg-warning-500"
                : tone === "danger"
                  ? "bg-danger-500"
                  : tone === "brand"
                    ? "bg-brand-500"
                    : "bg-ink-400"
          }`}
        />
      )}
      {children}
    </span>
  );
}

export function RiskBadge({
  level,
}: {
  level: "low" | "medium" | "high" | "critical";
}) {
  const map: Record<typeof level, { tone: Tone; label: string }> = {
    low: { tone: "neutral", label: "Low risk" },
    medium: { tone: "warning", label: "Watch" },
    high: { tone: "danger", label: "At risk" },
    critical: { tone: "danger", label: "Critical" },
  } as const;
  const cfg = map[level];
  return (
    <Badge tone={cfg.tone} dot>
      {cfg.label}
    </Badge>
  );
}
