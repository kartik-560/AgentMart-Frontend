# AgentMart Frontend Integration Reference

This document provides frontend engineers with a quick reference for integrating UI components with the AgentMart backend services, REST APIs, and real-time Socket.IO events.

---

## 1. Environment Configuration

Defined in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

The frontend provides an initialized Axios client in `@/services/api` and a Socket.IO hook in `@/hooks/useSocket`.

---

## 2. API Endpoints Map

All requests return a standard JSON envelope: `{ success: boolean, statusCode: number, data: any, message?: string }`.

| Feature | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/health` | Service status, database & AI connectivity |
| **Business Profile** | `GET` | `/business/profile` | Current buyer profile, budget limits, target margins |
| **Business Profile** | `PUT` | `/business/profile` | Update profile preferences |
| **Catalog** | `GET` | `/products` | 40 B2B SKUs with costs, stock, lead time |
| **Agents** | `GET` | `/agents` | Status, trust scores, models for Buyer, Seller A, B, C |
| **Agents** | `PATCH`| `/agents/:id/status`| Suspend or resume rogue/adversarial agents |
| **Negotiations** | `GET` | `/negotiations` | List negotiation sessions |
| **Negotiations** | `POST`| `/negotiations` | Create session with SKU, quantity, budget cap |
| **Negotiations** | `GET` | `/negotiations/:id` | Detailed state, rounds, recommended deal |
| **Negotiations** | `POST`| `/negotiations/:id/advance-round` | Trigger next negotiation round |
| **Comparison** | `GET` | `/negotiations/:id/comparison` | Side-by-side matrix for Sellers A, B, C |
| **Transactions** | `GET` | `/transactions` | Pending and settled transactions |
| **Transactions** | `POST`| `/transactions/:id/approve` | Human approval + Mock UPI settlement trigger |
| **Transactions** | `POST`| `/transactions/:id/reject` | Human rejection of recommended deal |
| **Security** | `GET` | `/security/alerts` | List intercepted threats & prompt injections |
| **Audit Logs** | `GET` | `/audit/logs` | Immutable audit trail with hashes |

---

## 3. Real-Time Socket.IO Events

The Socket.IO client connects to `NEXT_PUBLIC_SOCKET_URL` (`http://localhost:5000`).

### Client Emits:
* `negotiation:join` -> `{ negotiationId: string }`
* `negotiation:leave` -> `{ negotiationId: string }`

### Server Emits:
* `negotiation:message`:
  ```json
  {
    "negotiationId": "string",
    "roundNumber": 1,
    "senderRole": "SELLER_A_PRICE",
    "content": "Quoting ₹3,700/unit...",
    "proposal": { "unitPrice": 3700, "totalPrice": 44400, "deliveryHours": 40 }
  }
  ```
* `negotiation:round_completed`:
  ```json
  {
    "negotiationId": "string",
    "round": 1,
    "offers": [ ... ],
    "recommendedOfferId": "string"
  }
  ```
* `security:threat_alert`:
  ```json
  {
    "negotiationId": "string",
    "threatType": "HIDDEN_FEE",
    "severity": "HIGH",
    "description": "Seller C attempted ₹12,000 hidden fee"
  }
  ```
* `transaction:settled`:
  ```json
  {
    "transactionId": "string",
    "mockUpiReference": "UPI-DEMO-998822",
    "settlementStatus": "SETTLED"
  }
  ```

---

## 4. UI Page Mapping (10 Core Pages)

1. **Overview Dashboard** -> `/`
2. **Business Profile** -> `/profile`
3. **Agent Management** -> `/agents`
4. **Live Negotiation Room** -> `/negotiation`
5. **Marketplace & Offers** -> `/marketplace`
6. **Offer Comparison** -> `/comparison`
7. **Security & Trust Center** -> `/security`
8. **Transaction Approval** -> `/approvals`
9. **Transaction History** -> `/history`
10. **Audit Logs** -> `/audit`

