def decide(completeness, consistency, policy_results):
    missing_information = []

    # 1. Missing required documents
    if not completeness.get("isComplete", False):
        missing_information.extend(
            completeness.get("missingDocuments", [])
        )

    # 2. Policy-level missing evidence
    for policy in policy_results.get("applicablePolicies", []):
        for document in policy.get("missingEvidence", []):
            if document not in missing_information:
                missing_information.append(document)

    # 3. Exclusion takes priority
    excluded_policies = policy_results.get("excludedPolicies", [])

    if excluded_policies:
        exclusion = excluded_policies[0].get("exclusionTriggered")

        return {
            "decision": "REJECTED",
            "reason": f"Policy exclusion applies: {exclusion}",
            "missingInformation": missing_information,
            "escalation": None,
        }

    # 4. Inconsistent information requires review
    if not consistency.get("isConsistent", False):
        return {
            "decision": "ESCALATE",
            "reason": "Inconsistent information was detected across submitted evidence.",
            "missingInformation": missing_information,
            "escalation": "Manual review required because claim evidence is inconsistent.",
        }

    # 5. Missing evidence means request information
    if missing_information:
        return {
            "decision": "REQUEST_INFORMATION",
            "reason": "Required claim evidence is missing.",
            "missingInformation": missing_information,
            "escalation": None,
        }

    # 6. All deterministic checks passed
    if policy_results.get("applicablePolicies"):
        return {
            "decision": "APPROVED",
            "reason": "Required evidence is complete, information is consistent, and no applicable policy exclusion was triggered.",
            "missingInformation": [],
            "escalation": None,
        }

    # 7. Unknown incident type / no applicable policy
    return {
        "decision": "ESCALATE",
        "reason": "No applicable policy clause was found for this incident type.",
        "missingInformation": [],
        "escalation": "Manual policy review required.",
    }
