const CACHE_NAME = 'tokyo-trip-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  // 'icon-192x192.png', // 記得也要緩存圖標
  // '/api/weather' // 如果有串接天氣API，則不需緩存
];

self.addEventListener('install', event => {
  // 安裝 Service Worker 並緩存文件
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // 攔截請求，優先從緩存中獲取
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 緩存中有回應，則返回緩存的回應
        if (response) {
          return response;
        }
        // 緩存中沒有，則發出網路請求
        return fetch(event.request);
      })
  );
});