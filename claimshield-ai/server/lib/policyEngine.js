// DETERMINISTIC LAYER — no AI involved.
// Matches a claim's incidentType against the POLICIES table and reports,
// for each candidate clause, whether the evidence required by that clause
// is actually present. This is pure rule evaluation — the AI reasoning
// layer only explains these results, it never changes them.

import { POLICIES } from "../data/policies.js";

const DOC_LABELS = {
  claimForm: "Claim Form",
  incidentDescription: "Incident Description",
  repairEstimate: "Repair Estimate",
  fir: "FIR / Police Report",
};

export function evaluatePolicies(claim) {
  const candidates = POLICIES.filter((p) =>
    p.conditions.includes(`incidentType:${claim.incidentType}`)
  );

  const results = candidates.map((policy) => {
    const missing = policy.requiredEvidence.filter(
      (docKey) => !claim.documents[docKey]?.present
    );
    const present = policy.requiredEvidence.filter(
      (docKey) => claim.documents[docKey]?.present
    );

    const exclusionHit =
      claim.exclusionTriggered && policy.exclusions.includes(claim.exclusionTriggered)
        ? claim.exclusionTriggered
        : null;

    let status = missing.length === 0 ? "APPLICABLE" : "EVIDENCE_INSUFFICIENT";
    if (exclusionHit) status = "EXCLUDED";

    return {
      id: policy.id,
      number: policy.number,
      title: policy.title,
      description: policy.description,
      exclusions: policy.exclusions,
      status,
      exclusionReason: exclusionHit,
      supportingEvidence: present.map((k) => DOC_LABELS[k]),
      missingEvidence: missing.map((k) => DOC_LABELS[k]),
    };
  });

  return results;
}

export function requiredDocsForIncident(incidentType) {
  const candidates = POLICIES.filter((p) =>
    p.conditions.includes(`incidentType:${incidentType}`)
  );
  const set = new Set();
  candidates.forEach((p) => p.requiredEvidence.forEach((d) => set.add(d)));
  return Array.from(set);
}
