import spdy from 'spdy'
import fs from 'fs'
import express from 'express'
import serveStatic from 'serve-static'
import stats from '../../dist/stats.json'

import requestData from '../lib/apiClient.js'
import * as templates from '../lib/templates.js'
import * as urls from '../lib/urls.js'
import head from 'raw-loader!../partials/head.html'
import nav from 'raw-loader!../partials/nav.html'
import foot from 'raw-loader!../partials/foot.html'

// development tools
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../../webpack.dev.config'

const app = express()

// caching rules for statics
app.use(
  serveStatic(__dirname, {
    maxAge: 31536000,
    immutable: true
  })
)

// caching rules for page responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'max-age=604800, must-revalidate')
  next()
})

// configure server for DEV vs PRODUCTION
let header = head
if (app.get('env') === 'development') {
  console.log('DEVELOPMENT SERVER')

  app.use((req, res, next) => {
    console.log('request: ', req.url)
    next()
  })

  // tell express to use the webpack-dev-middleware and use the webpack.config.js
  // configuration file as a base.
  const compiler = webpack(config)

  // enable HMR
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath
    })
  )

  app.use(webpackHotMiddleware(compiler))
} else {
  // asset URL rewriting
  // - replace hydrated CSS and JS with latest build
  const { main } = stats.assetsByChunkName
  header = head.replace('main.css', main[0]).replace('main.js', main[1])
}

app.get('/robots.txt', function(req, res) {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

// home page
app.get('/', async (req, res) => {
  res.type('.html').write(header + nav)
  res.write('Home Page')
  res.write(foot)
  res.end()
})

// artist page
app.get('/artist/:artistId', async (req, res, next) => {
  const { artistId } = req.params
  const { page = null } = req.query

  // cool URIs
  if (!page) {
    res.redirect(`/artist/${artistId}?page=1`)
    return
  }

  res.type('.html').write(header + nav)

  // issue requests in parallel
  const artistReq = requestData(urls.getArtist(artistId))
  const releaseReq = requestData(urls.getArtistReleases(artistId, page))
  const [artistData, releaseData] = await Promise.all([artistReq, releaseReq])

  // return "Discogs down error"
  if (artistData === null || releaseData === null) {
    res.write('Oh noes, it looks like Discogs is down :-(')
  }
  // return "unknown artist error" if negative Discogs lookup
  else if (
    Object.keys(artistData).length === 1 ||
    Object.keys(releaseData).length === 1
  ) {
    res.write("Oh noes, this artist doesn't exist :-(")
  } else {
    res.write(templates.artist(artistData))
    res.write(templates.releaseList(releaseData, artistId))
  }

  res.write(foot)
  res.end()
})

// release page
app.get('/release/:releaseId', async (req, res) => {
  res.type('.html').write(header + nav)

  const data = await requestData(urls.getRelease(req.params.releaseId))

  // return "Discogs down error"
  if (data === null) {
    res.write('Oh noes, it looks like Discogs is down :-(')
  }
  // return "unknown release error" if negative Discogs lookup
  else if (Object.keys(data).length === 1) {
    res.write("Oh noes, this release doesn't exist :-(")
  } else {
    res.write(templates.release(data))
  }

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

  res.type('.html').write(header + nav)

  const data = await requestData(urls.getArtistSearch(query, page))

  // return "Discogs down error"
  if (data === null) {
    res.write('Oh noes, it looks like Discogs is down :-(')
  } else {
    res.write(templates.artistsSearchResults(data, query))
  }

  res.write(foot)
  res.end()
})

// 404
app.use((req, res) => {
  res
    .status(404)
    .type('.html')
    .write(header + nav)
  res.write("Oh noes, the page you're looking for doesn't exist!")
  res.write(foot)
  res.end()
})

// 5xx
app.use(function(err, req, res) {
  res
    .status(500)
    .type('.html')
    .write(header + nav)

  res.write('Server hiccup: ' + JSON.stringify({ error: err }))
  res.write(foot)
  res.end()
})

// enable SSL
const sslDir = process.cwd()
const spdyServer = spdy.createServer(
  {
    key: fs.readFileSync(`${sslDir}/${process.env.SSL_KEY}`),
    cert: fs.readFileSync(`${sslDir}/${process.env.SSL_CERT}`)
  },
  app
)

// spin up server
const PORT = process.env.PORT || 8080
spdyServer.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`)
  console.log('Press Ctrl+C to quit.')
})

export default app
