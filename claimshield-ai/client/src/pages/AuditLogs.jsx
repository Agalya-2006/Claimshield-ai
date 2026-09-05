import { useEffect, useState } from "react";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/States.jsx";

export default function AuditLogs() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .auditLogs()
      .then((d) => setLogs(d.logs))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!logs) return <LoadingState message="Loading audit logs..." />;

  return (
    <div className="bg-white rounded-xl2 border border-surface-border shadow-card overflow-hidden">
      {logs.length === 0 ? (
        <EmptyState message="No audit entries yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-surface-border">
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">Claim ID</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Decision</th>
                <th className="px-5 py-3 font-semibold">Reason</th>
                <th className="px-5 py-3 font-semibold">System Component</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b border-surface-border last:border-0 hover:bg-surface-bg/60">
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-navy-900">{log.claimId}</td>
                  <td className="px-5 py-3.5 text-slate-600">{log.action}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={log.decision} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate" title={log.reason}>
                    {log.reason}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{log.component}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
