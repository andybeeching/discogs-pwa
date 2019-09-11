import requestData, { clearCache } from '../apiClient'

import nock from 'nock'

describe('apiClient', () => {
  const API = 'https://api'
  const ENDPOINT = '/endpoint'

  beforeAll(() => {
    if (!nock.isActive()) {
      nock.activate()
    }
  })

  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()

    // clear cache so as not to pollute across test cases
    clearCache()
  })

  afterAll(() => {
    nock.restore()
  })

  it('should return data when a successful response from Discogs API', async () => {
    const payload = { data: 'hello world' }
    const scope = nock(API)
      .get(ENDPOINT)
      .reply(200, payload)

    const data = await requestData(`${API}${ENDPOINT}`)
    expect(scope.isDone()).toBe(true)
    expect(data).toEqual(payload)
  })

  it('should return cached data on subsequent requests', async () => {
    const payload = { data: 'hello world' }
    const scope = nock(API)
      .get(ENDPOINT)
      .once()
      .reply(200, payload)

    // exercise to warm process LRU cache
    await requestData(`${API}${ENDPOINT}`)

    const data = await requestData(`${API}${ENDPOINT}`)
    expect(scope.isDone()).toBe(true)
    expect(data).toEqual(payload)
  })
})
