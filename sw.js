// ⚠️ UPDATE THIS DATE ON EVERY DEPLOY — triggers cache refresh for all users
const BUILD = '2026-09-10g';
const CACHE_NAME = 'boxspec-' + BUILD;
const PRECACHE = [
  './',
  './index.html',
  './app.html',
  './css/style.css',
  './css/f7theme.css',
  './css/f7native.css',
  './vendor/framework7.min.css',
  './js/util.js',
  './js/native.js',
  './js/app.js',
  './js/pages.js',
  './js/calculators.js',
  './js/program10w.js',
  './js/ai-coach.js',
  './js/video-library.js',
  './js/community.js',
  './js/f7app.js',
  './vendor/framework7.min.js',
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

// Fetch: Cache-First fuer App-Dateien, Fonts und Bilder. Netz nur fuer sw.js und /api/.
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

  // Der Selbstheilungs-Block in app.html holt sw.js, um BUILD zu vergleichen.
  // Kaeme diese Antwort aus dem Cache, wuerde er ewig den alten Stand sehen
  // und die Selbstheilung nie ausloesen. Deshalb hier immer ans Netz.
  if (isOwn && /\/sw\.js(\?|$)/.test(url)) return;


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

  // App-Dateien (HTML/JS/CSS): CACHE ZUERST.
  //
  // Vorher lief das als Netzwerk-zuerst mit 3 Sekunden Rueckfallfrist. Damit
  // wartete jeder Kaltstart auf dem Handy bis zu 3 Sekunden pro Datei, bevor
  // ueberhaupt etwas erschien. Eine App fragt beim Start nie das Netz.
  //
  // Jetzt: aus dem Cache sofort ausliefern, die neue Fassung im Hintergrund
  // nachladen und fuer den naechsten Start ablegen. Dass niemand auf einem
  // alten Stand haengen bleibt, sichern zwei Dinge ab:
  //   1. sw.js selbst wird nie gecacht (siehe oben) und traegt BUILD.
  //   2. Der Selbstheilungs-Block in app.html vergleicht BUILD bei jedem
  //      Start, leert bei Abweichung alle Caches und laedt einmal neu.
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetchPromise = fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
          // Hat sich etwas geaendert, darf die App das anbieten.
          if (cached && (url.indexOf('.js') !== -1 || url.indexOf('.css') !== -1)) {
            cached.clone().text().then(function(oldText) {
              response.clone().text().then(function(newText) {
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
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return new Response(
            '<html><body style="background:#080808;color:#E8000D;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;"><div><h1 style="font-size:48px;letter-spacing:4px;">BOXSPEC</h1><p style="color:#555;font-size:14px;">Offline — diese Seite ist nicht gecacht.</p><p style="color:#333;font-size:12px;">Öffne die App einmal mit Internet.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
        return new Response('', { status: 404 });
      });

      // Liegt die Datei vor, geht sie sofort raus. Der Netzabruf laeuft
      // trotzdem weiter und aktualisiert den Vorrat fuer den naechsten Start.
      if (cached) return cached;
      return fetchPromise;
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
