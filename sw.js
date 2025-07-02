const CACHE_NAME = 'calculator-pwa-v2'; // キャッシュ名を変更して、新しいバージョンを強制的に適用
const urlsToCache = [
    './', // index.html のルートパス (index.html自身)
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    // アプリで使用するアイコンファイルもすべてキャッシュ対象に含めます
    'icons/icon-72x72.png',
    'icons/icon-96x96.png',
    'icons/icon-128x128.png',
    'icons/icon-144x144.png',
    'icons/icon-152x152.png',
    'icons/icon-192x192.png',
    'icons/icon-384x384.png',
    'icons/icon-512x512.png'
];

// サービスワーカーのインストールイベント
// このイベントで、指定されたファイルをキャッシュにプリロードします。
self.addEventListener('install', (event) => {
    // waitUntilは、サービスワーカーがインストールされるまで待機することを保証します。
    event.waitUntil(
        caches.open(CACHE_NAME) // 新しいキャッシュを開きます
            .then((cache) => {
                console.log('Opened cache:', CACHE_NAME);
                return cache.addAll(urlsToCache); // 定義されたすべてのファイルをキャッシュに追加します
            })
            .catch((error) => {
                console.error('Failed to open cache or add URLs:', error);
            })
    );
});

// サービスワーカーのフェッチイベント
// このイベントは、ブラウザが何かをリクエストするたびに発生します。
self.addEventListener('fetch', (event) => {
    // event.respondWithは、ブラウザにレスポンスを返します。
    event.respondWith(
        caches.match(event.request) // リクエストがキャッシュにあるか確認します
            .then((response) => {
                // キャッシュにレスポンスがあればそれを返します
                if (response) {
                    return response;
                }
                // キャッシュになければネットワークから取得します
                return fetch(event.request)
                    .catch(() => {
                        // ネットワークエラーの場合、例えばオフラインページを返すこともできます
                        // 今回はシンプルな電卓なので、ここではエラーをログに出すのみ
                        console.error('Network request failed for:', event.request.url);
                        // 必要であれば、ここでオフライン用のフォールバックコンテンツを返す
                    });
            })
    );
});

// サービスワーカーのアクティベートイベント
// このイベントは、新しいサービスワーカーが有効になったときに発生します。
// 主に古いキャッシュをクリーンアップするために使用します。
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            // 現在のキャッシュ名と異なる古いキャッシュをすべて削除します
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
