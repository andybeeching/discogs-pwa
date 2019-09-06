export function artistsSearchResults(data) {
  return `
    <ul class="grid">
      ${data.results.map(item => getGridItem(item, 'artist')).join('')}
    </ul>
  `
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
