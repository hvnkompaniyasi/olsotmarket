// OLSOT MARKET SERVICE WORKER v1
const CACHE_NAME = "olsot-market-v1";
const OFFLINE_URL = "/offline";
const PRECACHE = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// 1. O'rnatish (Install)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting(); // Yangi SW darhol kuchga kirishi uchun
});

// 2. Faollashtirish (Activate) - Eski keshlarni o'chirish
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 3. So'rovlarni ushlash (Fetch)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API va Auth so'rovlarini SW ushlamaydi (o'zgaruvchan ma'lumotlar)
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Faqat GET so'rovlarini keshlaymiz
  if (event.request.method !== "GET") return;

  // Sahifa navigatsiyasi: internet yo'q bo'lsa offline sahifasini ko'rsatish
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static fayllar (Rasmlar, CSS, JS): Cache-first strategiyasi
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Faqat Next.js static fayllari va ikonkalarni keshlaymiz
          if (
            response.ok &&
            (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"))
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => new Response("Network error", { status: 408, headers: { "Content-Type": "text/plain" } }));
    })
  );
});

// 4. PUSH BILDIRISHNOMALARI (Web Push)
self.addEventListener("push", (event) => {
  let data = { title: "Olsot Market", body: "Yangi bildirishnoma", link: "/" };
  
  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png", // Android uchun kichik ikonka
      data: { link: data.link },
      vibrate: [200, 100, 200], // Telefon tebranishi
    })
  );
});

// 5. Bildirishnoma bosilganda (Notification Click)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Agar sayt allaqachon ochiq bo'lsa, o'sha tabga o'tish
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      // Aks holda yangi oyna ochish
      return self.clients.openWindow(link);
    })
  );
});