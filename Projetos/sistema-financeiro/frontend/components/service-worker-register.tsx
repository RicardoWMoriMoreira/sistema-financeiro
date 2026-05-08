"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado:", registration.scope);
        })
        .catch((error) => {
          console.error("Falha ao registrar Service Worker:", error);
        });
    }
  }, []);

  return null;
}
