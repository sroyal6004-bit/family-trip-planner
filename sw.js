const CACHE = 'family-trip-v3';
const ASSETS = [
  './index.html',
  './manifest.json',
  './firebase-config.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 같은 출처의 GET 요청만 처리 (Firebase/구글 등 외부 요청은 그대로 통과)
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // 네트워크 우선: 온라인이면 항상 최신 파일을 받고, 오프라인일 때만 캐시 사용.
  // (설정 파일·앱 코드가 옛날 버전으로 고정되는 문제를 방지)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
