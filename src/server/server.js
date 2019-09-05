import express from 'express'
import * as templates from '../lib/templates.js'
import * as urls from '../lib/urls.js'

import head from 'raw-loader!../partials/head.html'
import nav from 'raw-loader!../partials/nav.html'
import foot from 'raw-loader!../partials/foot.html'

const app = express()

async function apiClient(param) {
  return param
}

async function requestData(param) {
  const res = await apiClient(param)
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
  res.write(templates.artist(data))
  res.write(foot)
  res.end()
})

app.get('/search', async (req, res) => {
  res.write(head + nav)
  const data = await requestData(urls.getArtistSearch(req.query.q))
  res.write(templates.artistsSearchResults(data))
  res.write(foot)
  res.end()
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`)
  console.log('Press Ctrl+C to quit.')
})
