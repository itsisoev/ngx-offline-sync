'use strict';

const CACHE_VERSION = 'ngx-offline-sync-v4';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SCOPE = self.registration.scope;
const INDEX_URL = SCOPE;
const FINGERPRINT_URL = new URL('__ngx-offline-sync-fingerprint', SCOPE).href;
const IS_DEV = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);

const NETWORK_TIMEOUT_MS = 4000;
const PRECACHE_LIMIT = 400;
const PRECACHE_CONCURRENCY = 8;

const CACHEABLE_DESTINATIONS = new Set([
  'script',
  'style',
  'font',
  'image',
  'manifest',
  'worker',
  'sharedworker',
]);

const CACHEABLE_EXTENSIONS =
  /\.(?:m?js|css|woff2?|ttf|otf|eot|svg|png|jpe?g|gif|webp|avif|ico|webmanifest|json|wasm)$/i;
const IMPORT_RE =
  /\b(?:import|export)\s*(?:[^'"`;()]*?\bfrom\s*)?["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const HTML_LINK_RELS = /(stylesheet|modulepreload|preload|icon|manifest)/i;
const isOffline = () => self.navigator.onLine === false;
const timeoutAfter = (ms) => new Promise((resolve) => setTimeout(() => resolve(null), ms));
const isHtml = (response) => (response.headers.get('content-type') || '').includes('text/html');

function isStorable(response) {
  return (
    !!response &&
    response.status === 200 &&
    (response.type === 'basic' || response.type === 'default')
  );
}

function isCacheable(request, url) {
  return CACHEABLE_DESTINATIONS.has(request.destination) || CACHEABLE_EXTENSIONS.test(url.pathname);
}

function toSameOriginUrl(value, base) {
  try {
    const url = new URL(value, base);

    if (url.origin !== self.location.origin) {
      return null;
    }

    url.hash = '';

    return url.href;
  } catch {
    return null;
  }
}

async function safePut(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);

    await cache.put(request, response);
  } catch {}
}

async function matchCache(request, cacheName, loose = false) {
  const cache = await caches.open(cacheName);
  const exact = await cache.match(request, { ignoreVary: true });

  if (exact || !loose) {
    return exact;
  }

  return cache.match(request, { ignoreVary: true, ignoreSearch: true });
}

async function cleanResponse(response) {
  if (!response.redirected) {
    return response;
  }

  const body = await response.blob();

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

function unavailable() {
  return new Response('', { status: 503, statusText: 'Offline and resource is not cached' });
}

function offlinePage() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Offline</title>
</head>
<body>
  <h1>Offline</h1>
  <p>This application has not been cached yet. Open it once while online and try again.</p>
</body>
</html>`,
    {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    },
  );
}

async function fetchAndStore(request) {
  const response = await fetch(request);

  if (isStorable(response)) {
    await safePut(RUNTIME_CACHE, request, response.clone());
  }

  return response;
}

function extractHtmlAssets(html) {
  const urls = new Set();
  const baseTag = html.match(/<base\b[^>]*\shref\s*=\s*["']([^"']+)["']/i);
  const root = baseTag ? new URL(baseTag[1], SCOPE).href : SCOPE;

  for (const match of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const isScript = match[1].toLowerCase() === 'script';
    const attr = isScript ? 'src' : 'href';
    const value = tag.match(new RegExp(`\\s${attr}\\s*=\\s*["']([^"']+)["']`, 'i'));

    if (!value) {
      continue;
    }

    if (!isScript) {
      const rel = tag.match(/\srel\s*=\s*["']([^"']+)["']/i);

      if (!rel || !HTML_LINK_RELS.test(rel[1])) {
        continue;
      }
    }

    const url = toSameOriginUrl(value[1], root);

    if (url) {
      urls.add(url);
    }
  }

  return urls;
}

function extractJsImports(code, baseUrl) {
  const found = [];

  for (const match of code.matchAll(IMPORT_RE)) {
    const specifier = match[1] || match[2];

    if (!specifier || !/^[./]/.test(specifier)) {
      continue;
    }

    const url = toSameOriginUrl(specifier, baseUrl);

    if (url) {
      found.push(url);
    }
  }

  return found;
}

async function precacheAsset(url) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    let response = await cache.match(url, { ignoreVary: true });

    if (!response) {
      response = await fetch(url);

      if (!isStorable(response)) {
        return [];
      }

      await safePut(RUNTIME_CACHE, url, response.clone());
    }

    if (!/\.m?js$/i.test(new URL(url).pathname)) {
      return [];
    }

    return extractJsImports(await response.text(), url);
  } catch {
    return [];
  }
}

async function precacheAssets(html) {
  const seen = new Set();
  const queue = [...extractHtmlAssets(html)];

  while (queue.length && seen.size < PRECACHE_LIMIT) {
    const batch = queue.splice(0, PRECACHE_CONCURRENCY).filter((url) => !seen.has(url));

    batch.forEach((url) => seen.add(url));

    const results = await Promise.all(batch.map(precacheAsset));

    for (const imports of results) {
      for (const url of imports) {
        if (!seen.has(url)) {
          queue.push(url);
        }
      }
    }
  }
}

function hashText(text) {
  let hash = 5381;

  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  }

  return String(hash >>> 0);
}

function fingerprintOf(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';

  return hashText([title.trim(), ...extractHtmlAssets(html)].join('|'));
}

async function doSync(html) {
  const fingerprint = fingerprintOf(html);
  const shell = await caches.open(SHELL_CACHE);
  const stored = await shell.match(FINGERPRINT_URL);

  if (stored && (await stored.text()) === fingerprint) {
    return;
  }

  await caches.delete(RUNTIME_CACHE);

  for (const key of await shell.keys()) {
    if (key.url !== INDEX_URL) {
      await shell.delete(key);
    }
  }

  await precacheAssets(html);
  await safePut(SHELL_CACHE, FINGERPRINT_URL, new Response(fingerprint));
}

let syncPromise = null;

function syncWithApp(html) {
  if (!syncPromise) {
    syncPromise = doSync(html)
      .catch(() => undefined)
      .finally(() => {
        syncPromise = null;
      });
  }

  return syncPromise;
}

async function precache() {
  const response = await fetch(INDEX_URL, { cache: 'reload' });

  if (!response.ok || !isHtml(response)) {
    return;
  }

  const html = await response.clone().text();

  await safePut(SHELL_CACHE, INDEX_URL, await cleanResponse(response));
  await syncWithApp(html);
}

async function handleNavigation(event) {
  const { request } = event;

  const fromCache = async () => {
    const cache = await caches.open(SHELL_CACHE);

    return (
      (await cache.match(request.url, { ignoreVary: true })) ||
      (await cache.match(request.url, { ignoreVary: true, ignoreSearch: true })) ||
      (await cache.match(INDEX_URL, { ignoreVary: true })) ||
      null
    );
  };

  if (isOffline()) {
    return (await fromCache()) || offlinePage();
  }

  const network = fetch(request).then((response) => {
    if (response.ok && isHtml(response)) {
      const forRequest = response.clone();
      const forIndex = response.clone();
      const forSync = response.clone();

      event.waitUntil(
        Promise.all([
          safePut(SHELL_CACHE, request.url, forRequest),
          safePut(SHELL_CACHE, INDEX_URL, forIndex),
          forSync.text().then(syncWithApp),
        ]),
      );
    }

    return response;
  });

  event.waitUntil(network.catch(() => undefined));

  try {
    const response = await Promise.race([network, timeoutAfter(NETWORK_TIMEOUT_MS)]);

    if (response) {
      if (response.status >= 500) {
        const cached = await fromCache();

        if (cached) {
          return cached;
        }
      }

      return response;
    }
  } catch {
    return (await fromCache()) || offlinePage();
  }

  const cached = await fromCache();

  if (cached) {
    return cached;
  }

  try {
    return await network;
  } catch {
    return offlinePage();
  }
}

async function staleWhileRevalidate(event, cached) {
  const network = fetchAndStore(event.request);

  event.waitUntil(network.catch(() => undefined));

  if (cached) {
    return cached;
  }

  try {
    return await network;
  } catch {
    return (await matchCache(event.request, RUNTIME_CACHE, true)) || unavailable();
  }
}

async function networkFirst(event, cached) {
  const network = fetchAndStore(event.request);

  event.waitUntil(network.catch(() => undefined));

  if (cached) {
    try {
      const response = await Promise.race([network, timeoutAfter(NETWORK_TIMEOUT_MS)]);

      if (response && response.ok) {
        return response;
      }
    } catch {}

    return cached;
  }

  try {
    return await network;
  } catch {
    return (await matchCache(event.request, RUNTIME_CACHE, true)) || unavailable();
  }
}

async function handleAsset(event) {
  const { request } = event;
  const cached = await matchCache(request, RUNTIME_CACHE);

  if (isOffline()) {
    return cached || (await matchCache(request, RUNTIME_CACHE, true)) || unavailable();
  }

  return IS_DEV ? networkFirst(event, cached) : staleWhileRevalidate(event, cached);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    precache()
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith('ngx-offline-sync-') && !key.startsWith(`${CACHE_VERSION}-`),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;

  if (data === 'SKIP_WAITING' || (data && data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || request.headers.has('range')) {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));

    return;
  }

  if (isCacheable(request, url)) {
    event.respondWith(handleAsset(event));
  }
});
