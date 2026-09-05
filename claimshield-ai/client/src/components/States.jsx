import { Loader2, AlertTriangle, Inbox } from "lucide-react";

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
      <Loader2 className="animate-spin text-royal-500" size={28} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Unable to load claim data. Please try again." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-status-rejectedBg flex items-center justify-center">
        <AlertTriangle className="text-status-rejected" size={22} />
      </div>
      <p className="text-sm font-semibold text-navy-900">{message}</p>
    </div>
  );
}

export function EmptyState({ message = "No claims found", sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <Inbox className="text-slate-400" size={22} />
      </div>
      <p className="text-sm font-semibold text-navy-900">{message}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function AiUnavailableBanner() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-800">
      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold">AI reasoning service unavailable</p>
        <p className="text-amber-700/90">
          Deterministic policy checks remain available. The decision below was produced entirely
          by the rule-based engine, without AI-generated explanation.
        </p>
      </div>
    </div>
  );
}
