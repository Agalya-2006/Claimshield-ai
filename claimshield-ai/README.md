# ClaimShield AI — Insurance Claims Intelligence Platform

An AI-assisted motor insurance claims evidence review system, built for
hackathon track **PS02** (Motor Insurance / InsurTech / AI).

## Architecture

The system is split into two apps that talk over a REST API:

```
claimshield-ai/
├── server/     Express API — all decision logic lives here
└── client/     React + Vite + Tailwind frontend
```

The review pipeline (see `server/lib/reviewClaim.js`) runs in a fixed order,
and each layer is a separate module so the boundaries stay clear:

1. **Evidence retrieval** — `server/data/claims.js` (mock claim + document store)
2. **Deterministic consistency checks** — `server/lib/consistencyCheck.js`
   (cross-checks dates/amounts across documents)
3. **Deterministic policy/business rules** — `server/lib/policyEngine.js`
   + `server/data/policies.js` (matches incident type to policy clauses,
   checks required evidence, checks exclusions)
4. **Final decision engine** — `server/lib/decisionEngine.js`. This is the
   **only** place APPROVE / REJECT / REQUEST_INFORMATION / ESCALATE is
   decided. It only consumes the deterministic outputs above.
5. **Grounded AI reasoning** — `server/lib/aiReasoning.js`. This layer can
   only **explain** the decision already made in step 4, in plain language,
   strictly grounded in the facts it's given. It cannot change the decision.
   If `ANTHROPIC_API_KEY` is not set (or the call fails), it falls back to a
   deterministic template explanation — the claim is still fully reviewable.

The system never invents evidence: a document that isn't in
`claim.documents` is simply reported missing, never assumed to exist.

## Running it

**Backend:**
```bash
cd server
npm install
npm start          # runs on http://localhost:4000
```

Optional — enable AI-generated explanations (falls back gracefully without it):
```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

**Frontend:**
```bash
cd client
npm install
npm run dev         # runs on http://localhost:5173, proxies /api to :4000
```

Open http://localhost:5173.

## What's included

- 8 mock claims covering all four decision outcomes: approvals, a rejection
  (documented policy exclusion), requests for information (missing FIR /
  repair estimate), and an escalation (a genuine cross-document date +
  amount contradiction).
- Pages: Overview (KPIs + recent claims), Claims (search/filter/sort/
  pagination), Claim Review (the core evidence-vs-AI-review workspace),
  Analytics (charts), Policy Rules, Audit Logs, Settings.
- Loading / error / empty states throughout, and an "AI reasoning service
  unavailable" banner when the AI explanation layer is degraded.

## Extending it

- Add more claims: edit `server/data/claims.js`.
- Add more policy clauses: edit `server/data/policies.js`.
- Real document ingestion (OCR/PDF parsing) would replace the mock
  `documents` objects but should still populate the same shape, so the
  rest of the pipeline needs no changes.
