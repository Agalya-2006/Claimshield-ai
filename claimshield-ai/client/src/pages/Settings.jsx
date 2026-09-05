import { useEffect, useState } from "react";
import { User, SlidersHorizontal, Cpu, Bell } from "lucide-react";
import { api } from "../api.js";

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-royal-50 flex items-center justify-center">
          <Icon size={16} className="text-royal-600" />
        </div>
        <p className="font-bold text-navy-900">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-navy-900">{value}</span>
    </div>
  );
}

function Toggle({ label, defaultChecked = true }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`w-10 h-5.5 rounded-full transition-colors relative ${on ? "bg-royal-500" : "bg-slate-200"}`}
        style={{ height: "22px" }}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const [aiOnline, setAiOnline] = useState(false);

  useEffect(() => {
    api
      .health()
      .then((h) => setAiOnline(h.aiEngine === "online"))
      .catch(() => setAiOnline(false));
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <SettingsSection icon={User} title="User Profile">
        <Row label="Name" value="Claims Analyst" />
        <Row label="Role" value="Senior Claims Analyst" />
        <Row label="Department" value="Motor Insurance Claims" />
        <Row label="Status" value="Online" />
      </SettingsSection>

      <SettingsSection icon={SlidersHorizontal} title="Application Settings">
        <Row label="Default Currency" value="INR (₹)" />
        <Row label="Date Format" value="DD/MM/YYYY" />
        <Row label="Table Page Size" value="6 rows" />
        <Toggle label="Compact table view" defaultChecked={false} />
      </SettingsSection>

      <SettingsSection icon={Cpu} title="AI Configuration">
        <Row label="Reasoning Model" value="Claude Sonnet" />
        <Row label="Engine Status" value={aiOnline ? "Online" : "Degraded (using deterministic fallback)"} />
        <Row label="Grounding Mode" value="Strict — evidence-only" />
        <Toggle label="Allow AI-generated explanations" defaultChecked={true} />
      </SettingsSection>

      <SettingsSection icon={Bell} title="Notification Preferences">
        <Toggle label="Notify on new escalations" defaultChecked={true} />
        <Toggle label="Notify on contradictions detected" defaultChecked={true} />
        <Toggle label="Daily summary email" defaultChecked={false} />
      </SettingsSection>
    </div>
  );
}
