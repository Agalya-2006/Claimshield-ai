import express from "express";
import cors from "cors";
import { CLAIMS } from "./data/claims.js";
import { POLICIES } from "./data/policies.js";
import { reviewClaim } from "./lib/reviewClaim.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// In-memory audit log, seeded lazily as claims are reviewed.
const auditLog = [];
const reviewCache = new Map();

function logAudit(entry) {
  auditLog.unshift({
    timestamp: new Date().toISOString(),
    ...entry,
  });
}

async function getOrReviewClaim(claim) {
  if (reviewCache.has(claim.id)) return reviewCache.get(claim.id);
  const result = await reviewClaim(claim);
  reviewCache.set(claim.id, result);
  logAudit({
    claimId: claim.id,
    action: "Evidence Reviewed",
    decision: result.decision,
    reason: result.reason,
    component: "Decision Engine",
  });
  return result;
}

// Warm the cache + audit log at boot so Overview/Analytics have real data immediately.
async function warmUp() {
  for (const claim of CLAIMS) {
    await getOrReviewClaim(claim);
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEngine: process.env.ANTHROPIC_API_KEY ? "online" : "degraded" });
});

app.get("/api/claims", async (req, res) => {
  try {
    const results = await Promise.all(
      CLAIMS.map(async (claim) => {
        const review = await getOrReviewClaim(claim);
        return {
          id: claim.id,
          customer: claim.customer,
          vehicle: claim.vehicle,
          vehicleType: claim.vehicleType,
          incidentDate: claim.incidentDate,
          claimAmount: claim.claimAmount,
          submittedAt: claim.submittedAt,
          evidenceStatus: review.completeness.isComplete ? "Complete" : "Incomplete",
          completenessPct: review.completeness.completenessPct,
          aiRecommendation: review.decision,
          finalDecision: review.decision,
        };
      })
    );
    res.json({ claims: results });
  } catch (err) {
    res.status(500).json({ error: "Unable to load claim data." });
  }
});

app.get("/api/claims/:id", async (req, res) => {
  const claim = CLAIMS.find((c) => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: "Claim not found." });
  try {
    const review = await getOrReviewClaim(claim);
    res.json({ claim, review });
  } catch (err) {
    res.status(500).json({ error: "Unable to load claim data." });
  }
});

app.get("/api/policies", (req, res) => {
  res.json({ policies: POLICIES });
});

app.get("/api/audit-logs", (req, res) => {
  res.json({ logs: auditLog });
});

app.get("/api/analytics/summary", async (req, res) => {
  try {
    const reviews = await Promise.all(CLAIMS.map((c) => getOrReviewClaim(c)));
    const byDecision = { APPROVED: 0, REJECTED: 0, REQUEST_INFORMATION: 0, ESCALATE: 0 };
    let completenessSum = 0;
    const rejectionReasons = {};
    const byEvidenceStatus = { Complete: 0, Incomplete: 0 };

    reviews.forEach((r) => {
      byDecision[r.decision] = (byDecision[r.decision] || 0) + 1;
      completenessSum += r.completeness.completenessPct;
      byEvidenceStatus[r.completeness.isComplete ? "Complete" : "Incomplete"] += 1;
      if (r.decision === "REJECTED") {
        rejectionReasons[r.reason] = (rejectionReasons[r.reason] || 0) + 1;
      }
    });

    res.json({
      totalClaims: CLAIMS.length,
      byDecision,
      byEvidenceStatus,
      avgCompleteness: Math.round(completenessSum / reviews.length),
      avgReviewTimeMinutes: 6, // simulated operational metric
      rejectionReasons,
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to load analytics data." });
  }
});

warmUp().then(() => {
  app.listen(PORT, () => {
    console.log(`ClaimShield AI server running on http://localhost:${PORT}`);
  });
});
