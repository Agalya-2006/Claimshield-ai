def check_consistency(claim):
    documents = claim.get("documents", {})
    issues = []

    claim_form = documents.get("claimForm", {})
    incident_description = documents.get("incidentDescription", {})
    repair_estimate = documents.get("repairEstimate", {})

    # Check incident date consistency
    claim_date = claim.get("incidentDate")
    form_date = claim_form.get("fields", {}).get("incidentDate")
    description_date = incident_description.get("fields", {}).get("incidentDate")

    if claim_date and form_date and claim_date != form_date:
        issues.append({
            "type": "DATE_MISMATCH",
            "field": "incidentDate",
            "details": f"Claim incident date {claim_date} does not match claim form date {form_date}."
        })

    if claim_date and description_date and claim_date != description_date:
        issues.append({
            "type": "DATE_MISMATCH",
            "field": "incidentDate",
            "details": f"Claim incident date {claim_date} does not match incident description date {description_date}."
        })

    # Check claim amount against repair estimate
    claim_amount = claim.get("claimAmount")
    estimate_amount = repair_estimate.get("fields", {}).get("amount")

    if claim_amount is not None and estimate_amount is not None:
        if claim_amount != estimate_amount:
            issues.append({
                "type": "AMOUNT_MISMATCH",
                "field": "claimAmount",
                "details": f"Claim amount {claim_amount} does not match repair estimate amount {estimate_amount}."
            })

    # Check whether incident description exists
    description_text = incident_description.get("text", "").strip()

    if not description_text:
        issues.append({
            "type": "MISSING_DESCRIPTION",
            "field": "incidentDescription",
            "details": "Incident description is missing or empty."
        })

    return {
        "isConsistent": len(issues) == 0,
        "issues": issues
    }
