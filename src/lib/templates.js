import rbl from 'remove-blank-lines'
import offlineImg from '../img/relax.gif'
import fourOhFourImg from '../img/404.gif'
import fiveOhOhImg from '../img/500.gif'

// removes superflous line breaks and leading/trailing whitespace
const trim = str => rbl(str).trim()

/**
 * Render the Root page
 *
 * @param {Object} data - Discogs Search Result data entity
 * @returns {String}
 */
export function root(data) {
  return trim(`
    <h2>Popular on Discogs</h2>
    <ul class="grid">
      ${data.results.map(item => getGridItem(item, item.type)).join('')}
    </ul>
  `)
}

/**
 * Render the Search Results page content
 *
 * @param {Object} data - Discogs Search Result data entity
 * @param {String} query - Search terms (unencoded)
 * @returns {String}
 */
export function artistsSearchResults(data, query) {
  const resultRange = getResultRange(data.pagination)

  const slug = `/search/${encodeURIComponent(query)}/`
  const pagination = getPagination(data.pagination, slug)

  return trim(`
    ${query ? `<h2>Search results for "${query}"</h2>` : ''}
    ${resultRange}
    ${pagination}
    <ul class="grid">
      ${data.results
        .map(item => getGridItem(item, 'artist', '/page/1'))
        .join('')}
    </ul>
    ${pagination}
  `)
}

/**
 * Render the number of search results with range
 *
 * @param {Object} pagination - Discogs Pagination data entity
 * @docs https://www.discogs.com/developers#page:home,header:home-pagination
 * @returns {String}
 */
export function getResultRange(pagination) {
  const { items, page, pages, per_page: perPage } = pagination
  const startRange = (page - 1) * perPage + 1
  const endRange = page === pages ? items : page * perPage

  return `
    ${
      items > 0
        ? `
      <p>${pagination.items} results were found, viewing ${startRange} to ${endRange}</p>
    `
        : 'No search results found'
    }
  `
}

/**
 *
 * @param {Object} pagination - Discogs Pagination data entity
 * @docs https://www.discogs.com/developers#page:database,header:database-search-get
 * @param {String} slug - URL encoded PWA endpoint for related requests
 * @example 'search?q=The%20Beatles'
 * @returns {String}
 */
export function getPagination(pagination, slug) {
  const { page, pages } = pagination

  return pages > 1
    ? `
    <ol class="pagination">
      <li>
        ${
          page === 1
            ? `<span class="disabled-link">&laquo;</span>`
            : `<a href="${slug}page/1">&laquo;</a>`
        }
      </li>
      <li>
        ${
          page === 1
            ? `<span class="disabled-link">Previous page</span>`
            : `<a href="${slug}page/${pagination.page - 1}">Previous page</a>`
        }
      </li>
      <li>
        ${
          page === pages
            ? `<span class="disabled-link">Next page</span>`
            : `<a href="${slug}page/${pagination.page + 1}">Next page</a>`
        }
      </li>
      <li>
        ${
          page === pages
            ? `<span class="disabled-link">&raquo;</span>`
            : `<a href="${slug}page/${pages}">&raquo;</a>`
        }
      </li>
    </ol>
  `
    : ''
}

/**
 * Renders Grid item
 *
 * @param {Object} item - Discogs Artist or Release data entity
 * @param {String} slug - URL encoded PWA endpoint for related requests
 * @example 'artist'
 * @param {String} trailing - additional string to append to releated URLs
 * @optional
 * @example 'page=1'
 * @returns {String}
 */
function getGridItem(item, slug, trailing = '') {
  return `
    <li class="grid-item">
      <a href="/${slug}/${item.id}${trailing}">
        <img src="${item.thumb}" />
        <span class="desc">${item.title}</span>
      </a>
    </li>
  `
}

/**
 * Renders a list of artists as a readable list
 *
 * @param {Array} artists - array of 'members' from Artist data entity
 * @example [{ name: {String}, id: {Number}}, ...]
 * @returns {String}
 */
export function explodeArtists(artists) {
  return artists
    .map((item, idx, arr) => {
      const isLast = arr[idx + 1] === undefined
      const leadingChars = idx > 0 && isLast ? 'and ' : ''
      const trailingChars = !isLast && !leadingChars ? ', ' : ''

      return `${leadingChars}<a href="/artist/${item.id}/page/1">${item.name}</a>${trailingChars}`
    })
    .join('')
}

/**
 * Renders an artist summary
 *
 * @param {{Object}} data - Discogs Artist data entity
 * @returns {String}
 */
export function artist(data) {
  return `
    <h2 class="h2">${data.name}</h2>
    <p>${data.profile}</p>
    ${data.members ? `<p>Members: ${explodeArtists(data.members)}</p>` : ''}
  `
}

/**
 * Renders artist releases in descending (by release date) order.
 *
 * @param {Object} data - Discogs Artist Releases data entity
 * @param {Number} artistId - artist id
 * @returns {String}
 */
export function releaseList(data, artistId) {
  const slug = `/artist/${artistId}/`
  const pagination = getPagination(data.pagination, slug)

  return trim(`
    <h3 class="h3">Releases</h2>
    ${pagination}
    <ul class="grid">
      ${data.releases.map(item => getGridItem(item, item.type)).join('')}
    </ul>
    ${pagination}
  `)
}

/**
 * Renders the release page
 *
 * @param {Object} data - Discogs Release data entity
 * @returns {String}
 */
export function release(data) {
  const { artists, tracklist, title, images } = data

  return trim(`
    <h2 class="h2">${title}</h2>
    <p>By ${explodeArtists(artists)}</p>
    <div>
      <img src="${images[0].resource_url}" class="artwork" />
    </div>
    <h3>Tracklist</h3>
    <ol>
        ${tracklist.map(item => `<li>${item.title}</a>`).join('')}
    </ol>
  `)
}

/**
 * Renders the offline page
 */
export function offline() {
  return trim(
    `<p>Unfotunately this page is not available offline. Best go spin some vinyl...</p>
      <div>
          </div><img src="${offlineImg}" class="artwork" />
      </div>
      `
  )
}

/**
 * Renders the 404 page
 */
export function page404() {
  return trim(
    `<p>Oh noes, the page you're looking for doesn't exist! Try looking later...</p>
      <div>
          </div><img src="${fourOhFourImg}" class="artwork" />
      </div>
      `
  )
}

/**
 * Renders the 500 page
 */
export function page500() {
  return trim(
    `<p>Server hiccup. Nothing to see here...</p>
      <div>
          </div><img src="${fiveOhOhImg}" class="artwork" />
      </div>
      `
  )
}
