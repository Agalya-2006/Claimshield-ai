// FINAL DECISION ENGINE — deterministic.
// This is the ONLY place a final decision (APPROVE / REJECT /
// REQUEST_INFORMATION / ESCALATE) is produced. It consumes the outputs of
// the completeness check, consistency check, and policy engine — never raw
// AI output. The grounded AI reasoning layer (aiReasoning.js) may only
// annotate this decision with plain-language explanation; it cannot change it.

export function decide({ completeness, consistency, policyResults }) {
  const applicable = policyResults.filter((p) => p.status === "APPLICABLE");
  const evidenceInsufficient = policyResults.filter(
    (p) => p.status === "EVIDENCE_INSUFFICIENT"
  );
  const excluded = policyResults.filter((p) => p.status === "EXCLUDED");

  // 0. An explicit policy exclusion is documented in the evidence itself →
  //    reject outright. This is a deterministic rule match, not an AI call.
  if (excluded.length > 0 && applicable.length === 0) {
    return {
      decision: "REJECTED",
      reason: `The submitted evidence documents a cause excluded under Clause ${excluded[0].number} (${excluded[0].title}): "${excluded[0].exclusionReason}".`,
    };
  }

  // 1. Contradictions always take priority — never approve on inconsistent evidence.
  if (!consistency.isConsistent) {
    return {
      decision: "ESCALATE",
      reason:
        "Contradictions were found across the submitted documents. Coverage cannot be confirmed until the discrepancy is resolved.",
      escalation: {
        required: true,
        cause: "CONTRADICTION",
        detail: consistency.issues.map((i) => i.description).join(" "),
      },
    };
  }

  // 2. No applicable policy clause could be matched with sufficient evidence,
  //    and no clause is close to applicable either → escalate for manual review
  //    rather than guessing at coverage.
  if (applicable.length === 0 && evidenceInsufficient.length === 0) {
    return {
      decision: "ESCALATE",
      reason:
        "No policy clause could be matched to this incident type from the current policy rule set.",
      escalation: {
        required: true,
        cause: "NO_MATCHING_CLAUSE",
        detail: "Coverage could not be determined confidently from the available evidence.",
      },
    };
  }

  // 3. Evidence is incomplete for every candidate clause → request the missing info.
  if (applicable.length === 0 && evidenceInsufficient.length > 0) {
    const missingLabels = new Set();
    evidenceInsufficient.forEach((p) => p.missingEvidence.forEach((m) => missingLabels.add(m)));
    return {
      decision: "REQUEST_INFORMATION",
      reason:
        "The submitted evidence is insufficient to confirm coverage under any applicable policy clause.",
      missingInformation: Array.from(missingLabels),
    };
  }

  // 4. At least one clause is applicable with complete, consistent evidence → approve.
  if (applicable.length > 0 && completeness.isComplete) {
    return {
      decision: "APPROVED",
      reason: `Evidence is complete and consistent, and supports coverage under ${applicable
        .map((p) => `Clause ${p.number} (${p.title})`)
        .join(", ")}.`,
    };
  }

  // 5. A clause is applicable but some non-clause-critical evidence is still
  //    missing (e.g. optional docs) → ask for the remainder before finalizing.
  if (applicable.length > 0 && !completeness.isComplete) {
    return {
      decision: "REQUEST_INFORMATION",
      reason:
        "A policy clause appears applicable, but some additional evidence is still missing before the claim can be finalized.",
      missingInformation: completeness.missing.map((m) => m.label),
    };
  }

  // Fallback safety net — should not normally be reached.
  return {
    decision: "ESCALATE",
    reason: "Coverage could not be determined confidently from the available evidence.",
    escalation: {
      required: true,
      cause: "UNCLASSIFIED",
      detail: "Coverage could not be determined confidently from the available evidence.",
    },
  };
}
