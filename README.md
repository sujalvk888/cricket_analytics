# 🏏 Cricket Analytics

A comprehensive, full-stack Cricket Analytics and Live Match Tracking Dashboard built with React, Vite, Node.js, Express, and SQLite.

---

## 🌟 Key Features

- **Live Match Interaction Dashboard**:
  - Live over-by-over scoring and data entry (runs, wickets, extras, balls bowled).
  - Dynamic Current Run Rate (CRR), projected scores, and wicket tracking.
  - Real-time comparison with historical matches and historical run-rate benchmarks.
  - Smooth collapsible panels for an optimized dual-pane analytics experience.
- **Historical Analytics & Comparison**:
  - In-depth match comparison charts powered by Recharts.
  - Visual over-by-over progression graphs.
  - Over-by-over average comparison for 1st & 2nd innings.
- **Saved Matches Management**:
  - View, search, and filter historical match data.
  - Edit saved matches with over-by-over adjustments.
  - Custom dark-theme confirmation modals for safe deletion.
- **Responsive & Modern UI**:
  - Glassmorphism dark-mode aesthetic with custom cricket assets.
  - Intuitive navigation and micro-animations.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: Vanilla CSS with modern dark glass design tokens

### Backend
- **Server**: Node.js + Express
- **Database**: SQLite3
- **CORS**: Enabled for seamless local development

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sujalvk888/cricket_analytics.git
cd cricket_analytics
```

### 2. Backend Setup
Open a terminal and start the backend server:
```bash
cd backend
npm install
node server.js
```
The backend server will run on `http://localhost:5000` with the SQLite database initialized automatically.

### 3. Frontend Setup
Open a second terminal window and run:
```bash
cd frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 📁 Project Structure

```
cricket_analytics/
├── backend/
│   ├── cricket.db          # SQLite database
│   ├── package.json        # Backend dependencies & scripts
│   └── server.js           # Express API endpoints & SQLite schema
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images & icons (Bat.png, Ball.png, etc.)
│   │   ├── components/     # Reusable UI components & modals
│   │   ├── pages/          # Home, LiveMatch, AllDataSaved, EditSavedData
│   │   ├── styles/         # Global styles & design system
│   │   ├── App.jsx         # Main router setup
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.js      # Vite build configuration
├── .gitignore              # Git ignore rules for dependencies & build artifacts
└── README.md               # Project documentation
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
