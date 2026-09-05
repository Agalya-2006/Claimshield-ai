import json
from pathlib import Path


POLICIES_FILE = Path(__file__).resolve().parent.parent / "data" / "policies.json"


def load_policies():
    with open(POLICIES_FILE, "r", encoding="utf-8-sig") as file:
        return json.load(file)


def required_docs_for_incident(incident_type):
    policies = load_policies()

    for policy in policies:
        conditions = policy.get("conditions", [])

        if f"incidentType:{incident_type}" in conditions:
            return policy.get("requiredEvidence", [])

    return []


def evaluate_policies(claim):
    policies = load_policies()
    incident_type = claim.get("incidentType")

    applicable_policies = []
    excluded_policies = []

    documents = claim.get("documents", {})

    for policy in policies:
        conditions = policy.get("conditions", [])

        if f"incidentType:{incident_type}" not in conditions:
            continue

        missing_evidence = []

        for required_doc in policy.get("requiredEvidence", []):
            document = documents.get(required_doc, {})

            if document.get("present") is not True:
                missing_evidence.append(required_doc)

        exclusion_triggered = None
        claim_exclusion = claim.get("exclusionTriggered")

        if claim_exclusion:
            for exclusion in policy.get("exclusions", []):
                if exclusion == claim_exclusion:
                    exclusion_triggered = exclusion
                    break

        result = {
            "policyId": policy.get("id"),
            "policyNumber": policy.get("number"),
            "title": policy.get("title"),
            "description": policy.get("description"),
            "applicable": True,
            "requiredEvidence": policy.get("requiredEvidence", []),
            "missingEvidence": missing_evidence,
            "exclusionTriggered": exclusion_triggered,
            "exclusions": policy.get("exclusions", []),
        }

        if exclusion_triggered:
            excluded_policies.append(result)
        else:
            applicable_policies.append(result)

    return {
        "incidentType": incident_type,
        "applicablePolicies": applicable_policies,
        "excludedPolicies": excluded_policies,
    }

