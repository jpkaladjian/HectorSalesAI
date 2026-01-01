import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enregistrement PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker enregistré:', registration.scope);
        
        // Vérifier mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('[PWA] Erreur enregistrement SW:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
