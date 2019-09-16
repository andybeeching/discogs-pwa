import request from 'supertest'
import server from './server.js'
import nock from 'nock'
import { clearCache } from '../lib/apiClient'

import NO_SEARCH_RESULT_STUB from '../../__mocks__/stubs/searchNoResult.json'
import SEARCH_RESULT_STUB from '../../__mocks__/stubs/searchResult.json'
import ARTIST_STUB from '../../__mocks__/stubs/artist.json'
import ARTIST_404_STUB from '../../__mocks__/stubs/artist404.json'
import RELEASE_STUB from '../../__mocks__/stubs/release.json'
import RELEASE_404_STUB from '../../__mocks__/stubs/release404.json'
import RELEASE_LIST_STUB from '../../__mocks__/stubs/releaseList.json'
import RELEASE_LIST_404_STUB from '../../__mocks__/stubs/releaseList404.json'

// not ideal mocking, but works
jest.mock('raw-loader!../partials/head.html', () => '<head></head>', {
  virtual: true
})
jest.mock('raw-loader!../partials/nav.html', () => '<nav></nav>', {
  virtual: true
})
jest.mock('raw-loader!../partials/foot.html', () => '<footer></footer>', {
  virtual: true
})

describe('server.js', () => {
  const API = 'https://api.discogs.com'

  beforeAll(() => {
    if (!nock.isActive()) {
      nock.activate()
    }
  })

  beforeEach(() => {
    // nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
    // nock.enableNetConnect()

    // clear cache so as not to pollute across test cases
    clearCache()
  })

  afterAll(() => {
    nock.restore()
  })

  describe('GET /unknown', () => {
    it('responds with html of the 404 page', async () => {
      await request(server)
        .get('/unknown')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(404)
    })
  })

  describe('GET /', () => {
    it('responds with html of the homepage', async () => {
      await request(server)
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200)
    })
  })

  describe('GET /artist', () => {
    it('redirects non-paginated requests to URL for first page', async () => {
      await request(server)
        .get('/artist/1')
        .expect(302)
    })

    it('responds with "unknown artist" page for unknown IDs', async () => {
      // mock Discogs API
      nock(API)
        .get(/artists/)
        .reply(200, ARTIST_404_STUB)
        .get(/releases/)
        .reply(200, RELEASE_LIST_404_STUB)

      await request(server)
        .get('/artist/123456789?page=1')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200)
    })

    it('responds with artist page', async () => {
      // mock Discogs API
      nock(API)
        .get(/artists/)
        .reply(200, ARTIST_STUB)
        .get(/releases/)
        .reply(200, RELEASE_LIST_STUB)

      await request(server)
        .get('/artist/1?page=1')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200)
    })
  })

  describe('GET /release', () => {
    it('responds with "unknown release" page for unknown IDs', async () => {
      // mock Discogs API
      nock(API)
        .get(/masters/)
        .reply(200, RELEASE_404_STUB)

      await request(server)
        .get('/release/123456789')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200)
    })
    it('responds with release page', async () => {
      // mock Discogs API
      nock(API)
        .get(/masters/)
        .reply(200, RELEASE_STUB)

      await request(server)
        .get('/release/1')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200)
    })
  })

  describe('GET /search', () => {
    it('redirects non-paginated requests to URL for first page', async () => {
      await request(server)
        .get('/search?q=Beatles')
        .expect(302)
    })

    it('responds with no search results page', async () => {
      // mock Discogs API
      nock(API)
        .get(/database/)
        .reply(200, NO_SEARCH_RESULT_STUB)

      await request(server)
        .get('/search?q=Unknown&page=1')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200)
    })

    it('responds with search results page', async () => {
      // mock Discogs API
      nock(API)
        .get(/database/)
        .reply(200, SEARCH_RESULT_STUB)

      await request(server)
        .get('/search?q=Beatles&page=1')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200)
    })
  })
})
