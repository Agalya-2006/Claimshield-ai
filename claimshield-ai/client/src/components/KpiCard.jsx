import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({ icon: Icon, label, value, trend, trendDirection = "up", sub, accent }) {
  return (
    <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-5 flex flex-col gap-3 fade-in-up">
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent?.bg || "#eff6ff" }}
        >
          <Icon size={19} style={{ color: accent?.fg || "#2952e3" }} strokeWidth={2.2} />
        </div>
        {trend != null && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              trendDirection === "up" ? "text-status-approved" : "text-status-rejected"
            }`}
          >
            {trendDirection === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-navy-900 tracking-tight">{value}</p>
        <p className="text-sm font-semibold text-slate-500 mt-0.5">{label}</p>
      </div>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
