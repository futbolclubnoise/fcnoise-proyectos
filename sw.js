// Service worker mínimo: sin caché (passthrough). Habilita la instalación como app
// sin interferir con el sistema de versión (build.txt / APP_BUILD).
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => { /* red directa, sin caché */ return; });
