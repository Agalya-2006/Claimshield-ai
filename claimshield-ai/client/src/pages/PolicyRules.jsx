import { useEffect, useState } from "react";
import { Search, ScrollText } from "lucide-react";
import { api } from "../api.js";
import { LoadingState, ErrorState, EmptyState } from "../components/States.jsx";

export default function PolicyRules() {
  const [policies, setPolicies] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .policies()
      .then((d) => setPolicies(d.policies))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!policies) return <LoadingState message="Loading policy rules..." />;

  const filtered = policies.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.number.includes(search) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search policy clauses..."
          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No matching clauses" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl2 border border-surface-border shadow-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-royal-50 flex items-center justify-center">
                  <ScrollText size={15} className="text-royal-600" />
                </div>
                <p className="text-xs font-bold text-royal-600">CLAUSE {p.number}</p>
              </div>
              <h3 className="font-bold text-navy-900 mb-1.5">{p.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{p.description}</p>

              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-400 mb-1.5">Required Evidence</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.requiredEvidence.map((e) => (
                    <span
                      key={e}
                      className="text-[11px] font-semibold bg-royal-50 text-royal-600 px-2 py-0.5 rounded-full"
                    >
                      {e.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1.5">Exclusions</p>
                <ul className="space-y-1">
                  {p.exclusions.map((ex, i) => (
                    <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                      <span className="text-status-rejected">&bull;</span> {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
