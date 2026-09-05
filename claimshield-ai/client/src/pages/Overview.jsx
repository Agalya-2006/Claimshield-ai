import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileStack,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import { api } from "../api.js";
import KpiCard from "../components/KpiCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { LoadingState, ErrorState } from "../components/States.jsx";

export default function Overview() {
  const [claims, setClaims] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([api.claims(), api.analytics()])
      .then(([c, a]) => {
        setClaims(c.claims);
        setAnalytics(a);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!claims || !analytics) return <LoadingState message="Loading dashboard..." />;

  const filtered = claims.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl2 bg-gradient-to-br from-navy-900 to-royal-600 text-white p-7 flex flex-col justify-between min-h-[190px] shadow-card">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">
              Intelligent Claims Review
            </h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-md">
              Review evidence, validate policy coverage, detect contradictions and make
              explainable claim decisions with AI.
            </p>
          </div>
          <div className="flex gap-3 mt-5">
            <Link
              to="/claims"
              className="bg-white text-navy-900 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              Review Claims
            </Link>
            <Link
              to="/analytics"
              className="bg-white/10 text-white text-sm font-semibold px-4 py-2.5 rounded-lg ring-1 ring-white/30 hover:bg-white/20 transition-colors"
            >
              View Analytics
            </Link>
          </div>
        </div>

        <div className="rounded-xl2 bg-white p-7 flex flex-col justify-between min-h-[190px] shadow-card border border-surface-border">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-navy-900">
              Evidence-driven decisions
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              Connect claim documents with policy clauses and surface missing or conflicting
              information before a decision is made.
            </p>
          </div>
          <Link
            to="/evidence-review"
            className="inline-flex items-center gap-2 text-royal-600 text-sm font-semibold mt-5 hover:gap-3 transition-all w-fit"
          >
            Open Investigation Center <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          icon={FileStack}
          label="Total Claims"
          value={analytics.totalClaims}
          sub="All submitted claims"
          accent={{ bg: "#eff6ff", fg: "#2952e3" }}
        />
        <KpiCard
          icon={CheckCircle2}
          label="Approved"
          value={analytics.byDecision.APPROVED || 0}
          sub="Fully approved"
          accent={{ bg: "#ecfdf3", fg: "#16a34a" }}
        />
        <KpiCard
          icon={XCircle}
          label="Rejected"
          value={analytics.byDecision.REJECTED || 0}
          sub="Excluded or denied"
          accent={{ bg: "#fef2f2", fg: "#dc2626" }}
        />
        <KpiCard
          icon={AlertCircle}
          label="Request Info"
          value={analytics.byDecision.REQUEST_INFORMATION || 0}
          sub="Awaiting documents"
          accent={{ bg: "#fffbeb", fg: "#d97706" }}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Escalated"
          value={analytics.byDecision.ESCALATE || 0}
          sub="Manual review needed"
          accent={{ bg: "#f5f3ff", fg: "#7c3aed" }}
        />
        <KpiCard
          icon={Clock}
          label="Avg Review Time"
          value={`${analytics.avgReviewTimeMinutes}m`}
          sub="Per claim"
          accent={{ bg: "#eff6ff", fg: "#2952e3" }}
        />
      </div>

      {/* Recent claims */}
      <div className="bg-white rounded-xl2 border border-surface-border shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h3 className="font-bold text-navy-900">Recent Claims</h3>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search claims..."
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500 w-44 sm:w-56"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-surface-border">
                <th className="px-5 py-3 font-semibold">Claim ID</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Vehicle</th>
                <th className="px-5 py-3 font-semibold">Incident Date</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Evidence</th>
                <th className="px-5 py-3 font-semibold">AI Recommendation</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 6).map((c) => (
                <tr key={c.id} className="border-b border-surface-border last:border-0 hover:bg-surface-bg/60">
                  <td className="px-5 py-3.5 font-semibold text-navy-900">{c.id}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.customer}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.vehicle}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.incidentDate}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-medium">
                    ₹{c.claimAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.evidenceStatus} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.aiRecommendation} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/claims/${c.id}`}
                      className="text-royal-600 font-semibold text-xs hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
