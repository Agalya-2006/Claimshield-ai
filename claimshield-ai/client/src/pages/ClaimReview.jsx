import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Receipt,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  Eye,
} from "lucide-react";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { LoadingState, ErrorState, AiUnavailableBanner } from "../components/States.jsx";

const DOC_META = {
  claimForm: { label: "Claim Form", icon: FileText, type: "Structured Form" },
  incidentDescription: { label: "Incident Description", icon: MessageSquare, type: "Narrative Statement" },
  repairEstimate: { label: "Repair Estimate", icon: Receipt, type: "Financial Document" },
  fir: { label: "FIR / Police Report", icon: Shield, type: "Legal Document" },
};

const DECISION_META = {
  APPROVED: { label: "APPROVED", icon: CheckCircle2, color: "#16a34a", bg: "#ecfdf3", ring: "#bbf7d0" },
  REJECTED: { label: "REJECTED", icon: XCircle, color: "#dc2626", bg: "#fef2f2", ring: "#fecaca" },
  REQUEST_INFORMATION: {
    label: "REQUEST INFORMATION",
    icon: AlertCircle,
    color: "#d97706",
    bg: "#fffbeb",
    ring: "#fde68a",
  },
  ESCALATE: { label: "ESCALATED", icon: AlertTriangle, color: "#7c3aed", bg: "#f5f3ff", ring: "#ddd6fe" },
};

export default function ClaimReview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    setData(null);
    setError(null);
    api
      .claim(id)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState message="Analyzing claim evidence..." />;

  const { claim, review } = data;
  const decisionMeta = DECISION_META[review.decision];
  const DecisionIcon = decisionMeta.icon;

  return (
    <div className="space-y-5">
      <Link
        to="/claims"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900 font-medium"
      >
        <ChevronLeft size={16} /> Back to Claims
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-extrabold text-navy-900">{claim.id}</h2>
              <StatusBadge status={review.decision} />
            </div>
            <p className="text-sm text-slate-500">
              {claim.customer} &middot; {claim.vehicle}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium">Incident Date</p>
              <p className="font-semibold text-navy-900">{claim.incidentDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Claim Amount</p>
              <p className="font-semibold text-navy-900">
                ₹{claim.claimAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Incident Type</p>
              <p className="font-semibold text-navy-900 capitalize">
                {claim.incidentType.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Submitted</p>
              <p className="font-semibold text-navy-900">
                {new Date(claim.submittedAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!review.aiAvailable && <AiUnavailableBanner />}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* LEFT: Submitted Evidence */}
        <div className="space-y-4">
          <h3 className="font-bold text-navy-900 px-1">Submitted Evidence</h3>
          {Object.entries(DOC_META).map(([key, meta]) => {
            const doc = claim.documents[key];
            const Icon = meta.icon;
            const present = doc?.present;
            return (
              <div
                key={key}
                className="bg-white rounded-xl2 border border-surface-border shadow-card p-4 flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    present ? "bg-royal-50" : "bg-slate-100"
                  }`}
                >
                  <Icon size={18} className={present ? "text-royal-600" : "text-slate-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 text-sm">{meta.label}</p>
                  <p className="text-xs text-slate-400">{meta.type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {present ? (
                    <>
                      <StatusBadge status={doc.verified ? "Complete" : "Incomplete"} size="sm" />
                      <button
                        onClick={() => setViewingDoc(key)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-royal-600 hover:bg-royal-50 transition-colors"
                        title="View evidence"
                      >
                        <Eye size={16} />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-status-info bg-status-infoBg px-2.5 py-1 rounded-full">
                      Missing
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {viewingDoc && claim.documents[viewingDoc]?.present && (
            <div className="bg-navy-900 text-white rounded-xl2 p-4 text-sm">
              <p className="font-semibold mb-2">{DOC_META[viewingDoc].label} — Details</p>
              <pre className="whitespace-pre-wrap text-xs text-white/80 font-mono">
                {JSON.stringify(claim.documents[viewingDoc], null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* RIGHT: AI Evidence Review */}
        <div className="space-y-4">
          <h3 className="font-bold text-navy-900 px-1">AI Evidence Review</h3>

          {/* Completeness */}
          <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm text-navy-900">Evidence Completeness</p>
              <p className="font-extrabold text-navy-900">{review.completeness.completenessPct}%</p>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-royal-500 to-indigo2-600"
                style={{ width: `${review.completeness.completenessPct}%` }}
              />
            </div>
            <div className="space-y-1 text-xs">
              {review.completeness.available.map((d) => (
                <p key={d.key} className="text-status-approved flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> {d.label}
                </p>
              ))}
              {review.completeness.missing.map((d) => (
                <p key={d.key} className="text-status-info flex items-center gap-1.5">
                  <AlertCircle size={13} /> {d.label} (missing)
                </p>
              ))}
            </div>
          </div>

          {/* Consistency */}
          <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-4">
            <div className="flex items-center gap-2 mb-2">
              {review.consistency.isConsistent ? (
                <>
                  <CheckCircle2 size={16} className="text-status-approved" />
                  <p className="font-semibold text-sm text-status-approved">Consistent</p>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-status-rejected" />
                  <p className="font-semibold text-sm text-status-rejected">Contradiction Detected</p>
                </>
              )}
            </div>
            {!review.consistency.isConsistent && (
              <div className="space-y-3 mt-2">
                {review.consistency.issues.map((issue, i) => (
                  <div key={i} className="bg-status-rejectedBg rounded-lg p-3">
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-1.5">
                      {issue.fields.map((f, j) => (
                        <div key={j}>
                          <p className="text-slate-500">{f.label}</p>
                          <p className="font-semibold text-navy-900">{f.value}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-status-rejected font-medium">{issue.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Policy Coverage */}
          <div className="bg-white rounded-xl2 border border-surface-border shadow-card p-4">
            <p className="font-semibold text-sm text-navy-900 mb-3">Policy Coverage</p>
            {review.policyResults.length === 0 ? (
              <p className="text-xs text-slate-400">No policy clauses matched this incident type.</p>
            ) : (
              <div className="space-y-3">
                {review.policyResults.map((p) => (
                  <div key={p.id} className="border border-surface-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-royal-600">CLAUSE {p.number}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === "APPLICABLE"
                            ? "bg-status-approvedBg text-status-approved"
                            : p.status === "EXCLUDED"
                            ? "bg-status-rejectedBg text-status-rejected"
                            : "bg-status-infoBg text-status-info"
                        }`}
                      >
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-navy-900">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                    {p.exclusionReason && (
                      <p className="text-xs text-status-rejected mt-1 font-medium">
                        Exclusion matched: {p.exclusionReason}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.supportingEvidence.map((e) => (
                        <span
                          key={e}
                          className="text-[10px] font-semibold bg-royal-50 text-royal-600 px-2 py-0.5 rounded-full"
                        >
                          {e}
                        </span>
                      ))}
                      {p.missingEvidence.map((e) => (
                        <span
                          key={e}
                          className="text-[10px] font-semibold bg-status-infoBg text-status-info px-2 py-0.5 rounded-full"
                        >
                          {e} missing
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendation explanation */}
          <div className="bg-navy-900 text-white rounded-xl2 p-4">
            <p className="font-semibold text-sm mb-1.5">AI Recommendation</p>
            <p className="text-xs text-white/80 leading-relaxed">{review.aiExplanation}</p>
          </div>
        </div>
      </div>

      {/* Final Decision Panel */}
      <div
        className="rounded-xl2 border p-5"
        style={{ backgroundColor: decisionMeta.bg, borderColor: decisionMeta.ring }}
      >
        <div className="flex items-center gap-3 mb-3">
          <DecisionIcon size={26} style={{ color: decisionMeta.color }} />
          <h3 className="text-lg font-extrabold" style={{ color: decisionMeta.color }}>
            {decisionMeta.label}
          </h3>
        </div>
        <p className="text-sm font-medium text-navy-900 mb-4">{review.reason}</p>

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Applicable Clauses</p>
            {review.policyResults.filter((p) => p.status === "APPLICABLE").length ? (
              review.policyResults
                .filter((p) => p.status === "APPLICABLE")
                .map((p) => (
                  <p key={p.id} className="text-navy-900 font-medium">
                    Clause {p.number} — {p.title}
                  </p>
                ))
            ) : (
              <p className="text-slate-400">None</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Missing Information</p>
            {review.missingInformation.length ? (
              review.missingInformation.map((m) => (
                <p key={m} className="text-navy-900 font-medium">
                  {m}
                </p>
              ))
            ) : (
              <p className="text-slate-400">None</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Contradictions</p>
            {review.consistency.issues.length ? (
              review.consistency.issues.map((i, idx) => (
                <p key={idx} className="text-navy-900 font-medium">
                  {i.description}
                </p>
              ))
            ) : (
              <p className="text-slate-400">None</p>
            )}
          </div>
        </div>

        {review.escalation?.required && (
          <div className="mt-4 pt-4 border-t border-black/10">
            <p className="text-sm font-bold text-navy-900 mb-1">Manual Review Required</p>
            <p className="text-xs text-slate-600">
              Coverage could not be determined confidently from the available evidence.{" "}
              {review.escalation.detail}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
