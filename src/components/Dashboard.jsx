import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Flame, 
  NotebookPen, 
  Wallet, 
  Target, 
  Calendar, 
  TrendingUp 
} from 'lucide-react';

export default function Dashboard({ habits, notes, expenses, tasks, onUpdateTasks, onToggleHabit }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const completedHabitsCount = habits.filter(h => h.completedToday).length;
  const totalBalance = expenses.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount);
  }, 0);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      priority
    };
    onUpdateTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const handleToggleTask = (taskId) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter(t => t.id !== taskId);
    onUpdateTasks(updated);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
            <Calendar size={15} />
            <span>{todayFormatted}</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
            Welcome to Zenith Workspace
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track daily habits, capture ideas, manage personal finances, and stay synced anywhere.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ textAlign: 'center', padding: '10px 18px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent-amber)' }}>{completedHabitsCount}/{habits.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Habits Today</div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 18px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: totalBalance >= 0 ? '#34d399' : '#f87171' }}>
              ${totalBalance.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Balance</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3">
        {/* Habit Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', color: '#fbbf24' }}>
                <Flame size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>Active Habits</h3>
            </div>
            <span className="badge badge-warning">{habits.length} tracked</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {habits.slice(0, 3).map(h => (
              <div key={h.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}>
                <span style={{ fontSize: '0.88rem', textDecoration: h.completedToday ? 'line-through' : 'none', color: h.completedToday ? 'var(--text-dim)' : 'var(--text-main)' }}>
                  {h.title}
                </span>
                <button 
                  onClick={() => onToggleHabit(h.id)}
                  style={{ background: 'transparent', color: h.completedToday ? 'var(--secondary)' : 'var(--text-dim)' }}
                >
                  {h.completedToday ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Notes Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '10px', color: '#818cf8' }}>
                <NotebookPen size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>Recent Notes</h3>
            </div>
            <span className="badge badge-primary">{notes.length} total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notes.slice(0, 3).map(n => (
              <div key={n.id} style={{
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)' }}>{n.title}</span>
                  {n.pinned && <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>★ Pinned</span>}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: '#34d399' }}>
                <Wallet size={20} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>Finance Overview</h3>
            </div>
            <span className="badge badge-success">{expenses.length} logs</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.slice(0, 3).map(e => (
              <div key={e.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{e.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.category}</div>
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: e.type === 'income' ? '#34d399' : '#f87171' }}>
                  {e.type === 'income' ? '+' : '-'}${Number(e.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Quick Tasks Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '10px', color: 'var(--accent-cyan)' }}>
              <Target size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Daily Focus Tasks</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick action list for today</p>
            </div>
          </div>
        </div>

        {/* Add Task Input Form */}
        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input 
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            style={{ flex: '1', minWidth: '220px' }}
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '130px' }}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium</option>
            <option value="high">High Priority</option>
          </select>
          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </form>

        {/* Task Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.length === 0 ? (
            <div style={{ textAlignment: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              No focus tasks logged yet. Add one above!
            </div>
          ) : (
            tasks.map(t => (
              <div key={t.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => handleToggleTask(t.id)}
                    style={{ background: 'transparent', color: t.completed ? 'var(--secondary)' : 'var(--text-muted)' }}
                  >
                    {t.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <span style={{ 
                    fontSize: '0.92rem', 
                    textDecoration: t.completed ? 'line-through' : 'none',
                    color: t.completed ? 'var(--text-dim)' : 'var(--text-main)',
                    fontWeight: t.completed ? '400' : '500'
                  }}>
                    {t.title}
                  </span>
                  <span className={`badge ${t.priority === 'high' ? 'badge-danger' : t.priority === 'medium' ? 'badge-warning' : 'badge-primary'}`}>
                    {t.priority}
                  </span>
                </div>
                <button 
                  onClick={() => handleDeleteTask(t.id)}
                  style={{ background: 'transparent', color: 'var(--text-dim)' }}
                  className="hover-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
