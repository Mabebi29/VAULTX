# VAULTX

WISE.budget backend: a tiny Express server that splits a paycheck into fixed amounts first, then percentages across the remaining balance. Data lives in memory so you can experiment without a database.

## Run the server

```bash
cd server
npm start
# server listens on http://localhost:4000
```

## API

- `GET /health` → quick status check.
- Paycheck:
  - `GET /paycheck` → see current paycheck + last allocation.
  - `PUT /paycheck` → set/update paycheck and refresh allocation with stored categories. Body: `{ "amount": 3200, "currency": "EUR" }`.
- Onboarding:
  - `GET /onboarding` → returns `{ onboarding: { completed: boolean, updatedAt: string } }`.
  - `PUT /onboarding` → set onboarding status. Body: `{ "completed": true }`.
- Categories:
  - `GET /categories` → categories with `allocated`, `spent`, and `remaining` fields.
  - `POST /categories` → add a category. Body: `{ "name": "Rent", "type": "fixed", "amount": 1200 }` or `{ "name": "Savings", "type": "percent", "percent": 25 }`.
  - `PUT /categories/:id` → update a category (same body rules as POST).
  - `DELETE /categories/:id` → remove a category.
- Transactions:
  - `GET /transactions?categoryId=<id>` → list transactions (optionally filtered by category).
  - `POST /transactions` → add an expense. Body: `{ "categoryId": "groceries", "amount": 42.75, "note": "Market run" }`.
- Allocation:
  - `POST /allocate` → split a paycheck. Body: `{ "amount": 3000, "currency": "USD", "save": true }`. Set `save: true` to update the stored paycheck/allocation; omit or `false` to just preview. Optional `categories` array lets you preview with custom rules without persisting them.
  - `GET /summary` → totals for allocated vs. spent plus per-category usage.

Example allocation using the default rules that mirror the idea in the brief:

```bash
curl -X POST http://localhost:4000/allocate \
  -H "Content-Type: application/json" \
  -d '{ "amount": 3000, "save": true }'
```

This splits $3,000 into $2,050 fixed (rent + subscriptions + groceries), then applies 30/20/50% to the remaining balance for savings, wants, and needs. Percentages must total 100% or less; fixed amounts cannot exceed the paycheck. Transactions are kept in memory for the current server run so the UI can show per-category spending.
