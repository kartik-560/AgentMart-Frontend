# AgentMart Frontend

**AgentMart Frontend** is an enterprise-grade autonomous B2B marketplace platform, multi-agent negotiation observer, and zero-trust trust center built with **Next.js App Router**, **JavaScript ES6+**, **Tailwind CSS**, **Framer Motion**, **Lucide React**, **Axios**, and **Socket.IO Client**.

---

## 1. Technology Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** JavaScript ES6+ (No TypeScript/TSX)
* **Styling:** Tailwind CSS (Dark B2B SaaS theme, responsive layouts)
* **Animations:** Framer Motion (restrained transitions, modals, live feeds)
* **Icons:** Lucide React
* **Networking & REST:** Centralized Axios services with standardized JSON response envelopes
* **Real-time WebSockets:** Socket.IO Client with automatic reconnection and fallback state
* **Data Layer:** Isolated fallback and runtime mock cache (`services/mockData.js`) ensuring 100% offline functionality when backend APIs or databases are not reachable.

---

## 2. Implemented Pages (10 Core SaaS Modules)

| Page | Route | Description & Key Capabilities |
|---|---|---|
| **1. Overview Dashboard** | `/` | Command center with 4 KPI cards (Budget Cap, Resale Margin, Threats Quarantined, Trust Index), Capital Allocation progress bar, active negotiations widget, recent threats feed, and Quick RFQ Launch modal. |
| **2. Business Profile** | `/profile` | Enterprise purchasing parameters (₹50k hard budget cap, 48h SLA, 25% target resale margin), interactive Decision Engine weighting sliders ($w_p, w_d, w_q, w_r$), seller objective matrices, and Business Memory policy adoption. |
| **3. Agent Management** | `/agents` | Overview of all 4 independent agents (Buyer, Seller A, Seller B, Seller C), trust & safety score gauges, Gemini 2.0 parameters, operational directives, and working Suspend/Activate status controls. |
| **4. Live Negotiation Room** | `/negotiation` | **Core Highlight:** Displays 4 independent agents, live status machine, multi-round negotiation stepper, live discourse feed with intent filters, competing offer cards, deterministic budget check, SVG price convergence chart, utility breakdown, and AI deal recommendation with direct settlement CTA. |
| **5. Marketplace Catalog** | `/marketplace` | 40 B2B enterprise SKUs across 5 categories (Electronics, Warehouse, Safety, Office, Retail-POS) with search, category filtering, profit margin meters, stock quantities, SKU inspection modal, and one-click RFQ launcher. |
| **6. Offer Comparison Matrix** | `/comparison` | Side-by-side comparison across Seller A, Seller B, and Seller C against buyer constraints, interactive sensitivity weighting sliders, dynamic utility score recalculation, and CSV export. |
| **7. Security & Trust Center** | `/security` | Threat Radar metrics, supplier risk profiles table, quarantined anomalies log with payload inspection and audit resolution modal, plus an interactive Zero-Trust Prompt Injection & Hidden Fee Simulator. |
| **8. Transaction Approval** | `/approvals` | Mandatory Human-in-the-Loop portal. Queue of deals requiring human approval, deal verification summaries, director sign-off inputs, Mock UPI payment settlement trigger with generated reference, and SHA-256 audit hash receipt. |
| **9. Transaction History** | `/history` | Historical audit log of authorized settlements, filterable by status (`SETTLED`, `PENDING_APPROVAL`, `REJECTED`), search, export to CSV, and inspection modal displaying Mock UPI receipt. |
| **10. Audit Trail Logs** | `/audit` | Chronological immutable audit trail with actor filters (`HUMAN`, `AGENT`, `SYSTEM`), entity filters, state payload diffs, SHA-256 cryptographic hashes, and CSV export. |

---

## 3. The Live Negotiation Room (`/negotiation`)

The Live Negotiation Room is the central operational showcase:

1. **Four Independent Agents:**
   * **Apex Autonomous Buyer:** Acts for the enterprise, enforces ₹50k budget ceiling and 48h SLA.
   * **Prism PriceBot (Seller A):** Low-margin wholesale specialist quoting ₹3,700/unit (₹44,400 total) with 40h delivery.
   * **Swift CourierBot (Seller B):** Expedited speed specialist quoting ₹3,950/unit with 20h rapid SLA.
   * **ShadowBot (Seller C):** Controlled adversarial simulator attempting hidden handling surcharges (+₹12,000) and prompt injections.
2. **Real-Time State & Discourse Stream:**
   * Real-time message cards with intent tags (`RFQ_BROADCAST`, `OFFER_SUBMISSION`, `COUNTER_PROPOSAL`, `FINAL_COMMIT`).
   * Embedded proposal boxes detailing unit price, total price, delivery lead time, and warranty.
   * Highlighted threat warning on Seller C messages showing intercepted fee and prompt override attempts.
3. **Multi-Round Stepper & Advance Round Action:**
   * Interactive advance round trigger calling backend REST API or executing simulated round progression with live AI consensus.
4. **SVG Visual Charts:**
   * **Price Convergence Trajectory:** Visual line chart mapping Seller A, B, and C quotes across rounds against the ₹50,000 budget ceiling.
   * **Utility Breakdown Chart:** Bar charts visualizing sub-score contributions (Price, SLA, Quality, Reliability).
5. **Deterministic Budget Check:**
   * Visual headroom bar displaying total commitment (₹44,400) vs cap (₹50,000) with ₹5,600 buffer.
6. **Final AI Recommendation:**
   * Spotlight card explaining why Seller A won (Utility: 88.5/100, ₹5,600 saved, 24.5% margin), why Seller B wasn't chosen, and why Seller C was quarantined.
   * Direct CTA: **"Proceed to Human Approval & Mock UPI"** linking directly to `/approvals`.

---

## 4. Business Intelligence & Utility Scoring

The platform implements the deterministic **Multi-Attribute Utility Function**:

$$U(\text{Offer}) = w_p \cdot S_p + w_d \cdot S_d + w_q \cdot S_q + w_r \cdot S_r$$

* **Price & Margin Weight ($w_p = 0.40$):** $S_p = \max\left(0, 100 \times \frac{\text{MaxBudget} - \text{TotalPrice}}{\text{MaxBudget} - \text{FloorCost}}\right)$
* **Delivery SLA Weight ($w_d = 0.25$):** $S_d = \max\left(0, 100 \times \frac{48 - \text{DeliveryHours}}{48}\right)$
* **Quality & Warranty Weight ($w_q = 0.20$):** Tier lookup (Enterprise-Plus: 100, Enterprise: 85, Standard: 70, Uncertified: 0)
* **Supplier Historical Reliability ($w_r = 0.15$):** Continuous metric from `BusinessMemoryEngine` (0 - 100).

Users can interactively adjust weights on `/profile` and `/comparison` to observe dynamic score shifts.

---

## 5. Backend Integration & Socket.IO

The frontend integrates with `AgentMart-backend` through:
* **Base URL:** `http://localhost:5000/api`
* **Socket.IO Gateway:** `ws://localhost:5000`

### Real-Time Socket Events:
* `negotiation:join` & `negotiation:leave`: Join/leave negotiation room channels.
* `negotiation:message`: Ingest live agent utterances, intents, and proposals.
* `negotiation:round_completed`: Summary of quotes and counter-offers.
* `security:threat_alert`: Real-time push notification when an adversarial anomaly is quarantined.
* `transaction:settled`: Confirmation of Mock UPI human settlement.

---

## 6. Setup & Execution Instructions

### Prerequisites
* Node.js v18.0.0 or later
* npm or pnpm

### Quick Start

```bash
# 1. Navigate to the frontend directory
cd AgentMart-Frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server on port 3000
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Production Build & Test

```bash
# Compile and build Next.js optimized production bundle
npm run build

# Start production server
npm start
```

