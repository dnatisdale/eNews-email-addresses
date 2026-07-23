import React, { useState } from 'react';
import { Flame, CheckCircle2, Circle, Plus, Trash2, Award, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HabitsTracker({ habits, onSaveHabits }) {
  const [newTitle, setNewTitle] = useState('');
  const [category, setCategory] = useState('Health');
  const [color, setColor] = useState('#6366f1');

  const completedCount = habits.filter(h => h.completedToday).length;
  const percentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleToggle = (id) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const nextState = !h.completedToday;
        if (nextState) {
          // Trigger confetti animation for accomplishment
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
        return {
          ...h,
          completedToday: nextState,
          streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    });
    onSaveHabits(updated);
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newHabit = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category,
      streak: 0,
      completedToday: false,
      color
    };
    onSaveHabits([...habits, newHabit]);
    setNewTitle('');
  };

  const handleDelete = (id) => {
    onSaveHabits(habits.filter(h => h.id !== id));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Habit Header Banner */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
            <Award size={16} />
            <span>Consistency Engine</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>Daily Habits & Streaks</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Build positive routines and track your daily momentum.</p>
        </div>

        {/* Progress Ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlignment: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{percentage}% Completed</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{completedCount} of {habits.length} habits done</div>
          </div>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: `conic-gradient(#6366f1 ${percentage * 3.6}deg, rgba(255, 255, 255, 0.08) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--bg-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: 'var(--accent-purple)'
            }}>
              <Zap size={20} color="#fbbf24" />
            </div>
          </div>
        </div>
      </div>

      {/* Add New Habit Form */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--primary)" />
          <span>Create New Habit</span>
        </h3>
        <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text"
            placeholder="Habit title (e.g. Daily Workout, Read, Meditate)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ flex: '1', minWidth: '240px' }}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '150px' }}>
            <option value="Health">Health</option>
            <option value="Growth">Growth</option>
            <option value="Mindfulness">Mindfulness</option>
            <option value="Productivity">Productivity</option>
            <option value="Finance">Finance</option>
          </select>
          <input 
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '45px', height: '42px', padding: '2px', cursor: 'pointer' }}
            title="Theme Color"
          />
          <button type="submit" className="btn btn-primary">
            <Sparkles size={16} />
            <span>Add Habit</span>
          </button>
        </form>
      </div>

      {/* Habit List Grid */}
      <div className="grid-2">
        {habits.map(habit => (
          <div key={habit.id} className="glass-card" style={{
            padding: '20px',
            borderLeft: `4px solid ${habit.color || 'var(--primary)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ flex: '1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-primary">{habit.category}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#fbbf24', fontWeight: '600' }}>
                  <Flame size={14} /> {habit.streak} day streak
                </span>
              </div>
              <h4 style={{ 
                fontSize: '1.05rem', 
                fontWeight: '600', 
                color: habit.completedToday ? 'var(--text-dim)' : 'var(--text-main)',
                textDecoration: habit.completedToday ? 'line-through' : 'none'
              }}>
                {habit.title}
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => handleToggle(habit.id)}
                className="btn"
                style={{
                  background: habit.completedToday ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: habit.completedToday ? '#34d399' : 'var(--text-muted)',
                  border: `1px solid ${habit.completedToday ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-glass)'}`,
                  padding: '8px 14px'
                }}
              >
                {habit.completedToday ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                <span>{habit.completedToday ? 'Done' : 'Complete'}</span>
              </button>
              <button 
                onClick={() => handleDelete(habit.id)}
                style={{ background: 'transparent', color: 'var(--text-dim)', padding: '6px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
