"use client";

import { useEffect, useMemo, useState } from 'react';
import { categories, defaultCategories, Expense, ExpenseInput } from '@/lib/types';
import { useExpenseStore } from '@/lib/store';
import { formatCurrency, getCurrentWeekRange, isWithinRange } from '@/lib/utils';
import ExpenseCharts from '@/components/ExpenseCharts';

export default function ExpensePage() {
  const { expenses, addExpense, removeExpense } = useExpenseStore();

  const [form, setForm] = useState<ExpenseInput>({
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    category: defaultCategories[0],
    note: '',
  });

  const [weekStart, weekEnd] = useMemo(() => getCurrentWeekRange(new Date()), []);

  const weeklyExpenses = useMemo(
    () => expenses.filter((e) => isWithinRange(new Date(e.date), weekStart, weekEnd)),
    [expenses, weekStart, weekEnd]
  );

  const totals = useMemo(() => {
    const total = weeklyExpenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = weeklyExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});
    return { total, byCategory };
  }, [weeklyExpenses]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) return;
    addExpense({ ...form, id: crypto.randomUUID() });
    setForm((f) => ({ ...f, amount: 0, note: '' }));
  }

  return (
    <div className="grid">
      <section className="panel">
        <div className="section-title">Add Expense</div>
        <form onSubmit={submit} className="row" style={{ alignItems: 'center' }}>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount === 0 ? '' : form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => (
              <option value={c} key={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <button className="button-primary" type="submit">Add</button>
        </form>
        <hr className="sep" />
        <div className="summary">
          <div className="card">
            <div className="label">Week</div>
            <div className="value">
              {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
            </div>
          </div>
          <div className="card">
            <div className="label">Total</div>
            <div className="value">{formatCurrency(totals.total)}</div>
          </div>
          <div className="card">
            <div className="label">Categories</div>
            <div className="value">{Object.keys(totals.byCategory).length}</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">Charts</div>
        <ExpenseCharts expenses={weeklyExpenses} weekStart={weekStart} />
      </section>

      <section className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="section-title">This Week's Expenses</div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Note</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {weeklyExpenses.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: 'var(--muted)' }}>
                  No expenses this week yet.
                </td>
              </tr>
            )}
            {weeklyExpenses.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td>
                  <span className="tag">{e.category}</span>
                </td>
                <td>{e.note || '-'}</td>
                <td>{formatCurrency(e.amount)}</td>
                <td>
                  <button className="button-danger" onClick={() => removeExpense(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
