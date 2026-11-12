// 簿記2級 トレーニング：オフライン対応
// いつも最新版を取りにいき、つながらないときだけ保存してある版を使う（ネットワーク優先）
const CACHE = 'boki2-v1';
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'icon-180.png', 'manifest.webmanifest'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== 'GET') return;
  // PDF読み込み用ライブラリ（バージョン固定）は、一度取れたら保存した版を使う
  if(req.url.startsWith(CDN)){
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { c.put(req, res.clone()); return res; }))));
    return;
  }
  if(url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => { if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, {ignoreSearch:true}).then(hit => hit || caches.match('./')))
  );
});
