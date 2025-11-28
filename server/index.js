const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;
const ALERT_THRESHOLDS = { nearRatio: 0.85 };

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const store = {
  currency: 'USD',
  paycheck: { amount: 3000, currency: 'USD', updatedAt: new Date().toISOString() },
  onboarding: { completed: false, updatedAt: new Date().toISOString() },
  alerts: [],
  categories: [
    { id: 'essentials', name: 'Essentials', type: 'percent', percent: 50, spendingCategories: ['bills', 'groceries', 'transport'] },
    { id: 'non-essentials', name: 'Non-essentials', type: 'percent', percent: 20, spendingCategories: ['eating_out', 'entertainment', 'shopping', 'subscriptions', 'health', 'education', 'family_and_friends'] },
    { id: 'uncategorized', name: 'Uncategorized', type: 'percent', percent: 30, spendingCategories: ['expenses', 'general', 'holiday', 'income', 'pets'] }
  ],
  transactions: [],
  lastAllocation: null
};

store.lastAllocation = initializeAllocation();
store.alerts = buildAlerts();

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/onboarding', (_req, res) => {
  res.json({ onboarding: store.onboarding });
});

app.put('/onboarding', (req, res) => {
  const completed = req.body.completed;
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be a boolean.' });
  }

  store.onboarding = { completed, updatedAt: new Date().toISOString() };
  res.json({ onboarding: store.onboarding });
});

app.get('/paycheck', (_req, res) => {
  res.json({ paycheck: store.paycheck, allocation: store.lastAllocation });
});

app.get('/alerts', (_req, res) => {
  const alerts = buildAlerts();
  res.json({
    currency: store.lastAllocation?.currency || store.currency,
    alerts,
    counts: alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {})
  });
});

app.put('/paycheck', (req, res) => {
  const amount = toNumber(req.body.amount);
  const currency = req.body.currency || store.currency;

  const allocation = calculateAllocation(amount, store.categories, currency);
  if (allocation.error) {
    return res.status(400).json({ error: allocation.error });
  }

  store.paycheck = { amount: allocation.grossIncome, currency, updatedAt: new Date().toISOString() };
  store.lastAllocation = { ...allocation, categories: store.categories };
  store.alerts = buildAlerts();

  res.json({ paycheck: store.paycheck, allocation: store.lastAllocation });
});

app.get('/categories', (_req, res) => {
  res.json({
    currency: store.lastAllocation?.currency || store.currency,
    paycheck: store.paycheck,
    categories: categoriesWithUsage()
  });
});

app.post('/categories', (req, res) => {
  const { category, error } = parseCategory(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  if (!canSupportPercent(category.percent ?? 0)) {
    return res.status(400).json({ error: 'Percentage categories cannot exceed 100% in total.' });
  }

  // Check for spending category conflicts
  if (category.spendingCategories) {
    const conflicts = checkSpendingCategoryConflicts(category.spendingCategories, null);
    if (conflicts) {
      const conflictList = conflicts.map(c => 
        `"${c.spendingCategory}" is already assigned to "${c.budgetCategoryName}"`
      ).join(', ');
      return res.status(400).json({ 
        error: `Spending category conflict: ${conflictList}. Each spending category can only be assigned to one budget category.` 
      });
    }
  }

  const nextCategory = { ...category, id: generateId(category.name) };
  const nextCategories = [...store.categories, nextCategory];

  const allocation = refreshAllocationForCategories(nextCategories);
  if (allocation && allocation.error) {
    return res.status(400).json({ error: allocation.error });
  }

  store.categories = nextCategories;
  store.alerts = buildAlerts();
  res.status(201).json({ category: nextCategory, allocation: store.lastAllocation });
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

  // Check for spending category conflicts
  if (category.spendingCategories) {
    const conflicts = checkSpendingCategoryConflicts(category.spendingCategories, current.id);
    if (conflicts) {
      const conflictList = conflicts.map(c => 
        `"${c.spendingCategory}" is already assigned to "${c.budgetCategoryName}"`
      ).join(', ');
      return res.status(400).json({ 
        error: `Spending category conflict: ${conflictList}. Each spending category can only be assigned to one budget category.` 
      });
    }
  }

  const updatedCategory = { ...current, ...category };
  const nextCategories = store.categories.map((cat) =>
    cat.id === updatedCategory.id ? updatedCategory : cat
  );

  const allocation = refreshAllocationForCategories(nextCategories);
  if (allocation && allocation.error) {
    return res.status(400).json({ error: allocation.error });
  }

  store.categories[index] = updatedCategory;
  store.alerts = buildAlerts();
  res.json({ category: store.categories[index], allocation: store.lastAllocation });
});

app.delete('/categories/:id', (req, res) => {
  const index = store.categories.findIndex((cat) => cat.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  const nextCategories = store.categories.filter((cat) => cat.id !== req.params.id);
  const allocation = refreshAllocationForCategories(nextCategories);
  if (allocation && allocation.error) {
    return res.status(400).json({ error: allocation.error });
  }

  store.categories.splice(index, 1);
  store.alerts = buildAlerts();
  res.status(204).send();
});

app.get('/transactions', (req, res) => {
  const { categoryId } = req.query;
  const transactions = categoryId
    ? store.transactions.filter((txn) => txn.categoryId === categoryId)
    : store.transactions;

  res.json({ transactions });
});

app.post('/transactions', (req, res) => {
  const amount = toNumber(req.body.amount);
  const categoryId = req.body.categoryId;
  const currency = req.body.currency || store.lastAllocation?.currency || store.currency;

  if (!isValidMoney(amount) || amount <= 0) {
    return res.status(400).json({ error: 'A positive numeric amount is required.' });
  }

  const category = store.categories.find((cat) => cat.id === categoryId);
  if (!category) {
    return res.status(400).json({ error: 'Valid categoryId is required for a transaction.' });
  }

  const transaction = {
    id: generateId('txn'),
    categoryId,
    amount: roundMoney(amount),
    currency,
    note: typeof req.body.note === 'string' ? req.body.note : undefined,
    occurredAt: req.body.occurredAt || new Date().toISOString()
  };

  store.transactions.push(transaction);
  const categoryUsage = categoriesWithUsage().find((cat) => cat.id === categoryId);

  store.alerts = buildAlerts();
  res.status(201).json({ transaction, category: categoryUsage });
});

app.post('/allocate', (req, res) => {
  const amount = toNumber(req.body.amount);

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

  const allocation = calculateAllocation(amount, sourceCategories, req.body.currency || store.currency);
  if (allocation.error) {
    return res.status(400).json({ error: allocation.error });
  }

  if (req.body.save) {
    // Persist categories when client provides a set to save
    if (Array.isArray(sourceCategories)) {
      store.categories = sourceCategories;
    }
    store.paycheck = {
      amount: allocation.grossIncome,
      currency: allocation.currency,
      updatedAt: new Date().toISOString()
    };
    store.lastAllocation = { ...allocation, categories: sourceCategories };
    store.alerts = buildAlerts();
  }

  res.json(allocation);
});

app.get('/summary', (_req, res) => {
  const categories = categoriesWithUsage();
  const allocatedTotal = roundMoney(
    categories.reduce((total, cat) => total + (cat.allocated || 0), 0)
  );
  const spentTotal = roundMoney(
    categories.reduce((total, cat) => total + (cat.spent || 0), 0)
  );

  const alerts = buildAlerts();

  res.json({
    currency: store.lastAllocation?.currency || store.currency,
    paycheck: store.paycheck,
    allocatedTotal,
    spentTotal,
    budgetUsedPercent: allocatedTotal ? roundMoney((spentTotal / allocatedTotal) * 100) : 0,
    leftoverBudget: roundMoney(allocatedTotal - spentTotal),
    unallocated: store.lastAllocation?.leftover ?? 0,
    alerts,
    categories
  });
});

app.listen(PORT, () => {
  console.log(`WISE.budget backend running on http://localhost:${PORT}`);
});

function initializeAllocation() {
  const allocation = calculateAllocation(store.paycheck.amount, store.categories, store.paycheck.currency);
  if (!allocation.error) {
    return { ...allocation, categories: store.categories };
  }
  return null;
}

function refreshAllocationForCategories(nextCategories) {
  if (!store.paycheck) return null;
  const allocation = calculateAllocation(store.paycheck.amount, nextCategories, store.paycheck.currency);
  if (allocation.error) {
    return { error: allocation.error };
  }
  store.lastAllocation = { ...allocation, categories: nextCategories };
  return store.lastAllocation;
}

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

  // Handle spending categories - always set it, even if empty array
  if (Array.isArray(payload.spendingCategories)) {
    category.spendingCategories = payload.spendingCategories;
  } else if (fallback.spendingCategories) {
    category.spendingCategories = fallback.spendingCategories;
  } else {
    category.spendingCategories = [];
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

function categoriesWithUsage() {
  const spendById = spendByCategory();
  const allocationMap = (store.lastAllocation?.allocations || []).reduce((acc, alloc) => {
    acc[alloc.id] = alloc.allocated;
    return acc;
  }, {});

  return store.categories.map((cat) => {
    const allocated = allocationMap[cat.id] ?? (cat.type === 'fixed' ? cat.amount : 0);
    const spent = spendById[cat.id] || 0;

    return {
      ...cat,
      allocated,
      spent,
      remaining: roundMoney(allocated - spent)
    };
  });
}

function spendByCategory() {
  return store.transactions.reduce((acc, txn) => {
    acc[txn.categoryId] = roundMoney((acc[txn.categoryId] || 0) + txn.amount);
    return acc;
  }, {});
}

function buildAlerts() {
  const categories = categoriesWithUsage();
  const currency = store.lastAllocation?.currency || store.currency;

  return categories.flatMap((cat) => {
    if (!cat.allocated || cat.allocated <= 0) return [];

    const ratio = cat.spent / cat.allocated;
    if (ratio > 1) {
      return [makeAlert('over_budget', 'critical', cat, currency, ratio)];
    }
    if (ratio >= ALERT_THRESHOLDS.nearRatio) {
      return [makeAlert('near_budget', 'warning', cat, currency, ratio)];
    }
    return [];
  });
}

function makeAlert(kind, severity, cat, currency, ratio) {
  const percentUsed = Math.round(ratio * 100);
  const overAmount = roundMoney(cat.spent - cat.allocated);

  const message =
    kind === 'over_budget'
      ? `${cat.name} is over budget by ${overAmount} ${currency}.`
      : `${cat.name} is at ${percentUsed}% of its budget.`;

  return {
    id: `${kind}-${cat.id}`,
    kind,
    severity,
    currency,
    categoryId: cat.id,
    categoryName: cat.name,
    allocated: cat.allocated,
    spent: cat.spent,
    remaining: cat.remaining,
    percentUsed,
    message,
    updatedAt: new Date().toISOString()
  };
}

function canSupportPercent(incomingPercent, excludeId) {
  const percentSum = store.categories
    .filter((cat) => cat.type === 'percent' && cat.id !== excludeId)
    .reduce((total, cat) => total + cat.percent, 0);

  return percentSum + (incomingPercent || 0) <= 100;
}

function checkSpendingCategoryConflicts(newSpendingCategories, excludeId) {
  if (!Array.isArray(newSpendingCategories)) return null;
  
  const conflicts = [];
  for (const spendingCat of newSpendingCategories) {
    const existingCategory = store.categories.find(
      (cat) => cat.id !== excludeId &&
               cat.spendingCategories &&
               cat.spendingCategories.includes(spendingCat)
    );
    if (existingCategory) {
      conflicts.push({
        spendingCategory: spendingCat,
        budgetCategoryName: existingCategory.name
      });
    }
  }
  
  return conflicts.length > 0 ? conflicts : null;
}

function calculateAllocation(amount, categories, currency = store.currency) {
  if (!isValidMoney(amount)) {
    return { error: 'A numeric paycheck amount is required.' };
  }

  const percentTotal = percentageTotal(categories);
  if (percentTotal > 100) {
    return { error: 'Percentage categories cannot exceed 100%.' };
  }

  const { allocations, fixedTotal, variableTotal } = buildAllocations(amount, categories);
  if (!allocations) {
    return { error: 'Fixed amounts exceed the paycheck amount.' };
  }

  const remainingAfterFixed = roundMoney(amount - fixedTotal);
  const leftover = roundMoney(remainingAfterFixed - variableTotal);

  return {
    currency,
    grossIncome: roundMoney(amount),
    fixedTotal,
    percentageTotal: percentTotal,
    remainingAfterFixed,
    totalAllocated: roundMoney(fixedTotal + variableTotal),
    leftover,
    allocations
  };
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
