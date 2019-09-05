import express from 'express'
import * as templates from '../lib/templates.js'
import * as urls from '../lib/urls.js'

import head from 'raw-loader!../partials/head.html'
import nav from 'raw-loader!../partials/nav.html'
import foot from 'raw-loader!../partials/foot.html'

// temporary data stubs
import searchResultStub from '../../__mocks__/stubs/searchResult.json'
import releaseListResStub from '../../__mocks__/stubs/releaseList.json'
import artistResStub from '../../__mocks__/stubs/artist.json'
import releaseResStub from '../../__mocks__/stubs/release.json'

const app = express()

// basic API client

async function apiClient(url) {
  let data

  // stubbed API response
  if (/database/.test(url)) {
    data = searchResultStub
  } else if (/releases/.test(url)) {
    data = releaseListResStub
  } else if (/artists/.test(url)) {
    data = artistResStub
  } else if (/masters/.test(url)) {
    data = releaseResStub
  }

  return data || url

  // fetch('https://example.com')
  // .then(response => response.json())
  // .then(data => {
  //   console.log(data)
  // })
  // .catch(err => ...)
}

// TODO: Implement cache lookup
async function requestData(url) {
  const res = await apiClient(url)
  return res
}

app.get('/', async (req, res) => {
  res.write(head + nav)
  res.write('Home Page')
  res.write(foot)
  res.end()
})

app.get('/artist/:artistId', async (req, res) => {
  const { artistId } = req.params

  res.write(head + nav)

  const artistData = await requestData(urls.getArtist(artistId))
  const releaseData = await requestData(urls.getArtistReleases(artistId))

  res.write(templates.artist(artistData))
  res.write(templates.releaseList(releaseData))
  res.write(foot)
  res.end()
})

app.get('/release/:releaseId', async (req, res) => {
  res.write(head + nav)
  const data = await requestData(urls.getRelease(req.params.releaseId))
  res.write(templates.release(data))
  res.write(foot)
  res.end()
})

app.get('/search', async (req, res) => {
  res.write(head + nav)
  const data = await requestData(urls.getArtistSearch(req.query.q))

  if (data) {
    res.write(templates.artistsSearchResults(data))
  }

  res.write(foot)
  res.end()
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`)
  console.log('Press Ctrl+C to quit.')
})
