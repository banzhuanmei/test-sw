importScripts ('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');
if (workbox) {
	console.log(`Yay! workbox is loaded 🎉`);
}
else {
	console.log(`Boo! workbox didn't load 😬`);
}
workbox.setConfig({
  debug: false
});
workbox.skipWaiting();
workbox.clientsClaim();

var currentCacheNames = {
  page: 'www:page',
  static: 'www:static',
  img: 'www:img'
};

// html 缓存
workbox.routing.registerRoute(
  function({url, event}) {
		console.log(url.hostname);
    if (url.hostname === 'banzhuanmei.github.io') {
      return (new RegExp('/(.*)').test(url.pathname))
    } else {
      return false;
    }
  },
  workbox.strategies.networkFirst({
    cacheName: currentCacheNames.page,
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 10
      })
    ]
  })
);