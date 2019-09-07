export function artistsSearchResults(data, query) {
  const resultRange = getResultRange(data.pagination)
  const pagination = getPagination(data.pagination, query)

  return `
    ${query ? `<h2>Search results for "${query}"</h2>` : ''}
    ${resultRange}
    ${pagination}
    <ul class="grid">
      ${data.results.map(item => getGridItem(item, 'artist')).join('')}
    </ul>
    ${pagination}
  `
}

// search results subline with ranges
export function getResultRange(pagination) {
  const { items, page, pages, per_page: perPage } = pagination
  const startRange = (page - 1) * perPage + 1
  const endRange = page === pages ? items : page * perPage

  return `
    <p>${pagination.items} results were found, viewing ${startRange} to ${endRange}</p>
  `
}

// pagination links
export function getPagination(pagination, query) {
  const { page, pages } = pagination

  return pages > 1
    ? `
    <ol class="pagination">
      <li>
        ${
          page === 1
            ? `<span class="disabled-link">&laquo;</span>`
            : `<a href="/search?q=${encodeURIComponent(
                query
              )}&page=1">&laquo;</a>`
        }
      </li>
      <li>
        ${
          page === 1
            ? `<span class="disabled-link">Previous page</span>`
            : `<a href="/search?q=${encodeURIComponent(
                query
              )}&page=${pagination.page - 1}">Previous page</a>`
        }
      </li>
      <li>
        ${
          page === pages
            ? `<span class="disabled-link">Next page</span>`
            : `<a href="/search?q=${encodeURIComponent(
                query
              )}&page=${pagination.page + 1}">Next page</a>`
        }
      </li>
      <li>
        ${
          page === pages
            ? `<span class="disabled-link">&raquo;</span>`
            : `<a href="/search?q=${encodeURIComponent(
                query
              )}&page=${pages}">&raquo;</a>`
        }
      </li>
    </ol>
  `
    : ''
}

export function getGridItem(item, endpoint) {
  return `
    <li class="grid-item">
      <a href="/${endpoint}/${item.id}">
        <img src="${item.thumb}" />
        <span class="desc">${item.title}</span>
      </a>
    </li>
  `
}

export function explodeArtists(artists) {
  return artists
    .map((item, idx, arr) => {
      const isLast = arr[idx + 1] === undefined
      const leadingChars = idx > 0 && isLast ? 'and ' : ''
      const trailingChars = !isLast && !leadingChars ? ', ' : ''

      return `${leadingChars}<a href="/artist/${item.id}">${item.name}</a>${trailingChars}`
    })
    .join('')
}

export function artist(data) {
  return `
    <h2>${data.name}</h2>
    <p>${data.profile}</p>
    ${data.members ? `<p>Members: ${explodeArtists(data.members)}</p>` : ''}
    <h3>Releases</h2>
  `
}

export function releaseList(data) {
  // filter releases to major releases by artist (with or without collaborators)
  // sort by latest release
  const releases = data.releases
    .filter(
      item =>
        item.type === 'master' &&
        item.artist !== 'Various' &&
        item.role === 'Main'
    )
    .sort((a, b) => {
      return b.year - a.year
    })

  return `
    <ul class="grid">
      ${releases.map(item => getGridItem(item, 'release')).join('')}
    </ul>
  `
}

export function release(data) {
  const { artists, tracklist, title, images } = data

  return `
    <h2>${title}</h2>
    <p>By ${explodeArtists(artists)}</p>
    <div>
      <img src="${images[0].resource_url}" />
    </div>
    <h3>Tracklist</h3>
    <ol>
        ${tracklist.map(item => `<li>${item.title}</a>`).join('')}
    </ol>
  `
}
