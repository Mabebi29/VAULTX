import { useEffect, useMemo, useState } from 'react';
import { addTransaction, getSummary, updatePaycheck } from './api';
import type { Alert, Category, Summary } from './types';

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch (e) {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function categoryStatus(cat: Category) {
  const ratio = cat.allocated ? cat.spent! / cat.allocated : 0;
  if (ratio > 1) return 'danger';
  if (ratio >= 0.85) return 'warning';
  return 'ok';
}

function statusLabel(percent: number) {
  if (percent > 100) return 'Over budget';
  if (percent >= 95) return 'Tight';
  if (percent >= 75) return 'On track';
  return 'Comfortable';
}

export default function App() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingPaycheck, setSavingPaycheck] = useState(false);
  const [addingTxn, setAddingTxn] = useState(false);

  const [paycheckAmount, setPaycheckAmount] = useState('');
  const [paycheckCurrency, setPaycheckCurrency] = useState('USD');

  const [txnCategoryId, setTxnCategoryId] = useState('');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnNote, setTxnNote] = useState('');

  const currency = summary?.currency || 'USD';

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSummary();
      setSummary(data);
      if (data.paycheck) {
        setPaycheckAmount(String(data.paycheck.amount));
        setPaycheckCurrency(data.paycheck.currency);
      }
      if (!txnCategoryId && data.categories.length) {
        setTxnCategoryId(data.categories[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaycheckSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paycheckAmount) return;
    setSavingPaycheck(true);
    setError(null);
    try {
      await updatePaycheck({ amount: Number(paycheckAmount), currency: paycheckCurrency });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update paycheck');
    } finally {
      setSavingPaycheck(false);
    }
  }

  async function handleTxnSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!txnCategoryId || !txnAmount) return;
    setAddingTxn(true);
    setError(null);
    try {
      await addTransaction({
        categoryId: txnCategoryId,
        amount: Number(txnAmount),
        note: txnNote || undefined
      });
      setTxnAmount('');
      setTxnNote('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setAddingTxn(false);
    }
  }

  const topCards = useMemo(() => {
    if (!summary) return [];
    const remaining = Math.max(summary.allocatedTotal - summary.spentTotal, 0);
    return [
      {
        title: 'Total Balance',
        value: summary.paycheck
          ? formatMoney(summary.paycheck.amount, summary.paycheck.currency)
          : '—',
        hint: summary.paycheck?.updatedAt ? `Updated ${new Date(summary.paycheck.updatedAt).toLocaleDateString()}` : ''
      },
      {
        title: 'Monthly Spending',
        value: formatMoney(summary.spentTotal, currency),
        hint: `${formatMoney(remaining, currency)} remaining`
      },
      {
        title: 'Budget Used',
        value: `${summary.budgetUsedPercent.toFixed(0)}%`,
        hint: statusLabel(summary.budgetUsedPercent)
      },
      {
        title: 'Alerts',
        value: summary.alerts.length.toString(),
        hint: summary.alerts.length ? `${summary.alerts.filter((a) => a.severity === 'critical').length} critical` : 'All clear'
      }
    ];
  }, [currency, summary]);

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span role="img" aria-label="vault">
            🏦
          </span>
          VaultX
        </div>
        <div className="inline">
          <span className="pill">API: {import.meta.env.VITE_API_URL || 'http://localhost:4000'}</span>
          <button className="secondary" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="hero">
        <h1>Good morning! 👋</h1>
        <p>Here's your financial overview for this month.</p>
      </div>

      {error && (
        <div className="alert critical" style={{ marginBottom: 16 }}>
          <div>
            <strong>Something went wrong</strong>
            <span className="muted">{error}</span>
          </div>
        </div>
      )}

      {loading && <div className="muted">Loading dashboard...</div>}

      {!loading && summary && (
        <>
          <div className="grid">
            {topCards.map((card) => (
              <div className="card" key={card.title}>
                <h3>{card.title}</h3>
                <div className="value">{card.value}</div>
                {card.hint && <div className="muted">{card.hint}</div>}
              </div>
            ))}
          </div>

          <div className="section-title">
            <h2>Budget Categories</h2>
            <div className="chip">Allocated {formatMoney(summary.allocatedTotal, currency)}</div>
          </div>
          <div className="category-grid">
            {summary.categories.map((cat) => {
              const ratio = cat.allocated ? cat.spent! / cat.allocated : 0;
              const status = categoryStatus(cat);
              const progress = Math.min(ratio, 1) * 100;
              const remaining =
                status === 'danger'
                  ? `${formatMoney(cat.spent! - (cat.allocated || 0), currency)} over`
                  : `${formatMoney(Math.max(cat.remaining || 0, 0), currency)} remaining`;

              return (
                <div className="card category-card" key={cat.id}>
                  <div className="line">
                    <h4>{cat.name}</h4>
                    <span className={`chip ${status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : ''}`}>
                      {cat.type === 'fixed' ? 'Fixed' : `${cat.percent}%`}
                    </span>
                  </div>
                  <div className="line">
                    <span className={status === 'danger' ? 'danger' : ''}>
                      {formatMoney(cat.spent || 0, currency)}
                    </span>
                    <span className="muted">
                      / {formatMoney(cat.allocated || 0, currency)}
                    </span>
                  </div>
                  <div className={`progress ${status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : ''}`}>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <div className="foot">{remaining}</div>
                </div>
              );
            })}
          </div>

          <div className="section-title">
            <h2>Quick Actions</h2>
          </div>
          <div className="grid">
            <div className="card">
              <h3>Update Paycheck</h3>
              <form className="form" onSubmit={handlePaycheckSubmit}>
                <div className="field">
                  <label>Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paycheckAmount}
                    onChange={(e) => setPaycheckAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Currency</label>
                  <input
                    type="text"
                    value={paycheckCurrency}
                    onChange={(e) => setPaycheckCurrency(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="button-row">
                  <button type="submit" disabled={savingPaycheck}>
                    {savingPaycheck ? 'Saving...' : 'Save paycheck'}
                  </button>
                  <span className="muted">Rebuilds allocations with stored categories.</span>
                </div>
              </form>
            </div>

            <div className="card">
              <h3>Add Transaction</h3>
              <form className="form" onSubmit={handleTxnSubmit}>
                <div className="field">
                  <label>Category</label>
                  <select value={txnCategoryId} onChange={(e) => setTxnCategoryId(e.target.value)}>
                    {summary.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Note (optional)</label>
                  <input value={txnNote} onChange={(e) => setTxnNote(e.target.value)} />
                </div>
                <div className="button-row">
                  <button type="submit" disabled={addingTxn}>
                    {addingTxn ? 'Saving...' : 'Add expense'}
                  </button>
                  <span className="muted">Updates category spend + alerts.</span>
                </div>
              </form>
            </div>
          </div>

          <div className="section-title">
            <h2>Alerts</h2>
            <div className="muted">{summary.alerts.length ? `${summary.alerts.length} active` : 'No alerts'}</div>
          </div>
          {summary.alerts.length === 0 && <div className="muted">All categories are within limits.</div>}
          {summary.alerts.map((alert: Alert) => (
            <div className={`alert ${alert.severity}`} key={alert.id} style={{ marginBottom: 10 }}>
              <div>
                <strong>{alert.categoryName}</strong>
                <div>{alert.message}</div>
                <div className="muted">
                  {formatMoney(alert.spent, alert.currency)} spent / {formatMoney(alert.allocated, alert.currency)} budget
                </div>
              </div>
              <span className={`chip ${alert.severity === 'critical' ? 'danger' : 'warning'}`}>
                {alert.percentUsed}% used
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
