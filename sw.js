// ⚠️ UPDATE THIS DATE ON EVERY DEPLOY — triggers cache refresh for all users
const BUILD = '2026-09-08d';
const CACHE_NAME = 'boxspec-' + BUILD;
const PRECACHE = [
  './',
  './index.html',
  './app.html',
  './css/style.css',
  './js/util.js',
  './js/app.js',
  './js/pages.js',
  './js/calculators.js',
  './js/program10w.js',
  './js/ai-coach.js',
  './js/video-library.js',
  './js/community.js',
  './manifest.json',
  './js/chart.min.js',
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

  // Nur GET cachen — POST an /api/* wuerde cache.put sonst werfen
  if (event.request.method !== 'GET') return;

  // Firebase/Firestore/Google-APIs und alles Fremde nie cachen:
  // sonst werden Realtime-Antworten stale ausgeliefert.
  var isOwn = url.indexOf(self.location.origin) === 0;
  var isFont = url.indexOf('fonts.googleapis.com') !== -1 || url.indexOf('fonts.gstatic.com') !== -1;
  if (!isOwn && !isFont) return;

  // Eigene API nie aus dem Cache beantworten
  if (isOwn && url.indexOf('/api/') !== -1) return;

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

  // App-Dateien (HTML/JS/CSS): NETZWERK ZUERST.
  //
  // Vorher lief das als Stale-While-Revalidate: der Cache wurde sofort
  // ausgeliefert und die neue Fassung erst danach geholt. Der Nutzer sah
  // damit grundsaetzlich den Stand des VORHERIGEN Aufrufs — bei haeufigen
  // Deploys hinkt man dauerhaft eine Version hinterher.
  //
  // Jetzt: Netz zuerst, Cache nur als Rueckfallebene (offline oder Timeout).
  // Damit ist online immer der aktuelle Stand zu sehen, offline weiterhin
  // der letzte bekannte.
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
            '<html><body style="background:#080808;color:#E8000D;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;"><div><h1 style="font-size:48px;letter-spacing:4px;">BOXSPEC</h1><p style="color:#555;font-size:14px;">Offline — diese Seite ist nicht gecacht.</p><p style="color:#333;font-size:12px;">Öffne die App einmal mit Internet.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
        return new Response('', { status: 404 });
      });

      // Netz gewinnt, aber nicht ewig: nach 3s aus dem Cache liefern,
      // damit ein haengendes Netz die App nicht blockiert.
      if (!cached) return fetchPromise;
      return Promise.race([
        fetchPromise,
        new Promise(function(resolve) { setTimeout(function() { resolve(cached); }, 3000); })
      ]).catch(function() { return cached; });
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
      self.registration.showNotification(event.data.title || 'BoxSpec', {
        body: event.data.body || '',
        icon: './img/icons/icon-192x192.png',
        badge: './img/icons/icon-192x192.png',
        tag: event.data.tag || 'boxspec-reminder',
        vibrate: [100, 50, 100]
      });
    }, delay);
  }
});
