// Offline support for strata.theether.in.
// The app is a single HTML file; network-first for it (so deploys show up), cache-first for the book and icons.
const CACHE = 'strata-v1';
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
	e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
	const url = new URL(e.request.url);
	if (url.origin !== location.origin) return; // fonts etc. go straight to the network
	if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
		e.respondWith(
			fetch(e.request)
				.then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('/index.html', copy)); return r; })
				.catch(() => caches.match('/index.html'))
		);
		return;
	}
	e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })));
});
