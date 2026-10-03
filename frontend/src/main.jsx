/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Entry point — frozen engine scripts first, then the UI.
 * ============================================================ */

import "./services/engine.js";
import "./index.css";
import "./animations.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
