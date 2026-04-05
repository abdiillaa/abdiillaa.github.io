const CACHE_NAME = "ubt-runtime-cache-v2";

const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./test/style.css",
  "./test/app.js",
  "./chart.js",
  "./1.png",
  "./2.png",
  "./3.png",
  "./4.png",
  "./avatar.jpg",
  "./avatars/roma.jpg",
  "./avatars/sayan.jpg",
  "./mendeleev.jpg",
  "./erigish.png"
];

const DATA_ASSETS = [
  "./materials-data/catalog.json",
  "./materials-data/topics/his-medieval-cities.json",
  "./materials-data/topics/inf-1-1.json",
  "./materials-data/topics/inf-1-2.json",
  "./materials-data/topics/inf-1-3.json",
  "./materials-data/topics/inf-1-4.json",
  "./materials-data/topics/inf-10-1-1.json",
  "./materials-data/topics/inf-2-1.json",
  "./materials-data/topics/inf-2-2.json",
  "./materials-data/topics/inf-2-5.json",
  "./materials-data/topics/inf-4-1.json",
  "./materials-data/topics/inf-4-3.json",
  "./materials-data/topics/math-algebra-base.json",
  "./test/data/1.1.json",
  "./test/data/1.2.json",
  "./test/data/1.3.json",
  "./test/data/1.4.json",
  "./test/data/10.1.1.json",
  "./test/data/1991.json",
  "./test/data/2.1.json",
  "./test/data/2.2.json",
  "./test/data/2.5.json",
  "./test/data/3.1.json",
  "./test/data/4.1.json",
  "./test/data/4.2.json",
  "./test/data/4.3.json",
  "./test/data/4.4.json",
  "./test/data/4.5.json",
  "./test/data/SD.json",
  "./test/data/altynorda.json",
  "./test/data/ezhelgi.json",
  "./test/data/khanat-v2.json",
  "./test/data/khanate.json",
  "./test/data/khanatedel.json",
  "./test/data/kz-history-10-test-1.json",
  "./test/data/mongolshapkyn.json",
  "./test/data/nogai.json",
  "./test/data/qarakhan.json",
  "./test/data/syrymdatuly.json",
  "./test/data/turik.json",
  "./test/data/turikmadinet.json",
  "./test/data/ulyJibek.json",
  "./test/data/xvmadinet.json",
  "./test/data/zhongar.json",
  "./users/ranking.json",
  "./users/41c991eb6a66242c0454191244278183ce58cf4a6bcd372f799e4b9cc01886af.json",
  "./users/9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0.json",
  "./users/a33805cfe8452895be97edd6552029f20be635f67944c9c8978004f84b502649.json"
];

const PRECACHE_ASSETS = [...new Set([...APP_SHELL_ASSETS, ...DATA_ASSETS])];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin;
}

function shouldUseNetworkFirst(request) {
  const accept = request.headers.get("accept") || "";
  const url = new URL(request.url);
  return (
    request.mode === "navigate" ||
    accept.includes("text/html") ||
    accept.includes("text/css") ||
    accept.includes("javascript") ||
    accept.includes("application/json") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".json")
  );
}

async function putInCache(request, response) {
  if (!response || response.status !== 200 || response.type !== "basic") {
    return response;
  }
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (!isSameOrigin(requestUrl)) return;

  if (shouldUseNetworkFirst(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => putInCache(request, response))
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => putInCache(request, response))
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
