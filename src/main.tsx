import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./index.css";
import "./styles/design-system.css";
import "./styles/investigation-app.css";
import App from "./App";

const root = document.getElementById("root")!;
const app = <React.StrictMode><App /></React.StrictMode>;

if (root.dataset.prerendered === "true") {
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
