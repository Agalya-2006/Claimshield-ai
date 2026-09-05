import { Bell, Menu } from "lucide-react";

export default function Header({ title, breadcrumb, aiOnline, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-surface-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden text-navy-900 shrink-0"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-navy-900 truncate">{title}</h1>
            {breadcrumb && (
              <p className="text-xs text-slate-400 font-medium truncate">{breadcrumb}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              aiOnline
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${aiOnline ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            {aiOnline ? "AI ENGINE ONLINE" : "AI ENGINE DEGRADED"}
          </div>

          <button
            className="relative text-slate-400 hover:text-navy-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-royal-500" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-semibold">
              CA
            </div>
            <span className="hidden md:inline text-sm font-medium text-navy-900">
              Claims Analyst
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
