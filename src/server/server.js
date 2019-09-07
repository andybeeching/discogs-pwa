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

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
const compiler = webpack(config)

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  })
)

app.use(webpackHotMiddleware(compiler))

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

// TODO: redirect initial results to page 1
app.get('/search', async (req, res) => {
  res.write(head + nav)

  const { q: query, page = '1' } = req.query
  const data = await requestData(urls.getArtistSearch(query, page))

  if (data) {
    res.write(templates.artistsSearchResults(data, query))
  }

  res.write(foot)
  res.end()
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`)
  console.log('Press Ctrl+C to quit.')
})
