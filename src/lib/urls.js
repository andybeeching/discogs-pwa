// TODO: Replace with native URL object usage.
// (This isn't available in node v6, used by Firebase Cloud Functions.)
// Authentication via headers

const PREFIX = 'https://api.discogs.com'

export function getArtistSearch(query) {
  return `${PREFIX}/database/search?q=${encodeURIComponent(query)}&type=artist`
}

export function getArtist(artistId) {
  return `${PREFIX}/artists/${artistId}`
}

export function getArtistReleases(artistId) {
  return `${PREFIX}/artists/${artistId}/releases`
}

export function getRelease(releaseId) {
  return `${PREFIX}/masters/${releaseId}`
}
