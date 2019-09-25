import * as urls from '../urls'

describe('API URLs - urls.js', () => {
  describe('Root Details', () => {
    test('URL contains "hot"', () => {
      expect(urls.getRoot()).toEqual(expect.stringMatching(String('want')))
    })
  })

  describe('Artist Search', () => {
    test('URL contains artist name', () => {
      const artist = 'Beatles'

      expect(urls.getArtistSearch(artist)).toEqual(
        expect.stringMatching(artist)
      )
    })

    test('URL encodes artist name', () => {
      const artist = 'The Beatles'
      const encodedArtist = 'The%20Beatles'

      expect(urls.getArtistSearch(artist)).toEqual(
        expect.stringMatching(encodedArtist)
      )
    })

    test('URL defaults to page 1 of results', () => {
      const artist = 'The Beatles'

      expect(urls.getArtistSearch(artist)).toEqual(
        expect.stringMatching('page=1')
      )
    })
  })

  describe('Artist Details', () => {
    test('URL contains artist ID', () => {
      const artistId = 1234

      expect(urls.getArtist(artistId)).toEqual(
        expect.stringMatching(String(artistId))
      )
    })
  })

  describe('Artist Releases', () => {
    test('URL contains artist ID', () => {
      const artistId = 1234

      expect(urls.getArtistReleases(artistId)).toEqual(
        expect.stringMatching(String(artistId))
      )
    })

    test('URL defaults to page 1 of results', () => {
      const artistId = 1234

      expect(urls.getArtistReleases(artistId)).toEqual(
        expect.stringMatching('page=1')
      )
    })
  })

  describe('Release Details', () => {
    test('URL contains release ID', () => {
      const releaseId = 5678

      expect(urls.getRelease(releaseId)).toEqual(
        expect.stringMatching(String(releaseId))
      )
    })
  })
})
