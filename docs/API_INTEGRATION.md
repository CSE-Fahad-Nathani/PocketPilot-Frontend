# PocketPilot — API Integration Document

Living contract for the frontend. Integrate only from this document — do not invent endpoints or reshape responses.

**Response envelope (all modules):**

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

---

## Cycles

Status: ✅ Integrated & verified

| Method | Endpoint | Body |
|--------|----------|------|
| `POST` | `/api/cycles/create` | `{ "cycleName", "startDate" }` |
| `GET` | `/api/cycles/active` | — |
| `GET` | `/api/cycles/history` | — completed cycles (latest first) |
| `POST` | `/api/cycles/verify-end` | `{ "cycleId" }` → summary (`total_income`, `total_expense`, `total_saved`) |
| `POST` | `/api/cycles/end` | `{ "cycleId", "endDate" }` |

Notes:
- Only one `ACTIVE` cycle allowed; create fails if one already exists
- End flow: verify-end → confirmation modal (backend totals) → optional Quick Adjustment → end
- Quick Adjustment: Add Income (Other) or Add Expense under reusable **Missed** budget (+ matching expense)
- After each adjustment, verify-end is called again and totals refresh on screen 1
- Frontend must never calculate or send totals (planned budget / income / expense / saved)
- Frontend: `src/services/cycleService.js`, `EndCycleModal` on Dashboard

---

## Categories

Status: ✅ Integrated

| Method | Endpoint | Notes |
|--------|----------|-------|
| — | See `src/services/categoryService.js` | CRUD against active cycle |

---

## Income

Status: ✅ Integrated

| Method | Endpoint | Notes |
|--------|----------|-------|
| — | See `src/services/incomeService.js` | Create/list income for cycle |

---

## Expenses

Status: ✅ Integrated

Base URL: `/api/expenses`

| Method | Endpoint | Body / Query |
|--------|----------|--------------|
| `POST` | `/create` | `{ cycleId, categoryId, expenseDate, amount, reason, note?, extraData? }` |
| `GET` | `/` | `?cycleId=` — list includes `category_name`, `icon`, `color` |
| `GET` | `/:id` | single expense |
| `POST` | `/update` | `{ id, categoryId, expenseDate, amount, reason, note?, extraData? }` |
| `POST` | `/delete` | `{ id }` |

Validations (backend):
- Cycle and category must exist; category must belong to cycle
- Amount > 0; reason required; expense date required

Frontend:
- `src/services/expenseService.js`
- `src/store/expenseStore.js`
- `src/pages/Expenses.jsx` at route `/expenses`
- `src/utils/expenseExtraData.js` — category-specific `extraData` field configs

### extraData (JSONB, frontend-owned)

Common fields always: category, amount, date, reason, note.

Additional fields by category type/name → packed into `extraData`:

| Category | extraData keys |
|----------|----------------|
| Fuel | `distance`, `liters`, `mileage` (auto: distance ÷ liters); reason hidden |
| EMI / SIP / Gym / Loan | No extra fields — category, date, amount only |

Backend stores/returns `extraData` as-is; no schema validation.

---

## Category Transfers

Status: ✅ Integrated

Base URL: `/api/category-transfers`

| Method | Endpoint | Body / Query |
|--------|----------|--------------|
| `POST` | `/create` | `{ cycleId, fromCategoryId, toCategoryId, amount, transferDate, note? }` |
| `GET` | `/` | `?cycleId=` — includes from/to category name, icon, color |
| `GET` | `/:id` | single transfer |
| `POST` | `/update` | `{ id, fromCategoryId, toCategoryId, amount, transferDate, note? }` |
| `POST` | `/delete` | `{ id }` |

Validations (backend):
- Amount > 0; from ≠ to; both categories must belong to the cycle

Frontend:
- `src/services/categoryTransferService.js`
- `src/store/categoryTransferStore.js`
- `src/pages/CategoryTransfers.jsx` at route `/transfers`

Do not recalculate budgets on the frontend — refresh lists after mutations.

---

## Future Modules

| Module | Status |
|--------|--------|
| Settings | Not started |
| Saving Buckets | ✅ Create + list (Analysis) |
| Charts / Insights / Filters / Export | Planned on Analysis page |
| Budget Alerts | Not started |
| Recurring Expenses | Not started |

---

## Analysis & Savings

Status: ✅ Integrated

### Cycle analysis

| Method | Endpoint | Notes |
|--------|----------|------|
| `GET` | `/api/cycles/history` | Completed cycles list |
| `GET` | `/api/analysis/cycles/:cycleId` | Full cycle analysis: summary + `incomes`, `categories`, `expenses`, `savings` |

Display backend values only — do not recalculate planned/spent/remaining/totals on the frontend.

Frontend:
- `src/services/analysisService.js`, `src/services/cycleService.js` (`getCycleHistory`)
- `src/store/analysisStore.js`
- `src/pages/Analysis.jsx` at `/analysis`

### Savings

| Method | Endpoint | Notes |
|--------|----------|------|
| `GET` | `/api/savings` | All savings transactions |
| `GET` | `/api/savings/:id` | Single saving (edit modal) |
| `PUT` | `/api/savings/:id` | Update type/title/amount/date/note/bucketId |
| `DELETE` | `/api/savings/:id` | Delete after confirm |

**Do not integrate Create Saving** — deposits are auto-created on `POST /cycles/end`.

Use Update to adjust deposits or convert to withdrawals (e.g. spent from savings).

Frontend:
- `src/services/savingService.js`
- `src/store/savingStore.js`
- `SavingEditModal` on Analysis page

Available with or without an active cycle (Setup + Stats nav when no cycle).

### Savings Distribution

| Method | Endpoint | Notes |
|--------|----------|------|
| `GET` | `/api/saving-buckets` | List buckets |
| `POST` | `/api/saving-buckets/create` | `{ name, icon?, color? }` |
| `GET` | `/api/saving-allocations/pending` | Savings with remaining to distribute |
| `POST` | `/api/saving-allocations/distribute` | `{ savingId, allocations: [{ bucketId, amount }] }` |

Frontend:
- `src/services/savingBucketService.js`, `src/services/savingAllocationService.js`
- `src/store/savingBucketStore.js`, `src/store/savingAllocationStore.js`
- `src/components/analysis/*` on Analysis page

Validations (UI): amount > 0, total ≤ remaining, no duplicate buckets, live remaining, Save disabled until valid.

| Method | Endpoint | Notes |
|--------|----------|------|
| `POST` | `/api/saving-buckets/withdraw` | `{ bucketId, amount, title, note? }` |
| `POST` | `/api/saving-buckets/transfer` | `{ fromBucketId, toBucketId, amount, title, note? }` |
| `PATCH` | `/api/saving-buckets/archive/:id` | Archive bucket (balance must be 0) |

After withdraw, transfer, archive, or distribute — refresh buckets, pending savings, and transaction history.

---

## Transaction History

Status: ✅ Integrated

| Method | Endpoint | Notes |
|--------|----------|------|
| `GET` | `/api/transactions` | All bucket transactions, newest first (`createdAt DESC`) |

Response item shape:

```json
{
  "id": 7,
  "type": "ALLOCATION",
  "amount": "100.00",
  "title": "Test 4 Savings",
  "note": null,
  "transactionDate": "2026-07-26T18:30:00.000Z",
  "createdAt": "2026-07-27T04:57:21.283Z",
  "bucketName": "Trip"
}
```

Supported types: `ALLOCATION`, `WITHDRAWAL`, `TRANSFER_IN`, `TRANSFER_OUT`, `ARCHIVE`.

Frontend:
- `src/services/transactionService.js`
- `src/store/transactionStore.js`
- `src/pages/TransactionHistory.jsx` at `/transactions`
- `src/components/transactions/*` — cards, filters, search, skeleton, empty state

Client-side only: filter by type, search title/bucket/note. Sort order preserved from API.

Refresh transaction list after allocation, withdraw, transfer, or archive completes (`SavingsDistribution.refreshAll`).

Available with or without an active cycle (History nav when no cycle).

Future-ready (not implemented): pagination, infinite scroll, export, date/bucket/amount filters, details modal.
