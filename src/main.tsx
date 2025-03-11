
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { App } from "@/App";

import "./index.css";

const root = document.getElementById("app") as HTMLElement;

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}