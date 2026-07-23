# ⚡ Zenith Personal Hub PWA

A free, offline-first, Progressive Web Application (PWA) built with **React**, **Vite**, **Firebase** (Google Cloud Data / Auth), and **GitHub Pages**.

![Zenith PWA Preview](https://raw.githubusercontent.com/github/explore/main/topics/pwa/pwa.png)

## ✨ Core Features

- 📱 **Full PWA Capabilities**: Installable on Windows, macOS, Android, and iOS. Works 100% offline via Service Worker caching.
- 🎯 **Daily Focus & Tasks**: Quick action checklist with priority tagging and reactive completion state.
- 🔥 **Habits & Streaks**: Consistency engine with streak counters, completion rings, and celebratory micro-interactions.
- 📝 **Notes & Knowledge Hub**: Searchable markdown-style notes with category tags, pin-to-top, and instant filtering.
- 💰 **Personal Budget Tracker**: Track income vs expenses, view net balance, and inspect visual category distribution charts.
- ☁️ **Dual Sync Storage Engine**: Seamlessly operates in zero-setup Local Storage mode by default, and syncs automatically to **Firebase Firestore** when connected.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

---

## 🛠️ Free Firebase Cloud Sync Setup (Optional)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new free project.
2. In your project overview, click **Add app** (`</>` Web app).
3. Enable **Firestore Database**:
   - Go to *Build -> Firestore Database -> Create Database*.
   - Start in *Production Mode* or *Test Mode*.
4. Enable **Authentication**:
   - Go to *Build -> Authentication -> Sign-in method*.
   - Enable **Google** and **Anonymous** sign-in providers.
5. Create a file named `.env.local` in your root folder and paste your credentials:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📦 Deploying Free to GitHub Pages

1. Initialize git and push to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Zenith Personal PWA"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
2. Enable GitHub Pages:
   - On GitHub, navigate to **Settings -> Pages**.
   - Under **Build and deployment -> Source**, select **GitHub Actions**.
3. (Optional) Add Firebase environment secrets to GitHub:
   - Go to **Settings -> Secrets and variables -> Actions**.
   - Add your `VITE_FIREBASE_*` variables so GitHub Actions can bundle them during build.
4. On every `git push`, GitHub Actions automatically builds and publishes your PWA for free!

---

## 📲 How to Install as Desktop / Mobile App

- **Desktop (Chrome/Edge/Brave)**: Click the **Install App** button in the app header, or click the install icon in your browser address bar.
- **iOS (Safari)**: Tap the **Share** button -> **Add to Home Screen**.
- **Android (Chrome)**: Tap the menu (three dots) -> **Add to Home Screen** / **Install App**.
