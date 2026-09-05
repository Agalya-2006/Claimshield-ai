import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/States.jsx";

const PAGE_SIZE = 6;
const DECISIONS = ["APPROVED", "REJECTED", "REQUEST_INFORMATION", "ESCALATE"];
const EVIDENCE_STATES = ["Complete", "Incomplete"];

export default function Claims({ evidenceMode = false }) {
  const [claims, setClaims] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("ALL");
  const [evidenceFilter, setEvidenceFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .claims()
      .then((d) => setClaims(d.claims))
      .catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!claims) return [];
    let rows = claims.filter(
      (c) =>
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.customer.toLowerCase().includes(search.toLowerCase()) ||
        c.vehicle.toLowerCase().includes(search.toLowerCase())
    );
    if (decisionFilter !== "ALL") rows = rows.filter((c) => c.finalDecision === decisionFilter);
    if (evidenceFilter !== "ALL") rows = rows.filter((c) => c.evidenceStatus === evidenceFilter);

    rows = [...rows].sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.incidentDate) - new Date(a.incidentDate);
        case "date_asc":
          return new Date(a.incidentDate) - new Date(b.incidentDate);
        case "amount_desc":
          return b.claimAmount - a.claimAmount;
        case "amount_asc":
          return a.claimAmount - b.claimAmount;
        default:
          return 0;
      }
    });
    return rows;
  }, [claims, search, decisionFilter, evidenceFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error) return <ErrorState message={error} />;
  if (!claims) return <LoadingState message="Loading claims..." />;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by claim ID, customer, or vehicle..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500"
            />
          </div>

          <select
            value={decisionFilter}
            onChange={(e) => {
              setDecisionFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm rounded-lg border border-surface-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-500/30 text-slate-600"
          >
            <option value="ALL">All Decisions</option>
            {DECISIONS.map((d) => (
              <option key={d} value={d}>
                {d.replace("_", " ")}
              </option>
            ))}
          </select>

          {evidenceMode && (
            <select
              value={evidenceFilter}
              onChange={(e) => {
                setEvidenceFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm rounded-lg border border-surface-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-500/30 text-slate-600"
            >
              <option value="ALL">All Evidence States</option>
              {EVIDENCE_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm rounded-lg border border-surface-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal-500/30 text-slate-600"
          >
            <option value="date_desc">Newest incident first</option>
            <option value="date_asc">Oldest incident first</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-auto">
            <SlidersHorizontal size={13} />
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl2 border border-surface-border shadow-card overflow-hidden">
        {paged.length === 0 ? (
          <EmptyState message="No claims found" sub="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-surface-border">
                  <th className="px-5 py-3 font-semibold">Claim ID</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Vehicle</th>
                  <th className="px-5 py-3 font-semibold">Incident Date</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Evidence Status</th>
                  <th className="px-5 py-3 font-semibold">AI Recommendation</th>
                  <th className="px-5 py-3 font-semibold">Final Decision</th>
                  <th className="px-5 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-surface-border last:border-0 hover:bg-surface-bg/60"
                  >
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
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.finalDecision} size="sm" />
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
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-surface-border">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-surface-border disabled:opacity-40 hover:bg-surface-bg"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-surface-border disabled:opacity-40 hover:bg-surface-bg"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
