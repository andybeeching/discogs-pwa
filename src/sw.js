// Cache strategy
// - html pages in latest cache, stale-while-revalidate
// - static assets in separate cache
// - `serviceWorkerOption` injected from Webpack conf
const CACHE_NAME = new Date().toISOString()
const STATICS_CACHE = 'statics-cache-v1'
const STATICS_PATHS = [...serviceWorkerOption.assets]

self.addEventListener('install', evt => {
  console.log('[SW] Install event')
  evt.waitUntil(
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
})

// activated when replacing an old SW
self.addEventListener('activate', function(evt) {
  console.log('[SW] Activate event')
  var whitelist = [CACHE_NAME, STATICS_CACHE]

  evt.waitUntil(
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
})

// fetch (on page refresh, navigation)
// - filters only for html
// - static resources already cached
// - Discogs statics (images) cached by browser as opaque resources
self.addEventListener('fetch', function(evt) {
  const { url } = evt.request

  if (/^(?!.*(.css$|.js$|.svg$))/.test(url)) {
    evt.respondWith(pageResponse(evt))
  }
})

// handle page requests
// - stale-while-revalidate pattern - relies on HTTP headers
// - caches new requests cumulatively
const pageResponse = async evt => {
  const req = evt.request

  // `undefined` if cache miss
  const cachedRes = await caches.match(req, {
    ignoreVary: true
  })

  try {
    const fetchRes = fetch(req)

    // keep service worker alive until resource cached
    evt.waitUntil(
      (async () => {
        const res = await fetchRes

        // Check if we received a valid response
        // - filters out opaque Discogs responses
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        const resToCache = res.clone()
        const cache = await caches.open(CACHE_NAME)

        cache.put(req, resToCache)
        console.log(`[SW] Cache asset: ${new URL(req.url).href}`)
      })()
    )

    // debug
    // if (cachedRes) {
    //   console.log(cachedRes)
    //   console.log(`[SW] Returns cached asset for: ${new URL(req.url).href}`)
    // }

    return cachedRes || fetchRes
  } catch (err) {
    // TODO - display offline page instead...
    console.log(err)
  }
}
