// ⚠️ UPDATE THIS DATE ON EVERY DEPLOY — triggers cache refresh for all users
const BUILD = '2026-04-08';
const CACHE_NAME = 'fightos-' + BUILD;
const PRECACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/pages.js',
  './js/calculators.js',
  './manifest.json',
  './js/chart.min.js',
  './js/apexcharts.min.js',
  './css/apexcharts.css',
  './js/firebase-app.js',
  './js/firebase-auth.js',
  './js/firebase-firestore.js',
  './js/firebase-storage.js',
  './img/icons/icon.svg',
  './img/icons/icon-192x192.png',
  './img/icons/icon-512x512.png'
];

// Install: Pre-cache core files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: Clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: Stale-While-Revalidate for app files, Cache-First for fonts/images
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Google Fonts: Cache-First
  if (url.indexOf('fonts.googleapis.com') !== -1 || url.indexOf('fonts.gstatic.com') !== -1) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          }
          return response;
        });
      })
    );
    return;
  }

  // Images: Cache-First with Network-Fallback
  if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i)) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          }
          return response;
        }).catch(function() {
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // App files (HTML/JS/CSS): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetchPromise = fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
          // Check if content changed (update notification)
          if (cached && (url.indexOf('.js') !== -1 || url.indexOf('.css') !== -1)) {
            cached.text().then(function(oldText) {
              clone.clone().text().then(function(newText) {
                if (oldText !== newText) {
                  self.clients.matchAll().then(function(clients) {
                    clients.forEach(function(client) {
                      client.postMessage({ type: 'UPDATE_AVAILABLE' });
                    });
                  });
                }
              });
            });
          }
        }
        return response;
      }).catch(function() {
        // Network failed — return offline fallback if no cache
        if (event.request.mode === 'navigate') {
          return new Response(
            '<html><body style="background:#080808;color:#E8000D;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;"><div><h1 style="font-size:48px;letter-spacing:4px;">FIGHTOS</h1><p style="color:#555;font-size:14px;">Offline — diese Seite ist nicht gecacht.</p><p style="color:#333;font-size:12px;">Oeffne die App einmal mit Internet.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
        return new Response('', { status: 404 });
      });

      return cached || fetchPromise;
    })
  );
});

// ===== NOTIFICATIONS =====
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
      for (var i = 0; i < clients.length; i++) {
        if ('focus' in clients[i]) return clients[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    var delay = event.data.delay || 0;
    setTimeout(function() {
      self.registration.showNotification(event.data.title || 'FightOS', {
        body: event.data.body || '',
        icon: './img/icons/icon-192x192.png',
        badge: './img/icons/icon-192x192.png',
        tag: event.data.tag || 'fightos-reminder',
        vibrate: [100, 50, 100]
      });
    }, delay);
  }
});
