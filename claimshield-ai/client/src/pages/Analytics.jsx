import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "../api.js";
import { LoadingState, ErrorState } from "../components/States.jsx";

const DECISION_COLORS = {
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
  REQUEST_INFORMATION: "#d97706",
  ESCALATE: "#7c3aed",
};

const EVIDENCE_COLORS = { Complete: "#2952e3", Incomplete: "#d97706" };

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl2 border border-surface-border shadow-card p-5 ${className}`}>
      <p className="font-bold text-navy-900 mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .analytics()
      .then(setAnalytics)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!analytics) return <LoadingState message="Crunching analytics..." />;

  const decisionData = Object.entries(analytics.byDecision).map(([k, v]) => ({
    name: k.replace("_", " "),
    key: k,
    value: v,
  }));

  const evidenceData = Object.entries(analytics.byEvidenceStatus).map(([k, v]) => ({
    name: k,
    key: k,
    value: v,
  }));

  const approvedVsRejected = [
    { name: "Approved", value: analytics.byDecision.APPROVED || 0, fill: "#16a34a" },
    { name: "Rejected", value: analytics.byDecision.REJECTED || 0, fill: "#dc2626" },
  ];

  const escalationRate = analytics.totalClaims
    ? Math.round(((analytics.byDecision.ESCALATE || 0) / analytics.totalClaims) * 100)
    : 0;

  const rejectionReasons = Object.entries(analytics.rejectionReasons || {});

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">Escalation Rate</p>
          <p className="text-2xl font-extrabold text-navy-900">{escalationRate}%</p>
        </div>
        <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">Avg. Evidence Completeness</p>
          <p className="text-2xl font-extrabold text-navy-900">{analytics.avgCompleteness}%</p>
        </div>
        <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">Avg. Review Time</p>
          <p className="text-2xl font-extrabold text-navy-900">
            {analytics.avgReviewTimeMinutes}m
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Claims by Decision">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={decisionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {decisionData.map((d) => (
                  <Cell key={d.key} fill={DECISION_COLORS[d.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Claims by Evidence Status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={evidenceData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
              >
                {evidenceData.map((d) => (
                  <Cell key={d.key} fill={EVIDENCE_COLORS[d.key]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Approval vs Rejection">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={approvedVsRejected} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f2" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#0f1c3f" }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {approvedVsRejected.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Common Rejection Reasons">
          {rejectionReasons.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No rejected claims yet.</p>
          ) : (
            <div className="space-y-3">
              {rejectionReasons.map(([reason, count], i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="bg-status-rejectedBg text-status-rejected font-bold text-xs px-2 py-0.5 rounded-full shrink-0">
                    {count}
                  </span>
                  <p className="text-slate-600">{reason}</p>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
