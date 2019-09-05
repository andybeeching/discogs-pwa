export function artistsSearchResults(data) {
  return `<ul>
        ${data.results
          .map(item => `<li><a href="/artist/${item.id}">${item.title}</a>`)
          .join('')}
    </ul>`
}

export function artist(data) {
  return `<p>${data.profile}</p>`
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

  return `<ul>
        ${releases
          .map(
            item =>
              `<li>
                <a data-year="${item.year}" href="/release/${item.id}">${item.title}</a>
                <img src="${item.thumb}" />
               </li>`
          )
          .join('')}
    </ul>`
}

export function release(data) {
  const { artists, tracklist, title, images } = data

  return `<p>${title}</p>
    <p>By ${artists
      .map((item, idx, arr) => {
        const isLast = arr[idx + 1] === undefined
        const leadingChars = idx > 0 && isLast ? 'and ' : ''
        const trailingChars = !isLast && !leadingChars ? ', ' : ''

        return `${leadingChars}<a href="/artist/${item.id}">${item.name}</a>${trailingChars}`
      })
      .join('')}
    </p>
    <div>
      <img src="${images[0].resource_url}" />
    </div>
    <ol>
        ${tracklist.map(item => `<li>${item.title}</a>`).join('')}
    </ol>`
}
