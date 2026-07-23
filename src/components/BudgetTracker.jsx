import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, PieChart, DollarSign, Calendar } from 'lucide-react';

export default function BudgetTracker({ expenses, onSaveExpenses }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Lifestyle');

  // Calculations
  const incomeTotal = expenses
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const expenseTotal = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netBalance = incomeTotal - expenseTotal;

  // Category breakdown for expenses
  const categoryTotals = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const newTransaction = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().split('T')[0]
    };

    onSaveExpenses([newTransaction, ...expenses]);
    setTitle('');
    setAmount('');
  };

  const handleDelete = (id) => {
    onSaveExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Cards */}
      <div className="grid-3">
        {/* Net Balance */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '8px', color: '#818cf8' }}>
              <Wallet size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Net Balance</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: netBalance >= 0 ? '#34d399' : '#f87171' }}>
            ${netBalance.toFixed(2)}
          </div>
        </div>

        {/* Total Income */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#34d399' }}>
              <TrendingUp size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Income</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#34d399' }}>
            +${incomeTotal.toFixed(2)}
          </div>
        </div>

        {/* Total Expense */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#f87171' }}>
              <TrendingDown size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Expenses</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f87171' }}>
            -${expenseTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Add Transaction Form & Category Breakdown */}
      <div className="grid-2">
        {/* Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--primary)" />
            <span>Log Transaction</span>
          </h3>

          <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text"
              placeholder="Description (e.g. Coffee, Domain Renewal, Salary)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number"
                step="0.01"
                placeholder="Amount ($)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ flex: '1' }}
                required
              />
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '120px' }}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Lifestyle">Lifestyle & Dining</option>
              <option value="Infrastructure">Tech & Infrastructure</option>
              <option value="Housing">Housing & Utilities</option>
              <option value="Income">Salary / Income</option>
              <option value="Other">Other</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <DollarSign size={16} />
              <span>Record Log</span>
            </button>
          </form>
        </div>

        {/* Expense Category Breakdown Bars */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="var(--accent-cyan)" />
            <span>Expense Distribution</span>
          </h3>

          {Object.keys(categoryTotals).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
              No expenses recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(categoryTotals).map(([cat, catAmount]) => {
                const pct = expenseTotal > 0 ? Math.round((catAmount / expenseTotal) * 100) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{cat}</span>
                      <span style={{ color: 'var(--text-muted)' }}>${catAmount.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Recent Financial Logs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {expenses.map(e => (
            <div key={e.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: e.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: e.type === 'income' ? '#34d399' : '#f87171'
                }}>
                  {e.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-main)' }}>{e.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>{e.category}</span> • <span>{e.date}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: e.type === 'income' ? '#34d399' : '#f87171' }}>
                  {e.type === 'income' ? '+' : '-'}${Number(e.amount).toFixed(2)}
                </span>
                <button onClick={() => handleDelete(e.id)} style={{ background: 'transparent', color: 'var(--text-dim)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
