import spdy from 'spdy'
import fs from 'fs'
import path from 'path'
import express from 'express'
import requestData from '../lib/apiClient.js'
import * as templates from '../lib/templates.js'
import * as urls from '../lib/urls.js'

import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../../webpack.config'

import head from 'raw-loader!../partials/head.html'
import nav from 'raw-loader!../partials/nav.html'
import foot from 'raw-loader!../partials/foot.html'

const app = express()

// statics
app.use(express.static(__dirname))

// tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
const compiler = webpack(config)

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  })
)

app.use(webpackHotMiddleware(compiler))

// home page
app.get('/', async (req, res) => {
  res.write(head + nav)
  res.write('Home Page')
  res.write(foot)
  res.end()
})

// artist page
app.get('/artist/:artistId', async (req, res) => {
  const { artistId } = req.params
  const { page = null } = req.query

  // cool URIs
  if (!page) {
    res.redirect(`/artist/${artistId}?page=1`)
    return
  }

  res.write(head + nav)

  const artistData = await requestData(urls.getArtist(artistId))
  const releaseData = await requestData(urls.getArtistReleases(artistId, page))

  res.write(templates.artist(artistData))
  res.write(templates.releaseList(releaseData, artistId))
  res.write(foot)
  res.end()
})

// release page
app.get('/release/:releaseId', async (req, res) => {
  res.write(head + nav)
  const data = await requestData(urls.getRelease(req.params.releaseId))
  res.write(templates.release(data))
  res.write(foot)
  res.end()
})

// search page
app.get('/search', async (req, res) => {
  const { q: query, page = null } = req.query

  // cool URIs
  if (!page) {
    res.redirect(`/search?q=${query}&page=1`)
    return
  }

  res.write(head + nav)

  const data = await requestData(urls.getArtistSearch(query, page))

  if (data) {
    res.write(templates.artistsSearchResults(data, query))
  }

  res.write(foot)
  res.end()
})

// enable SSL
const baseDir = path.resolve(__dirname, process.env.SSL_PATH)
const spdyServer = spdy.createServer(
  {
    key: fs.readFileSync(`${baseDir}/${process.env.SSL_KEY}`),
    cert: fs.readFileSync(`${baseDir}/${process.env.SSL_CERT}`)
  },
  app
)

// spin up server
const PORT = process.env.PORT || 8080
spdyServer.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`)
  console.log('Press Ctrl+C to quit.')
})
