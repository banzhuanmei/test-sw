// 用于标注创建的缓存，也可以根据它来建立版本规范
const CACHE_NAME = "v10";
// 列举要默认缓存的静态资源，一般用于离线使用
const urlsToCache = [
	// '/test-sw/',
	'https://banzhuanmei.github.io/test-sw/',
	'/test-sw/css/style.css',
	'/test-sw/images/banner.png',
	'/test-sw/data.js',
	// '/test-sw/images/waiting.png'
];
// self 为当前 scope 内的上下文
self.addEventListener('install', event => {
	// event.waitUtil 用于在安装成功之前执行一些预装逻辑
	// 但是建议只做一些轻量级和非常重要资源的缓存，减少安装失败的概率
	// 安装成功后 ServiceWorker 状态会从 installing 变为 installed
	event.waitUntil(
		// 使用 cache API 打开指定的 cache 文件
		caches.open(CACHE_NAME).then(cache => {
			console.log(cache);
			// 添加要缓存的资源列表
			return cache.addAll(urlsToCache);
		}).then(() => {
			return self.skipWaiting();
		})
	);
});

// 缓存更新
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 如果当前版本和缓存版本不一致
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 此处 event 为 FetchEvent
self.addEventListener('fetch', event => {
	// respondWith 劫持 http 相应，为页面的请求生成自定义的 response
	event.respondWith(
		// caches.match 通过匹配网络请求和 cache 里可获取资源的 url 和 vary header，确认是否可从缓存中获取资源
		caches.match(event.request).then(
			(response) => {
				// 缓存中可以匹配到时，直接返回匹配到的资源
				if (response !== undefined) {
					return response;
				}
				else { // 缓存中没有，请求后把资源放入缓存中
					return fetch(event.request).then(
						() => {
							// 复制一份响应，放入名称为 CACHE_NAME 的缓存中
							let responseClone = response.clone();
							caches.open(CACHE_NAME).then(
								(cache) => {
									cache.put(event.request, responseClone);
								}
							)
							return response;
						}
					).catch(() => { // 异常时，可返回备用的信息
						return caches.match('/test-sw/images/waiting.png');
					})
				}
			}
		)
	)
});