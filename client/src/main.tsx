import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";

const root = document.getElementById("root") as HTMLElement;
if (!root.innerHTML) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

