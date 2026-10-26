const CACHE_NAME = "senest-v4"
const OFFLINE_URL = "/offline"
const PRECACHE = ["/", "/offline", "/manifest.json", "/logo.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // API so'rovlarini SW UMUMAN ushlamaydi (dynamic + auth talab qiladi)
  if (url.pathname.startsWith("/api/")) return
  // Faqat GET so'rovlar
  if (event.request.method !== "GET") return

  // Sahifa navigatsiyasi: offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Static fayllar: cache-first, xatoda jim qolamiz
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            if (
              response.ok &&
              (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"))
            ) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
            }
            return response
          })
          .catch(() => undefined)
    )
  )
})

// PUSH BILDIRISHNOMALARI
self.addEventListener("push", (event) => {
  let data = { title: "Senest", body: "Yangi bildirishnoma", link: "/" }
  try {
    if (event.data) data = Object.assign(data, event.data.json())
  } catch (e) {
    if (event.data) data.body = event.data.text()
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.svg",
      badge: "/logo.svg",
      data: { link: data.link },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const link = (event.notification.data && event.notification.data.link) || "/"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(link)
          return client.focus()
        }
      }
      return self.clients.openWindow(link)
    })
  )
})
