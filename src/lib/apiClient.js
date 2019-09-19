import LRU from 'lru-cache'
import dotenv from 'dotenv'

// require syntax needed for horrendous webpack/node issue with netlify
// https://github.com/netlify/netlify-lambda/issues/142
const fetch = require('node-fetch').default

// Shelter the Discogs endpoints and help respect their rate limit with a
// light-weight cache on this server process.
//
// Ordinarily this would be implemented as a reverse proxy which could
// cache the HTML response.
const apiCache = new LRU({
  max: 100, // max items in cache
  maxAge: 1000 * 60 * 5 // 5 minutes.
})

// helper method to clear the cache
export const clearCache = () => apiCache.reset()

// basic API client
dotenv.config()

/**
 * Executes a request to the Discogs API, and parses the JSON response
 *
 * @param {String} url - Discogs API URL
 * @example https://api.discogs.com/releases/249504
 * @docs https://www.discogs.com/developers#page:home
 * @returns {Promise}
 */
async function apiClient(url) {
  const res = await fetch(url, {
    method: 'get',
    headers: {
      Authorization: `Discogs key=${process.env.APIKEY}, secret=${process.env.APISECRET}`,
      'User-Agent': process.env.USER_AGENT,
      Accept: 'application/vnd.discogs.v2.discogs+json'
    }
  })

  // Discogs 500 errors are handled by `fetch`
  return res.ok ? res.json() : Promise.reject(new Error('Discogs 500 error'))
}

/**
 * Fetches requested data from the cache or over the network
 * NOTE: returns `null` if Discogs is down
 *
 * @param {String} url - Discogs API URL
 * @example https://api.discogs.com/releases/249504
 * @docs https://www.discogs.com/developers#page:home
 * @returns {Object|null}
 */
export default async function requestData(url) {
  const cachedRes = apiCache.get(url)

  if (cachedRes) {
    return cachedRes
  }

  try {
    const data = await apiClient(url)
    apiCache.set(url, data)
    return data
  } catch (err) {
    return null
  }
}
