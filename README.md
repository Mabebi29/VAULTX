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
- `GET /categories` → current in-memory categories.
- `POST /categories` → add a category. Body: `{ "name": "Rent", "type": "fixed", "amount": 1200 }` or `{ "name": "Savings", "type": "percent", "percent": 25 }`.
- `PUT /categories/:id` → update a category (same body rules as POST).
- `DELETE /categories/:id` → remove a category.
- `POST /allocate` → split a paycheck. Body:
  - `amount` (number, required)
  - `currency` (string, optional, defaults to USD)
  - `categories` (optional array). If omitted, uses the stored categories; if provided, the request categories are used just for that allocation.

Example allocation using the default rules that mirror the idea in the brief:

```bash
curl -X POST http://localhost:4000/allocate \
  -H "Content-Type: application/json" \
  -d '{ "amount": 3000 }'
```

This splits $3,000 into $1,600 fixed (rent + subscriptions), then applies 30/20/50% to the remaining $1,400 for savings, wants, and needs. Percentages must total 100% or less; fixed amounts cannot exceed the paycheck.
