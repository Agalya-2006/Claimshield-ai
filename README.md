# Claimshield-ai
AI-powered Insurance Claims Evidence Review Assistant
TRACK_ID=PS02

# ClaimShield AI — Insurance Claims Evidence Review Assistant

ClaimShield AI is an AI-assisted motor insurance claims evidence review platform designed for the **NexusTiQ24 — PS02: Insurance Claims Evidence Review Assistant** challenge.

The system reviews motor insurance claims using submitted claim evidence, deterministic policy rules, consistency checks, and Gemini AI reasoning. It helps insurance reviewers identify missing documents, detect inconsistencies, determine applicable policy clauses, and produce an explainable recommendation.

## Problem Statement

Insurance claim review often requires manually checking multiple documents such as:

* Claim forms
* Incident descriptions
* Repair estimates
* FIR / police reports

Manual review can be time-consuming and may result in missed inconsistencies or incomplete evidence.

ClaimShield AI automates the evidence-review workflow while keeping the final policy decision grounded in deterministic business rules.

## Solution

ClaimShield AI combines:

1. **Deterministic Evidence Checks**

   * Checks whether required documents are present.
   * Calculates evidence completeness.
   * Identifies missing evidence.

2. **Consistency Checking**

   * Compares incident dates across claim records and submitted documents.
   * Compares claim amount with repair estimate.
   * Detects missing or contradictory incident information.

3. **Policy Rule Engine**

   * Matches the incident type with applicable policy clauses.
   * Checks required evidence for each clause.
   * Detects configured policy exclusions.

4. **Deterministic Decision Engine**

   * Produces the primary claim recommendation.
   * Does not depend on an LLM for the actual policy decision.

5. **Gemini AI Reasoning**

   * Generates a concise explanation of the deterministic result.
   * Uses only verified claim, evidence, consistency, and policy-review information.
   * Does not override the deterministic decision.
   * Falls back safely to the rule-based result if Gemini is unavailable.

## Key Features

### Evidence Completeness

The system identifies whether the documents required for the relevant incident type are available.

Example:

```text
Claim Form              ✓
Incident Description    ✓
Repair Estimate         ✓
FIR                     Missing
```

### Cross-Document Consistency

The system checks information across the claim and evidence.

Examples:

* Incident date mismatch
* Claim amount vs repair estimate mismatch
* Missing incident description

### Policy Clause Matching

The system maps incidents to predefined policy clauses such as:

| Clause | Coverage                |
| ------ | ----------------------- |
| 4.2    | Accidental Damage       |
| 5.1    | Theft of Vehicle        |
| 6.3    | Third-Party Liability   |
| 7.4    | Natural Calamity Damage |
| 8.1    | Fire Damage             |

### Explainable Decisions

The application provides:

* Applicable policy clause
* Evidence supporting the clause
* Missing information
* Consistency findings
* Policy exclusions
* Final recommendation
* AI-generated explanation when Gemini is available

### Four Possible Decisions

```text
APPROVED
REJECTED
REQUEST_INFORMATION
ESCALATE
```

The system escalates uncertain or inconsistent cases rather than inventing missing information.

---

# System Architecture

```text
                 ┌─────────────────────────┐
                 │       React UI           │
                 │   Claims Dashboard       │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │     Flask Backend       │
                 │        app.py            │
                 └────────────┬────────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
       ┌────────────┐  ┌──────────────┐  ┌──────────────┐
       │ Evidence   │  │ Consistency  │  │ Policy       │
       │ Check      │  │ Check        │  │ Engine       │
       └────────────┘  └──────────────┘  └──────┬───────┘
                                                 │
                                                 ▼
                                      ┌────────────────────┐
                                      │ Deterministic      │
                                      │ Decision Engine    │
                                      └─────────┬──────────┘
                                                │
                                                ▼
                                      ┌────────────────────┐
                                      │ Gemini AI Reasoning│
                                      │ Explanation Only   │
                                      └────────────────────┘
```

## AI and Deterministic Logic Separation

A core design principle of ClaimShield AI is the separation between **business-rule decisioning** and **LLM reasoning**.

### Deterministic Layer

The deterministic layer performs:

* Evidence completeness
* Consistency checks
* Policy matching
* Exclusion checks
* Final decision

Therefore, the actual policy recommendation does not depend on the LLM.

### Gemini Layer

Gemini is used only to explain the already-generated result.

The AI prompt explicitly instructs Gemini to:

* Never override the deterministic decision.
* Use only supplied review data.
* Never invent evidence.
* Never invent policy clauses.
* Mention relevant policy information.
* Explain missing evidence and inconsistencies.
* Produce a concise reviewer-friendly explanation.

If Gemini is unavailable, the deterministic decision remains available.

---

# Technology Stack

## Backend

* Python 3.11+
* Flask
* Flask-CORS
* Google GenAI SDK

## Frontend

* React
* Vite
* Tailwind CSS
* Recharts
* Lucide React

## AI

* Google Gemini
* Gemini model used for reasoning/explanation
* `gemini-embedding-001` can be used for local policy retrieval where required

## Data

The prototype uses generated synthetic claim and policy data stored locally as JSON.

No real customer or insurance data is used.

---

# Project Structure

```text
claimshield-ai/
│
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
│
├── data/
│   ├── claims.json
│   └── policies.json
│
├── src/
│   ├── evidence_check.py
│   ├── consistency.py
│   ├── policy_engine.py
│   ├── decision_engine.py
│   ├── ai_reasoning.py
│   └── review_claim.py
│
├── frontend/
│   └── dist/
│       ├── index.html
│       └── assets/
│
└── client/
    ├── src/
    ├── package.json
    ├── vite.config.js
    └── ...
```

The committed `frontend/dist` directory allows the complete application to be served by Flask after installation without requiring a separate frontend development server.

---

# Installation

## Requirements

* Python 3.11 or newer
* Gemini API key
* Internet connection for Gemini AI functionality

## 1. Clone the repository

```bash
git clone https://github.com/Agalya-2006/Claimshield-ai.git
cd Claimshield-ai
```

## 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

## 3. Configure Gemini API Key

Set the environment variable:

### Windows PowerShell

```powershell
$env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### Windows Command Prompt

```cmd
set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Linux / macOS

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Never commit the API key to GitHub.

## 4. Start the application

From the repository root:

```bash
python app.py
```

The application will be available at:

```text
http://localhost:8000
```

The backend serves both the REST API and the production React frontend.

---

# One-Command Runtime Requirement

The application is designed so that the complete system can be launched from the repository root using:

```bash
pip install -r requirements.txt
python app.py
```

No separate Node.js server is required for the production demo.

No separate frontend terminal is required.

---

# Environment Variables

The application supports the following environment variable:

```text
GEMINI_API_KEY
```

Example:

```text
GEMINI_API_KEY=your-key-here
```

Do not commit `.env` files or API keys.

Recommended `.gitignore` entries include:

```text
.env
__pycache__/
*.pyc
```

---

# API Endpoints

## Health

```http
GET /api/health
```

Returns backend and AI availability information.

## Claims

```http
GET /api/claims
```

Returns the claim list and review summaries.

## Claim Review

```http
GET /api/claims/<claim_id>
```

Returns:

* Claim information
* Evidence
* Completeness
* Consistency
* Policy results
* Deterministic decision
* Missing information
* Gemini explanation

Example:

```http
GET /api/claims/CLM-1001
```

## Policies

```http
GET /api/policies
```

Returns the available policy clauses.

## Audit Logs

```http
GET /api/audit-logs
```

Returns claim review activity.

## Analytics

```http
GET /api/analytics/summary
```

Returns aggregate review statistics.

---

# Sample Claim Scenarios

The prototype includes eight synthetic motor insurance claims designed to demonstrate different review outcomes.

### CLM-1001 — Complete Accident Claim

Expected outcome:

```text
Evidence: Complete
Consistency: Consistent
Policy: Clause 4.2
Decision: APPROVED
```

### CLM-1002 — Theft Claim

Demonstrates theft-specific evidence requirements and Clause 5.1.

### CLM-1003 — Inconsistent Accident Claim

Contains an incident-date inconsistency.

Expected behavior:

```text
Decision: ESCALATE
```

The system does not automatically approve an inconsistent claim.

### CLM-1004 — Third-Party Claim

Demonstrates missing FIR evidence.

Expected behavior:

```text
REQUEST_INFORMATION
```

### CLM-1005 — Natural Calamity Claim

Demonstrates flood-related vehicle damage and Clause 7.4.

### CLM-1006 — Fire Claim

Demonstrates fire-damage policy requirements and missing evidence.

### CLM-1007 — Complete Accident Claim

Demonstrates another consistent and complete accident claim.

### CLM-1008 — Wear-and-Tear Exclusion

Demonstrates an applicable policy exclusion.

Expected behavior:

```text
REJECTED
```

---

# Decision Flow

```text
                 Claim Submitted
                       │
                       ▼
              Identify Incident Type
                       │
                       ▼
              Determine Required Docs
                       │
                       ▼
             Check Evidence Completeness
                       │
                       ▼
              Check Consistency
                       │
                       ▼
               Match Policy Clause
                       │
                       ▼
              Check Policy Exclusions
                       │
                       ▼
            Deterministic Decision Engine
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
          APPROVE    REJECT    REQUEST INFO
                       │
                       ▼
                    ESCALATE
                       │
                       ▼
              Gemini Explanation
                       │
                       ▼
              Reviewer Dashboard
```

---

# Responsible AI Design

ClaimShield AI follows a conservative AI-assisted workflow.

The LLM does not independently determine claim eligibility.

Instead:

```text
Rules → Decision → Gemini Explanation
```

This reduces the risk of:

* Hallucinated policy clauses
* Invented evidence
* Unsupported approvals
* Unsupported rejections

When information is contradictory or insufficient, the system can request additional information or escalate the case for human review.

---

# Edge Case Handling

The system is designed to handle:

* Missing documents
* Missing incident descriptions
* Date mismatches
* Claim amount mismatches
* Missing FIR
* Policy exclusions
* Unsupported incident types
* Gemini API unavailability
* Empty AI responses
* Invalid or incomplete evidence

If Gemini is unavailable, the application retains the deterministic decision and clearly informs the reviewer that the AI explanation is unavailable.

---

# Synthetic Data

All demonstration claims and policy records are synthetic and locally stored.

The project does not require a proprietary claims dataset.

Synthetic examples were created to demonstrate:

* Complete claims
* Incomplete claims
* Contradictory claims
* Excluded claims
* Multiple incident types
* Different evidence requirements

This makes the application reproducible for evaluation without exposing real customer information.

---

# Performance and Reliability

The application uses local JSON data and deterministic rule processing for core claim review.

Reviewed claims are cached during application runtime to reduce repeated processing.

The Gemini explanation is isolated from the deterministic decision layer so temporary AI failures do not prevent the core claim review from operating.

---

# Demo Flow

Recommended demonstration:

1. Start the application:

```bash
python app.py
```

2. Open:

```text
http://localhost:8000
```

3. Open the Claims dashboard.

4. Select:

```text
CLM-1001
```

5. Demonstrate:

```text
Evidence Completeness → 100%
Consistency → Consistent
Policy → Clause 4.2
Decision → APPROVED
```

6. Show the Gemini-generated explanation.

7. Open an incomplete or inconsistent claim such as:

```text
CLM-1003
```

8. Demonstrate how the system detects inconsistency and escalates instead of blindly approving the claim.

9. Open:

```text
CLM-1008
```

to demonstrate policy exclusion handling.

---

# Evaluation Alignment

ClaimShield AI is designed around the evaluation areas of the challenge.

### Working Application

A complete React + Flask application is served from the repository.

### Engineering Quality

The project separates:

* Evidence checking
* Consistency checking
* Policy evaluation
* Decision logic
* AI explanation

### End-to-End Workflow

The system supports:

```text
Claim → Evidence → Validation → Policy → Decision → Explanation
```

### Grounded GenAI

Gemini receives verified review information and is explicitly instructed not to invent evidence or policy information.

### Escalation

Claims with contradictions or unsupported scenarios can be escalated for manual review.

### Problem Understanding

The system focuses on the actual insurance evidence-review workflow rather than using AI as an unrestricted decision maker.

---

# Security

Never commit secrets.

Do not add:

```text
GEMINI_API_KEY=actual-key
```

to a committed source file.

Use environment variables instead.

The repository should contain no API keys, passwords, tokens, or private customer information.

---

# Limitations

This prototype uses synthetic data and a small locally defined policy set.

It is not intended to replace a production insurance claims management system.

A production implementation would additionally require:

* Secure authentication
* Role-based access control
* Encrypted document storage
* Production database
* Full document OCR
* Formal policy version management
* Human approval workflows
* Comprehensive audit controls
* Regulatory compliance
* Production monitoring

---

# Future Enhancements

Possible future improvements include:

* Upload real claim documents through the UI
* OCR and structured extraction
* Local semantic policy retrieval
* More advanced evidence citations
* Role-based reviewer access
* Human-in-the-loop approval
* Persistent audit database
* Policy version comparison
* Fraud-risk indicators
* Automated claimant notification workflows
* Advanced analytics and reporting

---

# Repository

GitHub:

https://github.com/Agalya-2006/Claimshield-ai

---

# Demo

Application:

```text
http://localhost:8000
```

Run locally using:

```bash
pip install -r requirements.txt
python app.py
```

---

# Submission Checklist

Before submission, verify:

* [ ] `TRACK_ID=PS02` is the first README line
* [ ] `app.py` exists at repository root
* [ ] `requirements.txt` exists at repository root
* [ ] `README.md` exists at repository root
* [ ] `frontend/dist` is committed
* [ ] No API keys are committed
* [ ] Application starts with `python app.py`
* [ ] Application runs on port 8000
* [ ] Claims dashboard loads
* [ ] CLM-1001 produces APPROVED
* [ ] Inconsistent claim produces ESCALATE
* [ ] Excluded claim produces REJECTED
* [ ] Missing-evidence claim can request information
* [ ] Gemini explanation works when `GEMINI_API_KEY` is configured
* [ ] Deterministic decision remains available if Gemini is unavailable
* [ ] Git history contains meaningful commits
