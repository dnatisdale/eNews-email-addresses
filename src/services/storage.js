import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

const LOCAL_STORAGE_KEY_PREFIX = 'zenith_pwa_data_';

// Initial sample seed data for first time users
const INITIAL_DATA = {
  habits: [
    { id: '1', title: 'Morning Meditation (10 mins)', category: 'Mindfulness', streak: 4, completedToday: true, color: '#8b5cf6' },
    { id: '2', title: 'Read 20 Pages', category: 'Growth', streak: 12, completedToday: false, color: '#6366f1' },
    { id: '3', title: 'Hydrate 2.5L Water', category: 'Health', streak: 7, completedToday: true, color: '#06b6d4' }
  ],
  notes: [
    { id: '1', title: 'Personal Growth Goals 2026', content: '- Master React & Progressive Web Apps\n- Daily habit tracking\n- Build cloud-native serverless apps', tag: 'Goals', pinned: true, updatedAt: new Date().toISOString() },
    { id: '2', title: 'PWA Architecture Notes', content: 'Service Workers enable offline caching and background synchronization. Web Manifest allows installation on mobile & desktop.', tag: 'Tech', pinned: false, updatedAt: new Date().toISOString() }
  ],
  expenses: [
    { id: '1', title: 'Domain Name & DNS', amount: 14.99, type: 'expense', category: 'Infrastructure', date: new Date().toISOString().split('T')[0] },
    { id: '2', title: 'Freelance Design Stipend', amount: 450.00, type: 'income', category: 'Income', date: new Date().toISOString().split('T')[0] },
    { id: '3', title: 'Coffee & Coworking', amount: 8.50, type: 'expense', category: 'Lifestyle', date: new Date().toISOString().split('T')[0] }
  ],
  tasks: [
    { id: '1', title: 'Configure PWA Service Worker caching', completed: true, priority: 'high' },
    { id: '2', title: 'Add Firebase environment variables to .env', completed: false, priority: 'medium' },
    { id: '3', title: 'Deploy PWA to GitHub Pages', completed: false, priority: 'high' }
  ]
};

// Generic Local Storage Helper
export const getLocalData = (key) => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(INITIAL_DATA[key] || []));
      return INITIAL_DATA[key] || [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return INITIAL_DATA[key] || [];
  }
};

export const setLocalData = (key, data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
};

// Storage Service Class with Firestore Sync Support
export class StorageService {
  static async getItems(collectionName, userId = null) {
    if (isFirebaseConfigured && db && userId) {
      try {
        const colRef = collection(db, 'users', userId, collectionName);
        const snapshot = await getDocs(colRef);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (items.length > 0) return items;
      } catch (err) {
        console.warn(`Firestore read fallback to localStorage for ${collectionName}:`, err);
      }
    }
    return getLocalData(collectionName);
  }

  static async saveItem(collectionName, item, userId = null) {
    // Local Update
    const items = getLocalData(collectionName);
    const index = items.findIndex(i => i.id === item.id);
    let updated;
    if (index >= 0) {
      updated = [...items];
      updated[index] = item;
    } else {
      updated = [item, ...items];
    }
    setLocalData(collectionName, updated);

    // Firestore Sync
    if (isFirebaseConfigured && db && userId) {
      try {
        const docRef = doc(db, 'users', userId, collectionName, item.id);
        await setDoc(docRef, item);
      } catch (err) {
        console.warn(`Firestore save failed for ${collectionName}:`, err);
      }
    }

    return updated;
  }

  static async removeItem(collectionName, itemId, userId = null) {
    // Local Update
    const items = getLocalData(collectionName);
    const updated = items.filter(i => i.id !== itemId);
    setLocalData(collectionName, updated);

    // Firestore Sync
    if (isFirebaseConfigured && db && userId) {
      try {
        const docRef = doc(db, 'users', userId, collectionName, itemId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn(`Firestore delete failed for ${collectionName}:`, err);
      }
    }

    return updated;
  }
}
