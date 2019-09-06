import fetch from 'node-fetch'
import LRU from 'lru-cache'
import dotenv from 'dotenv'

// Shelter the Discogs endpoints and help respect their rate limit with a
// light-weight cache on this server process.
//
// Ordinarily this would be implemented as a reverse proxy which could stream
// the HTML response.
const apiCache = new LRU({
  max: 100, // max items in cache
  maxAge: 1000 * 60 * 5 // 5 minutes.
})

// basic API client
dotenv.config()

async function apiClient(url) {
  const networkRes = await fetch(url, {
    method: 'get',
    headers: {
      Authorization: `Discogs key=${process.env.APIKEY}, secret=${process.env.APISECRET}`,
      'User-Agent': process.env.USER_AGENT
    }
  })

  return networkRes.json()
}

// TODO: Implement cache lookup
export default async function requestData(url) {
  const cachedRes = apiCache.get(url)

  if (cachedRes) {
    return cachedRes
  }

  const data = await apiClient(url)
  apiCache.set(url, data)

  return data
}
