const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { store, resetStore, _internals } = require('../index');

const { calculateAllocation, buildAlerts, categoriesWithUsage, parseCategory, normalizeCategories } = _internals;

beforeEach(() => resetStore());

describe('API core logic', () => {
  it('splits paycheck into percentage buckets with no leftover', () => {
    const result = calculateAllocation(3000, store.categories, 'USD');
    assert.equal(result.error, undefined);
    assert.equal(result.fixedTotal, 0);
    assert.equal(result.percentageTotal, 100);
    assert.equal(result.remainingAfterFixed, 3000);
    assert.equal(result.totalAllocated, 3000);
    assert.equal(result.leftover, 0);
    const essentials = result.allocations.find((a) => a.id === 'essentials');
    assert.equal(essentials.allocated, 1500); // 50% of 3000
  });

  it('rejects percentage totals over 100%', () => {
    const categories = normalizeCategories([
      { name: 'A', type: 'percent', percent: 60 },
      { name: 'B', type: 'percent', percent: 50 }
    ]);
    assert.ok(!Array.isArray(categories) || categories.error === undefined);
    const result = calculateAllocation(1000, categories, 'USD');
    assert.equal(result.error, 'Percentage categories cannot exceed 100%.');
  });

  it('calculates spend and alerts when over budget', () => {
    // Essentials allocation is 50% of paycheck (1500). Spend beyond it.
    store.transactions.push({ id: 't1', categoryId: 'essentials', amount: 2000, currency: 'USD' });
    const usage = categoriesWithUsage();
    const essentials = usage.find((c) => c.id === 'essentials');
    assert.equal(essentials.spent, 2000);
    assert.equal(essentials.allocated, 1500);

    const alerts = buildAlerts();
    const alert = alerts.find((a) => a.categoryId === 'essentials');
    assert.ok(alert);
    assert.equal(alert.severity, 'critical');
    assert.ok(alert.message.includes('over budget'));
  });

  it('flags near-budget category as warning', () => {
    store.transactions.push({ id: 't2', categoryId: 'essentials', amount: 1400, currency: 'USD' });
    const alerts = buildAlerts();
    const alert = alerts.find((a) => a.categoryId === 'essentials');
    assert.ok(alert);
    assert.equal(alert.severity, 'warning');
  });

  it('validates category parsing rules', () => {
    const badType = parseCategory({ name: 'Test', type: 'other' });
    assert.equal(badType.error, 'Category type must be either "fixed" or "percent".');

    const badPercent = parseCategory({ name: 'Save', type: 'percent', percent: -5 });
    assert.equal(badPercent.error, 'A positive numeric "percent" is required for percentage categories.');

    const okPercent = parseCategory({ name: 'New', type: 'percent', percent: 15 });
    assert.equal(okPercent.error, undefined);
    assert.equal(okPercent.category.percent, 15);
  });
});
