import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { HelmetProvider } from "react-helmet-async";
import { registerServiceWorker } from "@/serviceWorker";

const REQUIRED_ENV = ["REACT_APP_BACKEND_URL"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[Config] Missing env var: ${key}`);
  }
});

if (process.env.NODE_ENV === "production") {
  registerServiceWorker();
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
