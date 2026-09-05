import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  FileStack,
  SearchCheck,
  ScrollText,
  BarChart3,
  ClipboardList,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/claims", label: "Claims", icon: FileStack },
  { to: "/evidence-review", label: "Evidence Review", icon: SearchCheck },
  { to: "/policy-rules", label: "Policy Rules", icon: ScrollText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-navy-900 text-white flex flex-col transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-royal-500 to-indigo2-600 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="font-bold text-[15px] tracking-tight">ClaimShield AI</p>
          <p className="text-[10px] text-white/50 font-medium tracking-wide">
            CLAIMS INTELLIGENCE PLATFORM
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-royal-600 text-white shadow-card"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-royal-500/30 flex items-center justify-center font-semibold text-sm">
            CA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Claims Analyst</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Online
            </p>
          </div>
          <button
            className="text-white/50 hover:text-white transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
