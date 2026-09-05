import json
import os
from pathlib import Path
from datetime import datetime

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from src.review_claim import review_claim


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIR = BASE_DIR / "frontend" / "dist"

CLAIMS_FILE = DATA_DIR / "claims.json"
POLICIES_FILE = DATA_DIR / "policies.json"


def load_json(file_path):
    with open(file_path, "r", encoding="utf-8-sig") as file:
        return json.load(file)


CLAIMS = load_json(CLAIMS_FILE)
POLICIES = load_json(POLICIES_FILE)

app = Flask(__name__)
CORS(app)

audit_log = []
review_cache = {}


def get_or_review_claim(claim):
    claim_id = claim.get("id")

    if claim_id in review_cache:
        return review_cache[claim_id]

    result = review_claim(claim)

    review_cache[claim_id] = result

    audit_log.insert(
        0,
        {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "claimId": claim_id,
            "action": "Evidence Reviewed",
            "decision": result.get("decision"),
            "reason": result.get("reason"),
            "component": "Decision Engine",
        },
    )

    return result


def warm_up():
    for claim in CLAIMS:
        get_or_review_claim(claim)


@app.get("/api/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "aiEngine": (
                "online"
                if os.getenv("GEMINI_API_KEY")
                else "degraded"
            ),
        }
    )


@app.get("/api/claims")
def get_claims():
    try:
        results = []

        for claim in CLAIMS:
            review = get_or_review_claim(claim)

            results.append(
                {
                    "id": claim.get("id"),
                    "customer": claim.get("customer"),
                    "vehicle": claim.get("vehicle"),
                    "vehicleType": claim.get("vehicleType"),
                    "incidentDate": claim.get("incidentDate"),
                    "claimAmount": claim.get("claimAmount"),
                    "submittedAt": claim.get("submittedAt"),
                    "evidenceStatus": (
                        "Complete"
                        if review["completeness"]["isComplete"]
                        else "Incomplete"
                    ),
                    "completenessPct": review["completeness"]["completenessPct"],
                    "aiRecommendation": review.get("decision"),
                    "finalDecision": review.get("decision"),
                }
            )

        return jsonify({"claims": results})

    except Exception as error:
        return jsonify(
            {"error": f"Unable to load claim data: {str(error)}"}
        ), 500


@app.get("/api/claims/<claim_id>")
def get_claim(claim_id):
    claim = next(
        (item for item in CLAIMS if item.get("id") == claim_id),
        None,
    )

    if claim is None:
        return jsonify({"error": "Claim not found."}), 404

    try:
        review = get_or_review_claim(claim)
        return jsonify(
            {
                "claim": claim,
                "review": review,
            }
        )

    except Exception as error:
        return jsonify(
            {"error": f"Unable to load claim data: {str(error)}"}
        ), 500


@app.get("/api/policies")
def get_policies():
    return jsonify({"policies": POLICIES})


@app.get("/api/audit-logs")
def get_audit_logs():
    return jsonify({"logs": audit_log})


@app.get("/api/analytics/summary")
def analytics_summary():
    try:
        reviews = [
            get_or_review_claim(claim)
            for claim in CLAIMS
        ]

        by_decision = {
            "APPROVED": 0,
            "REJECTED": 0,
            "REQUEST_INFORMATION": 0,
            "ESCALATE": 0,
        }

        completeness_sum = 0

        rejection_reasons = {}

        by_evidence_status = {
            "Complete": 0,
            "Incomplete": 0,
        }

        for review in reviews:
            decision = review.get("decision")

            by_decision[decision] = (
                by_decision.get(decision, 0) + 1
            )

            completeness_sum += review["completeness"]["completenessPct"]

            status = (
                "Complete"
                if review["completeness"]["isComplete"]
                else "Incomplete"
            )

            by_evidence_status[status] += 1

            if decision == "REJECTED":
                reason = review.get("reason", "Unknown")
                rejection_reasons[reason] = (
                    rejection_reasons.get(reason, 0) + 1
                )

        average_completeness = (
            round(completeness_sum / len(reviews))
            if reviews
            else 0
        )

        return jsonify(
            {
                "totalClaims": len(CLAIMS),
                "byDecision": by_decision,
                "byEvidenceStatus": by_evidence_status,
                "avgCompleteness": average_completeness,
                "avgReviewTimeMinutes": 6,
                "rejectionReasons": rejection_reasons,
            }
        )

    except Exception as error:
        return jsonify(
            {"error": f"Unable to load analytics data: {str(error)}"}
        ), 500


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if FRONTEND_DIR.exists():
        requested_file = FRONTEND_DIR / path

        if path and requested_file.is_file():
            return send_from_directory(FRONTEND_DIR, path)

        index_file = FRONTEND_DIR / "index.html"

        if index_file.exists():
            return send_from_directory(FRONTEND_DIR, "index.html")

    return jsonify(
        {
            "message": "ClaimShield AI backend is running.",
            "frontend": "Frontend build not found yet.",
        }
    )


if __name__ == "__main__":
    print("Starting ClaimShield AI...")
    print("Loading claim reviews...")

    warm_up()

    print("ClaimShield AI server running on http://localhost:8000")

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=False,
    )

