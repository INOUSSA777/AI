// Service worker : mise en cache basique de l'appli + réception des vraies
// notifications push (rappels de révision envoyés par le serveur).

const NOM_CACHE = "inous-ai-v1";
const FICHIERS_ESSENTIELS = ["/", "/index.html", "/style.css", "/script.js"];

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

self.addEventListener("fetch", (evenement) => {
  if (evenement.request.method !== "GET" || evenement.request.url.includes("/api/")) return;
  evenement.respondWith(
    caches.match(evenement.request).then((r) => r || fetch(evenement.request).catch(() => caches.match("/index.html")))
  );
});

// ---------- vraies notifications push ----------
self.addEventListener("push", (evenement) => {
  let donnees = { titre: "INOUS.AI", corps: "Tu as une notification." };
  try { donnees = evenement.data.json(); } catch { /* garde les valeurs par défaut */ }

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
