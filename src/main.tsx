import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx"; // This is the "read" that satisfies TypeScript
import "./index.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
