// DETERMINISTIC LAYER — no AI involved.
// Cross-checks factual fields (dates, amounts) that appear in more than one
// submitted document. Only compares fields that are actually present.

function daysBetween(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.abs((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function checkConsistency(claim) {
  const issues = [];
  const docs = claim.documents;

  const incidentDate = claim.incidentDate;

  // Claim form incident date vs top-level incident date
  if (docs.claimForm?.present && docs.claimForm.fields?.incidentDate) {
    if (docs.claimForm.fields.incidentDate !== incidentDate) {
      issues.push({
        type: "date_mismatch",
        description: "The incident date on the claim form does not match the reported incident date.",
        fields: [
          { label: "Reported Incident Date", value: incidentDate },
          { label: "Claim Form Incident Date", value: docs.claimForm.fields.incidentDate },
        ],
      });
    }
  }

  // Incident description date vs top-level incident date
  if (docs.incidentDescription?.present && docs.incidentDescription.fields?.incidentDate) {
    if (docs.incidentDescription.fields.incidentDate !== incidentDate) {
      issues.push({
        type: "date_mismatch",
        description: "The incident date in the incident description does not match the reported incident date.",
        fields: [
          { label: "Reported Incident Date", value: incidentDate },
          { label: "Incident Description Date", value: docs.incidentDescription.fields.incidentDate },
        ],
      });
    }
  }

  // Repair estimate date should not precede the incident date, and should
  // typically be within a reasonable window after it.
  if (docs.repairEstimate?.present && docs.repairEstimate.fields?.estimateDate) {
    const estDate = docs.repairEstimate.fields.estimateDate;
    if (new Date(estDate) < new Date(incidentDate)) {
      issues.push({
        type: "date_mismatch",
        description: "The repair estimate is dated before the reported incident date.",
        fields: [
          { label: "Incident Date", value: incidentDate },
          { label: "Repair Estimate Date", value: estDate },
        ],
      });
    } else if (daysBetween(estDate, incidentDate) > 60) {
      issues.push({
        type: "date_gap",
        description:
          "The repair estimate is dated significantly later than the reported incident date.",
        fields: [
          { label: "Incident Date", value: incidentDate },
          { label: "Repair Estimate Date", value: estDate },
        ],
      });
    }
  }

  // Claim amount vs repair estimate amount
  if (docs.repairEstimate?.present && docs.repairEstimate.fields?.amount != null) {
    if (docs.repairEstimate.fields.amount !== claim.claimAmount) {
      issues.push({
        type: "amount_mismatch",
        description: "The claimed amount does not match the repair estimate amount.",
        fields: [
          { label: "Claim Amount", value: claim.claimAmount },
          { label: "Repair Estimate Amount", value: docs.repairEstimate.fields.amount },
        ],
      });
    }
  }

  return {
    isConsistent: issues.length === 0,
    issues,
  };
}
