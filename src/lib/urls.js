// Authentication via headers

const PREFIX = 'https://api.discogs.com'

/**
 * Returns API URL for homepage
 */
export function getRoot() {
  return `${PREFIX}/database/search?sort=hot%2Cdesc&ev=em_tr&year=2019&format=Vinyl`
}

/**
 * Returns API URL for a search term
 *
 * @param {String} query - unencoded search term
 * @example 'The Beatles'
 * @param {Number} page - page number
 * @example 12
 */
export function getArtistSearch(query, page = 1) {
  return `${PREFIX}/database/search?q=${encodeURIComponent(
    query
  )}&type=artist&page=${page}`
}

/**
 * Returns API URL for an artist/act
 *
 * @param {Number} artistId
 */
export function getArtist(artistId) {
  return `${PREFIX}/artists/${artistId}`
}

/**
 * Returns API URL for an artist/act
 *
 * @param {Number} artistId
 * @param {Number} page - page number
 * @example 12
 */
export function getArtistReleases(artistId, page = 1) {
  return `${PREFIX}/artists/${artistId}/releases?sort=year&sort_order=desc&role=Main&page=${page}`
}

/**
 * Returns API URL for a maste
 *
 * @param {Number} masterId
 */
export function getMaster(masterId) {
  return `${PREFIX}/masters/${masterId}`
}

/**
 * Returns API URL for a release
 *
 * @param {Number} releaseId
 */
export function getRelease(releaseId) {
  return `${PREFIX}/releases/${releaseId}`
}
