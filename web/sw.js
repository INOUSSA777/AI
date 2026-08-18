// Service worker : cache de l'appli (RESEAU D'ABORD pour toujours avoir la
// derniere version) + reception des vraies notifications push.

const NOM_CACHE = "ino-education-v3";
const FICHIERS_ESSENTIELS = ["/", "/index.html", "/style.css", "/script.js", "/programme_primaire.js"];

self.addEventListener("install", (evenement) => {
  evenement.waitUntil(caches.open(NOM_CACHE).then((cache) => cache.addAll(FICHIERS_ESSENTIELS)));
  self.skipWaiting();
});

self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches.keys().then((noms) => Promise.all(noms.filter((n) => n !== NOM_CACHE).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

// Reseau d'abord : on interroge le serveur (toujours a jour), on met en cache
// pour le hors-ligne, et on retombe sur le cache uniquement sans reseau.
self.addEventListener("fetch", (evenement) => {
  const req = evenement.request;
  if (req.method !== "GET" || req.url.includes("/api/")) return;
  evenement.respondWith(
    fetch(req)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(NOM_CACHE).then((cache) => cache.put(req, copie)).catch(() => {});
        return reponse;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
  );
});

// ---------- vraies notifications push ----------
self.addEventListener("push", (evenement) => {
  let donnees = { titre: "INO-Education", corps: "Tu as une notification." };
  try { donnees = evenement.data.json(); } catch { /* valeurs par defaut */ }
  evenement.waitUntil(
    self.registration.showNotification(donnees.titre, {
      body: donnees.corps,
      icon: "/icones/icone-192.png",
      badge: "/icones/icone-192.png",
    })
  );
});

self.addEventListener("notificationclick", (evenement) => {
  evenement.notification.close();
  evenement.waitUntil(clients.openWindow("/"));
});
