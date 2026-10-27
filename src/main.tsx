import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/app.css";
import "./styles/public.css";
import "./styles/public-chrome.css";
import App from "./App";

const root = document.getElementById("root")!;
const app = <React.StrictMode><App /></React.StrictMode>;

if (root.dataset.prerendered === "true") {
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
