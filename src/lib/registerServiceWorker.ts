export function cleanupLegacyServiceWorker() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    return Promise.all(registrations.map((registration) => registration.unregister()));
  });

  if ("caches" in window) {
    void caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("crossover-image-cache-"))
          .map((key) => caches.delete(key)),
      );
    });
  }
}
