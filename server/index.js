const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const store = {
  currency: 'USD',
  categories: [
    { id: 'rent', name: 'Rent', type: 'fixed', amount: 1500 },
    { id: 'subscriptions', name: 'Subscriptions', type: 'fixed', amount: 100 },
    { id: 'savings', name: 'Savings', type: 'percent', percent: 30 },
    { id: 'wants', name: 'Wants', type: 'percent', percent: 20 },
    { id: 'needs', name: 'Needs', type: 'percent', percent: 50 }
  ]
};

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/categories', (_req, res) => {
  res.json({ currency: store.currency, categories: store.categories });
});

app.post('/categories', (req, res) => {
  const { category, error } = parseCategory(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!canSupportPercent(category.percent ?? 0)) {
    return res.status(400).json({ error: 'Percentage categories cannot exceed 100% in total.' });
  }

  const id = generateId(category.name);
  store.categories.push({ ...category, id });
  res.status(201).json({ category: { ...category, id } });
});

app.put('/categories/:id', (req, res) => {
  const index = store.categories.findIndex((cat) => cat.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  const current = store.categories[index];
  const { category, error } = parseCategory(req.body, current);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!canSupportPercent(category.percent ?? 0, current.id)) {
    return res.status(400).json({ error: 'Percentage categories cannot exceed 100% in total.' });
  }

  store.categories[index] = { ...current, ...category };
  res.json({ category: store.categories[index] });
});

app.delete('/categories/:id', (req, res) => {
  const index = store.categories.findIndex((cat) => cat.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  store.categories.splice(index, 1);
  res.status(204).send();
});

app.post('/allocate', (req, res) => {
  const amount = toNumber(req.body.amount);
  if (!isValidMoney(amount)) {
    return res.status(400).json({ error: 'A numeric paycheck amount is required.' });
  }

  const sourceCategories = Array.isArray(req.body.categories) && req.body.categories.length
    ? normalizeCategories(req.body.categories)
    : store.categories;

  if (Array.isArray(sourceCategories)) {
    const percentTotal = percentageTotal(sourceCategories);
    if (percentTotal > 100) {
      return res.status(400).json({ error: 'Percentage categories cannot exceed 100%.' });
    }
  } else {
    return res.status(400).json({ error: sourceCategories.error });
  }

  const { allocations, fixedTotal, variableTotal } = buildAllocations(amount, sourceCategories);
  if (!allocations) {
    return res.status(400).json({ error: 'Fixed amounts exceed the paycheck amount.' });
  }

  const remainingAfterFixed = roundMoney(amount - fixedTotal);
  const leftover = roundMoney(remainingAfterFixed - variableTotal);

  res.json({
    currency: req.body.currency || store.currency,
    grossIncome: roundMoney(amount),
    fixedTotal,
    percentageTotal: percentageTotal(sourceCategories),
    remainingAfterFixed,
    totalAllocated: roundMoney(fixedTotal + variableTotal),
    leftover,
    allocations
  });
});

app.listen(PORT, () => {
  console.log(`WISE.budget backend running on http://localhost:${PORT}`);
});

function parseCategory(payload, fallback = {}) {
  const name = typeof payload.name === 'string' ? payload.name.trim() : fallback.name;
  const type = payload.type ?? fallback.type;

  if (!name) {
    return { error: 'Category name is required.' };
  }

  if (type !== 'fixed' && type !== 'percent') {
    return { error: 'Category type must be either "fixed" or "percent".' };
  }

  const category = { id: fallback.id, name, type };

  if (type === 'fixed') {
    const amount = toNumber(payload.amount ?? fallback.amount);
    if (!isValidMoney(amount)) {
      return { error: 'A numeric "amount" is required for fixed categories.' };
    }
    category.amount = roundMoney(amount);
  } else {
    const percent = toNumber(payload.percent ?? fallback.percent);
    if (!Number.isFinite(percent) || percent <= 0) {
      return { error: 'A positive numeric "percent" is required for percentage categories.' };
    }
    category.percent = roundMoney(percent);
  }

  return { category };
}

function normalizeCategories(list) {
  const normalized = [];

  for (const payload of list) {
    const { category, error } = parseCategory(payload);
    if (error) {
      return { error };
    }
    normalized.push({ ...category, id: category.id || generateId(category.name) });
  }

  return normalized;
}

function canSupportPercent(incomingPercent, excludeId) {
  const percentSum = store.categories
    .filter((cat) => cat.type === 'percent' && cat.id !== excludeId)
    .reduce((total, cat) => total + cat.percent, 0);

  return percentSum + (incomingPercent || 0) <= 100;
}

function percentageTotal(categories) {
  return roundMoney(
    categories.reduce((total, cat) => total + (cat.type === 'percent' ? cat.percent : 0), 0)
  );
}

function buildAllocations(amount, categories) {
  const fixedTotal = roundMoney(
    categories.reduce((total, cat) => total + (cat.type === 'fixed' ? cat.amount : 0), 0)
  );

  if (fixedTotal > amount) {
    return { allocations: null, fixedTotal, variableTotal: 0 };
  }

  const remaining = amount - fixedTotal;
  const allocations = categories.map((cat) => {
    const allocated = cat.type === 'fixed'
      ? cat.amount
      : roundMoney((cat.percent / 100) * remaining);

    const rule = cat.type === 'fixed'
      ? { amount: cat.amount }
      : { percent: cat.percent };

    return {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      rule,
      allocated
    };
  });

  const variableTotal = roundMoney(
    allocations.reduce((total, item) => total + (item.type === 'percent' ? item.allocated : 0), 0)
  );

  return { allocations, fixedTotal, variableTotal };
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
}

function isValidMoney(value) {
  return Number.isFinite(value) && value >= 0;
}

function generateId(name) {
  const sanitized = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'cat';
  return `${sanitized}-${Math.random().toString(36).slice(2, 8)}`;
}
