# 🏏 Cricket Analytics

<p align="center">
  <img src="frontend/src/assets/Logo.png" alt="Cricket Analytics Logo" width="120" style="border-radius: 50%; box-shadow: 0 4px 20px rgba(0, 230, 153, 0.3);" />
</p>

<p align="center">
  <strong>A modern, full-stack cricket analytics and live match tracking system featuring real-time over-by-over scoring, historical run-rate benchmarks, and dynamic match comparison dashboards.</strong>
</p>

<p align="center">
  <a href="https://cricket-analytics-roan.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://cricket-analytics-backend-psai.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Backend API" />
  </a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20%20LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://www.sqlite.org/"><img src="https://img.shields.io/badge/SQLite-3.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /></a>
  <a href="https://recharts.org/"><img src="https://img.shields.io/badge/Recharts-2.15-22b5bf?style=for-the-badge" alt="Recharts" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License" /></a>
</p>

---

## 🚀 Live Deployments

| Component | Platform | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | **Vercel** | [https://cricket-analytics-roan.vercel.app](https://cricket-analytics-roan.vercel.app) | ![Vercel](https://img.shields.io/badge/Deployed-Live-success?style=flat-square&logo=vercel) |
| **Backend REST API** | **Render** | [https://cricket-analytics-backend-psai.onrender.com](https://cricket-analytics-backend-psai.onrender.com) | ![Render](https://img.shields.io/badge/Active-Running-success?style=flat-square&logo=render) |
| **Source Code** | **GitHub** | [https://github.com/sujalvk888/cricket_analytics](https://github.com/sujalvk888/cricket_analytics) | ![GitHub](https://img.shields.io/badge/Repo-Public-blue?style=flat-square&logo=github) |

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Local Development Setup](#-local-development-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Deployment Architecture](#-deployment-architecture)
- [Application Walkthrough](#-application-walkthrough)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Cricket Analytics** is an end-to-end analytics platform designed for T20 and limited-overs cricket. It bridges real-time match data entry with deep historical match benchmarking, giving analysts, coaches, and enthusiasts actionable insights as each ball is bowled.

The platform provides a dual-pane live interface:
1. **Live Match Interaction Console**: Record runs, wickets, extras, and overs completed in real time with instant Current Run Rate (CRR) and projected score calculations.
2. **Historical Comparison Engine**: Instantly matches the current game against past innings across venues, opponents, and match situations, visualizing worm charts, run-rate comparisons, and 20-over benchmark averages.

---

## ✨ Key Features

### ⚡ Live Match Dual-Pane Dashboard
- **Real-Time Data Entry**: Enter runs, wickets, and extras per over with automatic calculation of cumulative tallies.
- **Dynamic Run-Rate Analytics**: Live tracking of Current Run Rate (CRR) and projected 20-over totals based on current scoring velocity.
- **Synchronized Collapsible Layout**: Smooth, high-performance transitions allowing users to minimize the scoring panel to expand full-width analytics graphs.
- **Intelligent Over Locking**: Automatically handles innings transitions and game conclusions (e.g., all 10 wickets fallen).

### 📊 Real-Time Dynamic Comparison & Benchmarks
- **Historical Match Matching**: Automatically queries historical databases to find similar past matches based on venue, team, and innings type.
- **Dual Innings Benchmarking**: Calculates true 20-over average progression curves (excluding prematurely curtailed all-out innings from skewing full-innings averages).
- **Interactive Multi-Line Charts**: Compare the live match curve against historical reference games with custom Recharts tooltips and highlight toggles.

### 💾 Saved Matches & Data Management
- **Innings Search & Filtering**: Filter historical records by team name, venue, opponent, or innings number (1st vs 2nd Innings).
- **Over-by-Over Historical Editor**: Edit saved innings records over-by-over with automatic validation and cumulative recalculation.
- **Custom Confirmation Modals**: Built-in glassmorphism confirmation dialogues for deleting records safely without standard browser alerts.

### 🎨 Dark-Themed Glassmorphism UI
- Fully tailored design system with custom cricket assets (`Bat.png`, `Ball.png`, `Logo.png`, `stadium_bg.png`).
- Polished micro-interactions, responsive grids, and accessible components built without heavy UI library bloat.

---

## 🏗 Architecture & Tech Stack

```
+-------------------------------------------------------------+
|                     React 19 Frontend                       |
|   (Vercel: Vite 6, React Router v7, Recharts, Lucide Icons) |
+-------------------------------------------------------------+
                              |
                     REST API (HTTP/JSON)
                              |
+-------------------------------------------------------------+
|                     Node.js / Express                       |
|   (Render: Express 5, CORS, SQLite3 v5.1.7 Driver, Dotenv)  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                     SQLite Database                         |
|   (cricket.db: Relational tables for innings & overs)       |
+-------------------------------------------------------------+
```

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Modern component architecture, state management & hooks |
| **Build Tool** | [Vite 6](https://vite.dev/) | Next-generation ultra-fast frontend tooling |
| **Frontend Hosting** | [Vercel](https://vercel.com/) | Edge-optimized global CDN with automatic continuous deployment |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) | Client-side routing with `vercel.json` SPA rewrite rules |
| **Data Visualization** | [Recharts 2.15](https://recharts.org/) | Declarative charting library for worm curves and metrics |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, modern vector icon set |
| **Backend Runtime** | [Node.js 20 LTS](https://nodejs.org/) | Long-term support JavaScript server runtime |
| **Backend Server** | [Express 5](https://expressjs.com/) | Lightweight, high-throughput REST API server |
| **Backend Hosting** | [Render](https://render.com/) | Managed cloud Web Service running in a Linux container |
| **Database** | [SQLite3 5.1.7](https://www.sqlite.org/) | Embedded ACID-compliant relational SQL database |

---

## 📁 Project Directory Structure

```text
cricket_analytics/
├── .github/                      # GitHub configuration & workflows
├── backend/
│   ├── cricket.db                # SQLite database with match history
│   ├── package.json              # Backend dependencies, engines & scripts
│   └── server.js                 # Express REST API & SQLite schema definition
├── frontend/
│   ├── public/
│   │   ├── favicon.svg           # Application favicon
│   │   └── icons.svg             # SVG sprite definitions
│   ├── src/
│   │   ├── assets/               # Custom imagery (Logo, Bat, Ball, Stadium)
│   │   ├── components/           # Reusable UI components
│   │   │   ├── DeleteConfirmationModal/  # Custom modal for safe deletions
│   │   │   └── Layout/           # Global header, navigation, and container
│   │   ├── config/
│   │   │   └── api.js            # Central API configuration (VITE_API_URL)
│   │   ├── pages/                # Main application views
│   │   │   ├── AllDataSaved/     # Saved matches view, filters & cards
│   │   │   ├── DataEntry/        # Standalone manual match scoring
│   │   │   ├── EditSavedData/    # Over-by-over historical editor
│   │   │   ├── Home/             # Landing view & quick navigation
│   │   │   └── LiveMatch/        # Split-screen live tracker & analytics
│   │   ├── styles/               # Design tokens & global CSS variables
│   │   ├── App.jsx               # Application route configuration
│   │   └── main.jsx              # Application bootstrap & entry point
│   ├── package.json              # Frontend dependencies & scripts
│   ├── vercel.json               # Vercel SPA routing rules
│   └── vite.config.js            # Vite build configuration
├── .gitignore                    # Global ignore rules (dependencies, logs, build)
├── .node-version                 # Pinned Node.js 20 LTS version for Render
├── LICENSE                       # MIT License
└── README.md                     # Comprehensive project documentation
```

---

## 🗄 Database Schema

The SQLite database (`backend/cricket.db`) stores normalized match and ball-by-ball / over-by-over records:

### `innings` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique innings identifier |
| `teamName` | TEXT | NOT NULL | Batting team name |
| `inningsType` | TEXT | NOT NULL | `1st Innings` or `2nd Innings` |
| `opponentTeam`| TEXT | | Bowling/opponent team name |
| `venue` | TEXT | | Ground or stadium name |
| `matchDate` | TEXT | | Date of match (YYYY-MM-DD) |
| `created_at` | DATETIME| DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### `overs` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique over record identifier |
| `inningsId` | INTEGER | FOREIGN KEY (`innings.id`) | Reference to parent innings |
| `overNumber` | INTEGER | NOT NULL (1 to 20) | Over index in the match |
| `runs` | INTEGER | | Runs scored in this specific over |
| `wickets` | INTEGER | | Wickets fallen in this specific over |
| `cumulativeRuns` | INTEGER | | Total runs scored up to this over |
| `cumulativeWickets` | INTEGER | | Total wickets lost up to this over |
| `status` | TEXT | | Over status (`completed`, `in-progress`, `locked`) |

---

## 🔌 API Reference

The backend Express service exposes the following endpoints on `https://cricket-analytics-backend-psai.onrender.com`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root health-check endpoint confirming backend availability |
| `GET` | `/api/status` | Health check route to verify backend connectivity |
| `GET` | `/api/metadata` | Fetches distinct teams and venues for search autocomplete |
| `GET` | `/api/innings-history` | Fetches all saved innings with their associated overs data |
| `GET` | `/api/innings/:id` | Fetches a single innings and its 20 overs by ID |
| `POST` | `/api/innings` | Creates a new match innings with full over-by-over records |
| `PUT` | `/api/innings/:id` | Updates an existing innings and atomically replaces overs data |
| `DELETE` | `/api/innings/:id` | Deletes an innings and cascades over records deletion |

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env` or Vercel Environment Variables)
| Variable | Description | Default (Local) | Production (Vercel) |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend REST API | `http://localhost:5000` | `https://cricket-analytics-backend-psai.onrender.com` |

### Backend (`backend/.env` or Render Environment Variables)
| Variable | Description | Default (Local) | Production (Render) |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP port on which the Express server listens | `5000` | `10000` (auto-assigned) |
| `NODE_VERSION` | Pinned Node.js version | System default | `20` |

---

## 💻 Local Development Setup

Follow these step-by-step instructions to get the application running locally on your workstation.

### Prerequisites
- **Node.js** (v18.0.0 or v20 LTS recommended) - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

---

### 1. Clone Repository

```bash
git clone https://github.com/sujalvk888/cricket_analytics.git
cd cricket_analytics
```

---

### 2. Backend Setup

Open a terminal, navigate to the `backend` directory, install dependencies, and launch the server:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start Express server
node server.js
```

The server will start on:
```text
Server running on port 5000
Connected to the SQLite database.
```

---

### 3. Frontend Setup

Open a **second terminal window**, navigate to the `frontend` directory, install dependencies, and start the Vite dev server:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:5173
```

---

## 🌐 Deployment Architecture

The application is deployed across modern cloud services for optimal performance and reliability:

1. **Frontend on [Vercel](https://vercel.com/)**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Routing**: `frontend/vercel.json` rewrites all SPA routes to `/index.html` to allow direct URL access and clean page refreshes.
   - **Live URL**: [https://cricket-analytics-roan.vercel.app](https://cricket-analytics-roan.vercel.app)

2. **Backend on [Render](https://render.com/)**:
   - **Root Directory**: `backend`
   - **Runtime**: `Node` (v20 LTS via `.node-version`)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Database**: Embedded SQLite database (`backend/cricket.db`)
   - **Live URL**: [https://cricket-analytics-backend-psai.onrender.com](https://cricket-analytics-backend-psai.onrender.com)

---

## 🖥 Application Walkthrough

### 1. Live Match Scoring & Analytics (`/live-match`)
- Enter live match parameters (Batting Team, Bowling Team, Venue, Match Date).
- Enter over-by-over runs and wickets as they happen.
- Watch the **Current Run Rate (CRR)**, **Total Runs**, **Total Wickets**, and **Projected Scores** update instantaneously.
- Toggle between minimized and expanded modes using the top-right collapse control for maximized graph space.

### 2. Saved Match Records (`/saved-matches`)
- Search across all historical fixtures by team name or ground.
- Review match overview cards showing total score, run rate, date, and venue.
- Click **Edit** to adjust match statistics or **Delete** with the safety confirmation modal.

### 3. Editing Historical Data (`/edit-match/:id`)
- Modify team names, venue, date, and over-by-over stats.
- Automatic cumulative calculations ensure statistical consistency across all 20 overs.
- Save updates directly to SQLite with transactional integrity.

---

## 🛠 Available Scripts

### Backend (`/backend`)
- `npm start` - Starts the production backend Express server.
- `npm run dev` - Starts the development server with automatic file watching via `nodemon`.
- `npm run build` - Rebuilds native SQLite bindings from source if necessary.

### Frontend (`/frontend`)
- `npm run dev` - Launches the Vite development server with Hot Module Replacement (HMR).
- `npm run build` - Creates an optimized production build in the `dist` folder.
- `npm run preview` - Locally previews the production build.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: add some amazing feature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Crafted with ❤️ by <strong>Sujal V Kanchan</strong> for cricket analysts, coaches, and enthusiasts.
</p>
