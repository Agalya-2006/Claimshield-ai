// GROUNDED AI REASONING LAYER.
// This layer NEVER decides anything. It only produces a human-readable
// explanation grounded strictly in the deterministic outputs it is given
// (completeness, consistency, policy results, decision). If an
// ANTHROPIC_API_KEY is configured, it asks Claude to phrase the explanation
// naturally citing only the facts provided. If the key is missing or the
// call fails, it falls back to a deterministic template — the claim is
// still fully reviewable, just without the natural-language polish.

const MODEL = "claude-sonnet-4-6";

function buildGroundedPrompt({ claim, completeness, consistency, policyResults, decisionResult }) {
  return `You are an explainability assistant for an insurance claims review system.
You must ONLY restate and connect facts given below. Do not invent any evidence,
dates, amounts, or policy clauses that are not listed here. Keep the explanation
to 2-4 sentences, professional and neutral in tone.

Claim: ${claim.id} — ${claim.customer}, ${claim.vehicle}
Incident type: ${claim.incidentType}
Evidence available: ${completeness.available.map((a) => a.label).join(", ") || "none"}
Evidence missing: ${completeness.missing.map((m) => m.label).join(", ") || "none"}
Consistency: ${consistency.isConsistent ? "consistent" : "contradictions found - " + consistency.issues.map((i) => i.description).join(" ")}
Policy clause results: ${policyResults
    .map((p) => `Clause ${p.number} (${p.title}) - ${p.status}`)
    .join("; ") || "none matched"}
Final decision already made by the deterministic engine: ${decisionResult.decision} — ${decisionResult.reason}

Write a short explanation of why this decision follows from the facts above.`;
}

function fallbackExplanation({ decisionResult }) {
  return decisionResult.reason;
}

export async function explainDecision(context) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { explanation: fallbackExplanation(context), aiAvailable: false };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: buildGroundedPrompt(context) }],
      }),
    });

    if (!res.ok) throw new Error(`AI service returned ${res.status}`);
    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();

    if (!text) throw new Error("Empty AI response");
    return { explanation: text, aiAvailable: true };
  } catch (err) {
    // AI reasoning is optional polish — never let its failure block a decision.
    return { explanation: fallbackExplanation(context), aiAvailable: false };
  }
}
