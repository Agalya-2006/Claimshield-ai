import { checkCompleteness } from "./evidenceCheck.js";
import { checkConsistency } from "./consistencyCheck.js";
import { evaluatePolicies, requiredDocsForIncident } from "./policyEngine.js";
import { decide } from "./decisionEngine.js";
import { explainDecision } from "./aiReasoning.js";

// Pipeline order (fixed, never reordered):
// 1. Evidence retrieval (already loaded on the claim)
// 2. Deterministic consistency checks
// 3. Deterministic policy / business rules
// 4. Final decision engine (deterministic)
// 5. Grounded AI reasoning (explanation only, cannot change the decision)
export async function reviewClaim(claim) {
  const requiredDocs = requiredDocsForIncident(claim.incidentType);
  const completeness = checkCompleteness(claim, requiredDocs);
  const consistency = checkConsistency(claim);
  const policyResults = evaluatePolicies(claim);
  const decisionResult = decide({ completeness, consistency, policyResults });

  const { explanation, aiAvailable } = await explainDecision({
    claim,
    completeness,
    consistency,
    policyResults,
    decisionResult,
  });

  return {
    claimId: claim.id,
    completeness,
    consistency,
    policyResults,
    decision: decisionResult.decision,
    reason: decisionResult.reason,
    missingInformation: decisionResult.missingInformation || [],
    escalation: decisionResult.escalation || null,
    aiExplanation: explanation,
    aiAvailable,
  };
}
