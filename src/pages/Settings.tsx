import { Card, CardHeader } from "../components/ui/Card";
import { useAppState } from "../state/AppState";
import { Avatar } from "../components/ui/Avatar";
import { Bell, Plug, Sparkles, Shield, Users } from "lucide-react";

export function SettingsPage() {
  const { currentUser, role } = useAppState();
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          Workspace and preferences for your account.
        </p>
      </div>

      <Card>
        <CardHeader eyebrow="Profile" title="Account" />
        <div className="flex items-center gap-3">
          <Avatar ownerId={currentUser.id} size="lg" />
          <div>
            <div className="text-sm font-semibold text-ink-900">
              {currentUser.name}
            </div>
            <div className="text-[12px] text-ink-500">
              {currentUser.email} · {role === "manager" ? "Sales Manager" : "Account Executive"}
            </div>
          </div>
          <button className="btn-secondary ml-auto" type="button">
            Edit
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Notifications"
          title="What we ping you about"
        />
        <div className="space-y-2.5">
          <Toggle
            icon={Bell}
            label="Overdue follow-ups"
            sub="Daily 8am summary of tasks past due"
            on
          />
          <Toggle
            icon={Sparkles}
            label="AI-recommended actions"
            sub="When confidence to act > 70%"
            on
          />
          <Toggle
            icon={Shield}
            label="Stale deal alerts"
            sub="Trigger after 5 days of no activity"
            on
          />
          <Toggle
            icon={Users}
            label="Team activity digest"
            sub="Weekly Friday roundup"
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Integrations"
          title="Connected systems"
          description="Where your CRM data flows from."
        />
        <div className="space-y-2">
          <Integration label="HubSpot CRM" status="connected" detail="Syncing every 15 min · 12,482 contacts" />
          <Integration label="Gmail" status="connected" detail="Tracking opens & replies for the team" />
          <Integration label="Slack" status="connected" detail="Alerts in #revops-alerts" />
          <Integration label="Snowflake" status="not_connected" detail="For pipeline analytics warehouse" />
        </div>
      </Card>

      <Card>
        <CardHeader eyebrow="Workspace" title="Northwind RevOps" />
        <div className="text-[13px] text-ink-700 space-y-1">
          <div>
            <span className="text-ink-500">Plan:</span> Enterprise · 12 seats
          </div>
          <div>
            <span className="text-ink-500">Workspace ID:</span>{" "}
            <span className="font-mono text-[12px]">ws_n8j4k2lq</span>
          </div>
          <div>
            <span className="text-ink-500">Owner:</span> Jordan Reyes
          </div>
        </div>
      </Card>
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  sub,
  on,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  sub: string;
  on?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-ink-200 bg-white">
      <Icon className="h-4 w-4 text-ink-500" />
      <div className="flex-1">
        <div className="text-[13px] font-medium text-ink-800">{label}</div>
        <div className="text-[11.5px] text-ink-500">{sub}</div>
      </div>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          on ? "bg-brand-600" : "bg-ink-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            on ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </div>
  );
}

function Integration({
  label,
  status,
  detail,
}: {
  label: string;
  status: "connected" | "not_connected";
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-ink-200 bg-white">
      <Plug
        className={`h-4 w-4 ${
          status === "connected" ? "text-success-600" : "text-ink-400"
        }`}
      />
      <div className="flex-1">
        <div className="text-[13px] font-medium text-ink-800">{label}</div>
        <div className="text-[11.5px] text-ink-500">{detail}</div>
      </div>
      {status === "connected" ? (
        <span className="badge-success">Connected</span>
      ) : (
        <button className="btn-secondary text-[12px]" type="button">
          Connect
        </button>
      )}
    </div>
  );
}
