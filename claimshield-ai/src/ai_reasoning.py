import os
import json

from google import genai


def explain_decision(
    claim,
    completeness,
    consistency,
    policy_results,
    decision_result
):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return {
            "explanation": (
                "Gemini AI is unavailable because GEMINI_API_KEY is not configured. "
                "The deterministic decision engine result is retained."
            ),
            "aiAvailable": False,
        }

    try:
        client = genai.Client(api_key=api_key)

        evidence = {
            "claim": claim,
            "completeness": completeness,
            "consistency": consistency,
            "policyResults": policy_results,
            "deterministicDecision": decision_result,
        }

        prompt = f"""
You are an insurance claims evidence review assistant.

Your job is ONLY to explain the deterministic decision already produced
by the rules engine.

IMPORTANT RULES:
1. Do not change or override the deterministic decision.
2. Use ONLY the supplied claim evidence, consistency results,
   policy results, and deterministic decision.
3. Do not invent documents, facts, policy clauses, or evidence.
4. Mention the relevant policy number when available.
5. Clearly explain why the claim received its decision.
6. If evidence is missing, identify the specific missing evidence.
7. If information is inconsistent, clearly mention the inconsistency.
8. Keep the explanation concise and professional.
9. This is an explanation, not an independent claim decision.

Verified review data:

{json.dumps(evidence, indent=2)}

Return a short explanation suitable for an insurance claim reviewer.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        explanation = response.text.strip()

        if not explanation:
            raise ValueError("Gemini returned an empty explanation.")

        return {
            "explanation": explanation,
            "aiAvailable": True,
        }

    except Exception as error:
        return {
            "explanation": (
                "Gemini explanation could not be generated. "
                "The deterministic decision engine result is retained. "
                f"AI error: {str(error)}"
            ),
            "aiAvailable": False,
        }
