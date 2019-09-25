// Cache strategy
// - html pages: stale-while-revalidate
// - static assets: cache-on-install
// - `serviceWorkerOption` injected from Webpack conf
const CACHE_NAME = new Date().toISOString()
const STATICS_CACHE = 'statics-cache-v1'
const STATICS_PATHS = [...serviceWorkerOption.assets]

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
self.addEventListener('fetch', function(evt) {
  const { url, method } = evt.request

  if (/\.(css|js)$/.test(url)) {
    evt.respondWith(assetResponse(evt))
  } else if (method === 'GET') {
    evt.respondWith(pageResponse(evt))
  }
})

// handle asset requests
// - cache-fallback-network pattern
const assetResponse = async evt => {
  const req = evt.request

  try {
    const fetchRes = fetch(req)
    const cache = await caches.open(STATICS_CACHE)
    return (await cache.match(evt.request, { ignoreVary: true })) || fetchRes
  } catch (err) {
    // TODO - display offline page instead...
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
        cache.put(req, res)
        console.log(`[SW] Cache asset: ${new URL(req.url).href}`)
      })()
    )

    return (await caches.match(req, { ignoreVary: true })) || fetchRes
  } catch (err) {
    // TODO - display offline page instead...
    console.log(err)
  }
}
