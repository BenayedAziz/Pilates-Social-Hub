import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
