import express from 'express'
import { sanitizeBody } from 'express-validator'
import stats from '../../dist/stats.json'
import requestData from '../lib/apiClient.js'
import * as templates from '../lib/templates.js'
import * as urls from '../lib/urls.js'
import head from 'raw-loader!../partials/head.html'
import nav from 'raw-loader!../partials/nav.html'
import foot from 'raw-loader!../partials/foot.html'

export default (env = 'production') => {
  let header = head
  // asset URL rewriting
  // - replace hydrated CSS and JS with latest build
  // - inject reference to fingerprinted manifest file
  // - replace iOS touch icon with latest built version
  if (env === 'production') {
    const { main } = stats.assetsByChunkName
    header = head.replace('main.css', main[0]).replace('main.js', main[1])

    const manifest = stats.assets.find(item => /manifest/.test(item.name)).name
    header = header.replace('manifest.json', manifest)

    const touchIcon = stats.assets.find(item => /icon_152x152/.test(item.name))
      .name
    header = header.replace('icon_152x152', touchIcon)
  }

  const router = express.Router()

  // ROUTES
  router.get('/robots.txt', function(req, res) {
    res.type('text/plain')
    res.send('User-agent: *\nDisallow: /')
  })

  // home page
  router.get('/', async (req, res) => {
    res.type('.html').write(header + nav)

    const data = await requestData(urls.getRoot())

    // return "Discogs down error"
    if (data === null) {
      res.write('Oh noes, it looks like Discogs is down :-(')
    } else {
      res.write(templates.root(data))
    }

    res.write(foot)
    res.end()
  })

  // artist page
  router.get(
    ['/artist/:artistId', '/artist/:artistId/page/'],
    async (req, res, next) => {
      const { artistId } = req.params
      res.redirect(`/artist/${artistId}/page/1`)
    }
  )

  router.get('/artist/:artistId/page/:pageId', async (req, res, next) => {
    const { artistId, pageId } = req.params

    res.type('.html').write(header + nav)

    // issue requests in parallel
    const artistReq = requestData(urls.getArtist(artistId))
    const releaseReq = requestData(urls.getArtistReleases(artistId, pageId))
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

  // master page
  router.get('/master/:masterId', async (req, res) => {
    res.type('.html').write(header + nav)

    const data = await requestData(urls.getMaster(req.params.masterId))

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

  // release page
  router.get('/release/:releaseId', async (req, res) => {
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
  router.post(
    '/search',
    [
      sanitizeBody('query')
        .trim()
        .escape()
    ],
    (req, res) => {
      const { query } = req.body

      res.redirect(`/search/${query}/page/1`)
      res.end()
    }
  )

  // search page
  router.get(
    ['/search:query', '/search/:query/', '/search/:query/page/'],
    async (req, res, next) => {
      const { query } = req.params
      res.redirect(`/search/${query}/page/1`)
    }
  )

  router.get('/search/:query/page/:pageId', async (req, res) => {
    const { query, pageId } = req.params

    res.type('.html').write(header + nav)

    const data = await requestData(urls.getArtistSearch(query, pageId))

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
  router.use((req, res) => {
    res
      .status(404)
      .type('.html')
      .write(header + nav)
    res.write("Oh noes, the page you're looking for doesn't exist!")
    res.write(foot)
    res.end()
  })

  // 5xx
  router.use((err, req, res) => {
    res
      .status(500)
      .type('.html')
      .write(header + nav)

    res.write('Server hiccup: ' + JSON.stringify({ error: err }))
    res.write(foot)
    res.end()
  })

  return router
}
