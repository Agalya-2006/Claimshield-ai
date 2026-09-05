// DETERMINISTIC LAYER — no AI involved.
// Decides only what evidence is present vs missing, based purely on the
// claim's `documents` map. Never infers or assumes a document exists.

const DOC_LABELS = {
  claimForm: "Claim Form",
  incidentDescription: "Incident Description",
  repairEstimate: "Repair Estimate",
  fir: "FIR / Police Report",
};

const CORE_DOCS = ["claimForm", "incidentDescription", "repairEstimate", "fir"];

export function checkCompleteness(claim, requiredDocs) {
  // requiredDocs: docs required for whichever policy clauses could apply.
  // Falls back to the four core document types when not specified.
  const relevant = requiredDocs && requiredDocs.length ? requiredDocs : CORE_DOCS;

  const available = [];
  const missing = [];

  for (const key of relevant) {
    const doc = claim.documents[key];
    if (doc && doc.present) {
      available.push({ key, label: DOC_LABELS[key] });
    } else {
      missing.push({ key, label: DOC_LABELS[key] });
    }
  }

  const totalConsidered = relevant.length;
  const completenessPct = totalConsidered
    ? Math.round((available.length / totalConsidered) * 100)
    : 100;

  return {
    completenessPct,
    available,
    missing,
    isComplete: missing.length === 0,
  };
}
