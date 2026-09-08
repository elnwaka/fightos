/* ============================================================
   BOXSPEC · NATIVE-ADAPTER
   ------------------------------------------------------------
   Jede Plattformfaehigkeit liegt hinter diesem Modul, nie direkt
   im Anwendungscode. Dadurch ist Capacitor spaeter ein Wechsel
   der Implementierung an genau einer Stelle und kein Umbau:
   liegt window.Capacitor vor, wird der native Weg genommen, sonst
   der Web-Weg. Der Aufrufer merkt keinen Unterschied.

   Bewusst ohne Server-Abhaengigkeit. Alles laeuft im Browser,
   damit dieselben Dateien in eine Capacitor-Huelle passen.
   ============================================================ */

(function (w) {
  'use strict';

  var CAP = function () { return w.Capacitor && w.Capacitor.isNativePlatform && w.Capacitor.isNativePlatform(); };
  var plugin = function (name) {
    return (w.Capacitor && w.Capacitor.Plugins && w.Capacitor.Plugins[name]) || null;
  };

  /* ---------- Umgebung ---------- */

  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
  var standalone = (function () {
    try {
      return w.matchMedia('(display-mode: standalone)').matches ||
             w.navigator.standalone === true;
    } catch (e) { return false; }
  })();

  /* ---------- Haptik ----------
     iOS kennt die Vibration API nicht. Ab iOS 17.4 loest ein
     <input type="checkbox" switch> beim Umschalten die System-
     Haptik aus. Das funktioniert nur innerhalb einer echten
     Nutzergeste, deshalb wird es aus Klick-Handlern gerufen. */

  var hapticSwitch = null;
  function ensureSwitch() {
    if (hapticSwitch) return hapticSwitch;
    try {
      var i = document.createElement('input');
      i.type = 'checkbox';
      i.setAttribute('switch', '');
      i.setAttribute('aria-hidden', 'true');
      i.tabIndex = -1;
      i.style.cssText =
        'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px';
      // Der Kniff loest die Haptik ueber einen echten click() aus. Das
      // Ereignis laeuft danach weiter bis zum Dokument, und alles, was
      // dort auf Klicks lauscht, haelt es fuer eine Nutzergeste. Ein
      // offenes Sheet schloss sich dadurch im selben Moment wieder, in
      // dem es aufging. Hier endet das Ereignis.
      var stop = function (e) { e.stopPropagation(); e.stopImmediatePropagation(); };
      i.addEventListener('click', stop, true);
      i.addEventListener('click', stop, false);
      i.addEventListener('change', stop, true);
      i.addEventListener('input', stop, true);
      document.body.appendChild(i);
      hapticSwitch = i;
    } catch (e) { hapticSwitch = null; }
    return hapticSwitch;
  }

  var HAPTIC_MS = { light: 8, medium: 14, heavy: 22, success: 12, warning: 18, error: 26 };

  function haptic(style) {
    style = style || 'light';
    // 1. Echte native Huelle
    var H = plugin('Haptics');
    if (CAP() && H) {
      try {
        if (style === 'success' || style === 'warning' || style === 'error') {
          H.notification({ type: style.toUpperCase() });
        } else {
          H.impact({ style: style.toUpperCase() });
        }
        return true;
      } catch (e) {}
    }
    // 2. Android und Desktop-Chrome
    if (!isIOS && navigator.vibrate) {
      try { navigator.vibrate(HAPTIC_MS[style] || 10); return true; } catch (e) {}
    }
    // 3. iOS 17.4+ ueber den Schalter-Kniff
    if (isIOS) {
      var s = ensureSwitch();
      if (s) { try { s.click(); return true; } catch (e) {} }
    }
    return false;
  }

  /* ---------- Teilen ---------- */

  function share(data) {
    var S = plugin('Share');
    if (CAP() && S) {
      return S.share({ title: data.title, text: data.text, url: data.url })
        .then(function () { return true; }).catch(function () { return false; });
    }
    if (navigator.share) {
      return navigator.share(data).then(function () { return true; })
        .catch(function () { return false; });
    }
    if (navigator.clipboard && data.url) {
      return navigator.clipboard.writeText(data.url)
        .then(function () { return 'copied'; }).catch(function () { return false; });
    }
    return Promise.resolve(false);
  }

  /* ---------- Statusleiste ---------- */

  function statusBar(style) {
    var SB = plugin('StatusBar');
    if (CAP() && SB) { try { SB.setStyle({ style: style || 'DARK' }); } catch (e) {} return; }
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', style === 'LIGHT' ? '#FFFFFF' : '#000000');
  }

  /* ---------- Benachrichtigungen ----------
     Web Push funktioniert auf iOS erst, wenn die App auf dem
     Homescreen liegt (ab iOS 16.4). Vorher ist der Weg gesperrt,
     und das gehoert dem Nutzer gesagt statt still zu scheitern. */

  function pushStatus() {
    if (CAP() && plugin('PushNotifications')) return 'nativ';
    if (!('Notification' in w) || !('serviceWorker' in navigator)) return 'nicht-unterstuetzt';
    if (isIOS && !standalone) return 'braucht-installation';
    return Notification.permission; // default | granted | denied
  }

  function pushAsk() {
    var P = plugin('PushNotifications');
    if (CAP() && P) {
      return P.requestPermissions().then(function (r) {
        if (r.receive === 'granted') P.register();
        return r.receive;
      });
    }
    if (pushStatus() === 'braucht-installation') return Promise.resolve('braucht-installation');
    if (!('Notification' in w)) return Promise.resolve('nicht-unterstuetzt');
    return Notification.requestPermission();
  }

  /* ---------- Speicher ----------
     iOS raeumt Daten nicht installierter Web-Apps nach sieben
     Tagen ohne Nutzung weg. persist() bittet um Ausnahme; auf dem
     Homescreen ist die Lage ohnehin deutlich stabiler. */

  function persistStorage() {
    if (!navigator.storage || !navigator.storage.persist) return Promise.resolve(false);
    return navigator.storage.persisted().then(function (already) {
      return already ? true : navigator.storage.persist();
    }).catch(function () { return false; });
  }

  /* ---------- Netz ---------- */

  var netHandlers = [];
  function onNetwork(fn) { netHandlers.push(fn); }
  function fireNet() {
    var on = navigator.onLine !== false;
    netHandlers.forEach(function (f) { try { f(on); } catch (e) {} });
  }
  w.addEventListener('online', fireNet);
  w.addEventListener('offline', fireNet);

  /* ---------- Schreibschlange ----------
     Hintergrund-Sync gibt es auf iOS nicht. Statt darauf zu bauen,
     sammeln wir Schreibvorgaenge lokal und arbeiten sie ab, sobald
     die App wieder Netz hat und im Vordergrund ist. */

  var QKEY = 'bs_queue';
  function queueRead() { try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (e) { return []; } }
  function queueWrite(a) { try { localStorage.setItem(QKEY, JSON.stringify(a.slice(-200))); } catch (e) {} }

  function enqueue(job) {
    var q = queueRead();
    q.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
             kind: job.kind, payload: job.payload, at: Date.now() });
    queueWrite(q);
    flush();
  }

  var flushing = false;
  var runners = {};
  function registerRunner(kind, fn) { runners[kind] = fn; }

  function flush() {
    if (flushing || navigator.onLine === false) return Promise.resolve(0);
    var q = queueRead();
    if (!q.length) return Promise.resolve(0);
    flushing = true;
    var done = 0;
    var step = function () {
      var list = queueRead();
      if (!list.length) return Promise.resolve();
      var job = list[0];
      var run = runners[job.kind];
      if (!run) { queueWrite(list.slice(1)); return step(); }
      return Promise.resolve()
        .then(function () { return run(job.payload); })
        .then(function () { done++; queueWrite(queueRead().slice(1)); return step(); })
        .catch(function () { /* im Netz gescheitert, beim naechsten Mal erneut */ });
    };
    return step().then(function () { flushing = false; return done; })
                 .catch(function () { flushing = false; return done; });
  }
  onNetwork(function (on) { if (on) flush(); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) flush();
  });

  /* ---------- Installation ---------- */

  var installEvent = null;
  w.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); installEvent = e;
  });

  function installState() {
    if (CAP()) return 'nativ';
    if (standalone) return 'installiert';
    if (installEvent) return 'prompt-moeglich';   // Android, Chrome
    if (isIOS) return 'ios-anleitung';            // Safari kann nur ueber Teilen
    return 'unbekannt';
  }

  function installPrompt() {
    if (!installEvent) return Promise.resolve(false);
    installEvent.prompt();
    return installEvent.userChoice.then(function (c) {
      installEvent = null;
      return c.outcome === 'accepted';
    }).catch(function () { return false; });
  }

  /* ---------- Bewegung ---------- */

  function reducedMotion() {
    try { return w.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  w.Native = {
    isNative: CAP, isIOS: isIOS, isSafari: isSafari, standalone: standalone,
    haptic: haptic, share: share, statusBar: statusBar,
    pushStatus: pushStatus, pushAsk: pushAsk,
    persistStorage: persistStorage,
    onNetwork: onNetwork, online: function () { return navigator.onLine !== false; },
    enqueue: enqueue, flush: flush, registerRunner: registerRunner,
    queueLength: function () { return queueRead().length; },
    installState: installState, installPrompt: installPrompt,
    reducedMotion: reducedMotion
  };

  // Speicher gleich beim Start sichern, das kostet nichts.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { persistStorage(); });
  } else { persistStorage(); }

})(window);
