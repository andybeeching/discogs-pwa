// Cache strategy
// - html pages: stale-while-revalidate
// - static assets: cache-on-install
// - `serviceWorkerOption` injected from Webpack conf
const OFFLINE_URL = '/offline'
const CACHE_NAME = new Date().toISOString()
const STATICS_CACHE = 'statics-cache-v1'
const STATICS_PATHS = [OFFLINE_URL, '/relax.gif', ...serviceWorkerOption.assets]

// DOESN'T match discog img urls
const NOT_DISCOGS_IMG_REGEXP = /^((?!https:\/\/img.discogs.com).)*$/

self.addEventListener('install', async evt => {
  console.log('[SW] Install event')
  await evt.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATICS_CACHE)
        await cache.addAll(STATICS_PATHS)

        console.log('Cached static assets: ', STATICS_PATHS)
      } catch (err) {
        console.error(err)
        throw err
      }
    })()
  )

  return self.skipWaiting()
})

// activated when replacing an old SW
self.addEventListener('activate', async evt => {
  console.log('[SW] Activate event')
  var whitelist = [CACHE_NAME, STATICS_CACHE]

  await evt.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()

      Promise.all(
        cacheNames.map(item => {
          // delete the caches that are not the current one
          if (whitelist.indexOf(item) === -1) {
            console.log('[SW] Remove cache: ', item)
            return caches.delete(item)
          }
        })
      )
    })()
  )

  return self.clients.claim()
})

// fetch (on page refresh, navigation)
// - filters only for html
// - static resources already cached
// - Discogs statics (images) cached by browser as opaque resources
self.addEventListener('fetch', evt => {
  const { url, method } = evt.request

  if (/\.(css|js|svg|gif)$/.test(url)) {
    evt.respondWith(assetResponse(evt))
  } else if (NOT_DISCOGS_IMG_REGEXP.test(url) && method === 'GET') {
    evt.respondWith(pageResponse(evt))
  }
})

// handle asset requests
// - cache-fallback-network pattern
const assetResponse = async evt => {
  const req = evt.request

  try {
    const cache = await caches.open(STATICS_CACHE)
    return (
      (await cache.match(evt.request, { ignoreVary: true })) ||
      (await fetch(req))
    )
  } catch (err) {
    console.log(err)
  }
}

// handle page requests
// - stale-while-revalidate pattern - relies on HTTP headers
// - caches new requests cumulatively
const pageResponse = async evt => {
  const req = evt.request

  try {
    // copy response for caching
    const fetchRes = fetch(req)
    const fetchResClone = fetchRes.then(res => res.clone())

    // initial cache and revalidate part
    // keep service worker alive until resource cached
    evt.waitUntil(
      (async () => {
        const res = await fetchResClone

        // check if we received a valid response
        // - also winnows out opaque responses
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res
        }

        const cache = await caches.open(CACHE_NAME)
        await cache.put(req, res)
        console.log(`[SW] Cache asset: ${new URL(req.url).href}`)
      })()
    )

    // try cache first, falling back to network
    return (await caches.match(req, { ignoreVary: true })) || (await fetchRes)
  } catch (err) {
    return caches.match(OFFLINE_URL)
  }
}
