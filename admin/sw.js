// Service worker del pannello /admin: riceve le notifiche push (functions/_push.js) e al tocco apre il pannello.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch (err) { m = { testo: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(m.titolo || 'produkts.it', {
    body: m.testo || '',
    icon: '/apple-touch-icon.png',
    badge: '/favicon.png',
    data: { url: m.url || '/admin/' },
    tag: 'pk-' + Date.now(),
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || '/admin/', self.location.origin).href;
  e.waitUntil((async () => {
    const aperte = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of aperte) {
      if (c.url.startsWith(self.location.origin + '/admin')) { await c.focus(); return c.navigate(url); }
    }
    return self.clients.openWindow(url);
  })());
});
