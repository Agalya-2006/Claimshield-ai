from .evidence_check import check_completeness
from .consistency import check_consistency
from .policy_engine import required_docs_for_incident, evaluate_policies
from .decision_engine import decide
from .ai_reasoning import explain_decision


def review_claim(claim):
    # 1. Determine required evidence from the applicable policy
    required_docs = required_docs_for_incident(
        claim.get("incidentType")
    )

    # 2. Deterministic evidence completeness check
    completeness = check_completeness(
        claim,
        required_docs
    )

    # 3. Deterministic consistency checks
    consistency = check_consistency(claim)

    # 4. Deterministic policy evaluation
    policy_results = evaluate_policies(claim)

    # 5. Deterministic final decision
    decision_result = decide(
        completeness,
        consistency,
        policy_results
    )

    # 6. Gemini explanation only
    # Gemini must never change the deterministic decision.
    ai_result = explain_decision(
        claim,
        completeness,
        consistency,
        policy_results,
        decision_result
    )

    return {
        "claimId": claim.get("id"),
        "completeness": completeness,
        "consistency": consistency,
        "policyResults": policy_results,
        "decision": decision_result.get("decision"),
        "reason": decision_result.get("reason"),
        "missingInformation": decision_result.get(
            "missingInformation", []
        ),
        "escalation": decision_result.get("escalation"),
        "aiExplanation": ai_result.get("explanation"),
        "aiAvailable": ai_result.get("aiAvailable", False),
    }
