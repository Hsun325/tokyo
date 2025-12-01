// 【重要】快取版本已遞增到 v12，以強制更新新的 HTML 和 CSS 結構
const CACHE_NAME = 'tokyo-trip-cache-v12'; 

const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    // 確保 Icon 檔案也被快取
    '/icon-192x192.png', 
    '/icon-512x512.png',
    
    // 【新增】行程圖片路徑，確保離線時圖片能正常顯示
    '/images/tokyo-skytree.jpg',
    '/images/disney-sea.jpg',
    '/images/shibuya-sky.jpg',
    '/images/gotokuji.jpg',
    '/images/fuji.jpg',
    '/images/fuji.jpg',
    '/images/kamakura.jpg',
    '/images/ueno.jpg',
    '/images/home.jpg'
];

// 1. 安裝階段：快取所有所需資源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache, v12'); // 顯示新版本
                return cache.addAll(urlsToCache);
            })
            // 立即跳過等待，讓 Service Worker 進入激活狀態
            .then(() => self.skipWaiting())
    );
});

// 2. 激活階段：清理舊版本的快取 (V1 到 V11 的快取都會被清除)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 刪除所有不是當前 CACHE_NAME 的快取
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName); 
                    }
                })
            );
        })
        .then(() => self.clients.claim()) // 接管頁面
    );
});

// 3. 抓取階段：從快取中回應，若快取失敗則從網路中抓取 (實現離線)
self.addEventListener('fetch', event => {
    // 只有 GET 請求才進行快取處理
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 快取命中 - 返回快取資源
                if (response) {
                    return response;
                }
                
                // 快取未命中 - 從網路抓取資源
                return fetch(event.request).catch(error => {
                    // 如果網路失敗，可以在這裡返回一個離線頁面
                    console.error('Fetching failed:', event.request.url, error);
                });
            })
    );
});

