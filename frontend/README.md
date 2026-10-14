# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

To initiate and run the entire Cricket Analytics project locally on your machine, you need to run two commands in two separate CMD windows (one for the backend database server, and one for the React frontend).

1. Start the Backend Server
Open your first CMD window and run:

cd d:\cricket_analytics\backend
node server.js

(This will connect to the SQLite database and run the server on port 5000).

1. Start the Frontend Application
Open a second CMD window and run:

cd d:\cricket_analytics\frontend
npm run dev

(This will start the Vite React development server).

Once both are running, simply open your web browser and navigate to <http://localhost:5173> to view and use the app!
