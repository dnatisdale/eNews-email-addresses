import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Flame, NotebookPen, Wallet, Sparkles } from 'lucide-react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HabitsTracker from './components/HabitsTracker';
import NotesManager from './components/NotesManager';
import BudgetTracker from './components/BudgetTracker';
import PWAPrompt from './components/PWAPrompt';
import SettingsModal from './components/SettingsModal';
import { StorageService, getLocalData } from './services/storage';
import { subscribeToAuth } from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App Data States
  const [habits, setHabits] = useState(() => getLocalData('habits'));
  const [notes, setNotes] = useState(() => getLocalData('notes'));
  const [expenses, setExpenses] = useState(() => getLocalData('expenses'));
  const [tasks, setTasks] = useState(() => getLocalData('tasks'));

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Listen for PWA installation prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load user data from Firestore sync
        const [remoteHabits, remoteNotes, remoteExpenses, remoteTasks] = await Promise.all([
          StorageService.getItems('habits', currentUser.uid),
          StorageService.getItems('notes', currentUser.uid),
          StorageService.getItems('expenses', currentUser.uid),
          StorageService.getItems('tasks', currentUser.uid)
        ]);
        if (remoteHabits) setHabits(remoteHabits);
        if (remoteNotes) setNotes(remoteNotes);
        if (remoteExpenses) setExpenses(remoteExpenses);
        if (remoteTasks) setTasks(remoteTasks);
      }
    });

    return () => unsubscribe();
  }, []);

  // Install PWA Handler
  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // State Update Wrappers
  const handleSaveHabits = async (updated) => {
    setHabits(updated);
    if (user) {
      for (const item of updated) {
        await StorageService.saveItem('habits', item, user.uid);
      }
    } else {
      localStorage.setItem('zenith_pwa_data_habits', JSON.stringify(updated));
    }
  };

  const handleToggleHabit = (id) => {
    const updated = habits.map(h => h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1) } : h);
    handleSaveHabits(updated);
  };

  const handleSaveNotes = async (updated) => {
    setNotes(updated);
    if (user) {
      for (const item of updated) {
        await StorageService.saveItem('notes', item, user.uid);
      }
    } else {
      localStorage.setItem('zenith_pwa_data_notes', JSON.stringify(updated));
    }
  };

  const handleSaveExpenses = async (updated) => {
    setExpenses(updated);
    if (user) {
      for (const item of updated) {
        await StorageService.saveItem('expenses', item, user.uid);
      }
    } else {
      localStorage.setItem('zenith_pwa_data_expenses', JSON.stringify(updated));
    }
  };

  const handleUpdateTasks = async (updated) => {
    setTasks(updated);
    if (user) {
      for (const item of updated) {
        await StorageService.saveItem('tasks', item, user.uid);
      }
    } else {
      localStorage.setItem('zenith_pwa_data_tasks', JSON.stringify(updated));
    }
  };

  return (
    <div className="app-layout">
      {/* Top Navigation Header */}
      <Header 
        user={user} 
        installPrompt={deferredPrompt}
        onInstall={handleInstallPWA}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Primary Module Navigation Tabs */}
      <nav className="nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          <Flame size={17} />
          <span>Habits & Streaks</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <NotebookPen size={17} />
          <span>Notes Hub</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          <Wallet size={17} />
          <span>Finance & Budget</span>
        </button>
      </nav>

      {/* Main Tab Content */}
      <main style={{ flex: '1' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            habits={habits}
            notes={notes}
            expenses={expenses}
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            onToggleHabit={handleToggleHabit}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsTracker 
            habits={habits}
            onSaveHabits={handleSaveHabits}
          />
        )}

        {activeTab === 'notes' && (
          <NotesManager 
            notes={notes}
            onSaveNotes={handleSaveNotes}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetTracker 
            expenses={expenses}
            onSaveExpenses={handleSaveExpenses}
          />
        )}
      </main>

      {/* PWA Installation Prompt Toast Banner */}
      <PWAPrompt 
        installPrompt={deferredPrompt}
        onInstall={handleInstallPWA}
        onClose={() => setDeferredPrompt(null)}
      />

      {/* Settings & Firebase Connection Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
