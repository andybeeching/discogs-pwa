import * as templates from '../templates'

import ROOT_STUB from '../../../__mocks__/stubs/root.json'
import NO_SEARCH_RESULT_STUB from '../../../__mocks__/stubs/searchNoResult.json'
import SEARCH_RESULT_STUB from '../../../__mocks__/stubs/searchResult.json'
import ARTIST_STUB from '../../../__mocks__/stubs/artist.json'
import RELEASE_STUB from '../../../__mocks__/stubs/release.json'
import RELEASE_LIST_STUB from '../../../__mocks__/stubs/releaseList.json'
import PAGINATION_STUB from '../../../__mocks__/stubs/pagination.json'
import MEMBERS_STUB from '../../../__mocks__/stubs/members.json'

describe('templates.js', () => {
  describe('root()', () => {
    it('should render "root" template', () => {
      const renderedTemplate = templates.root(ROOT_STUB)
      expect(renderedTemplate).toMatchSnapshot()
    })
  })

  describe('offline()', () => {
    it('should render offline template', () => {
      const renderedTemplate = templates.offline()
      expect(renderedTemplate).toMatchSnapshot()
    })
  })

  describe('page404()', () => {
    it('should render 404 page template', () => {
      const renderedTemplate = templates.page404()
      expect(renderedTemplate).toMatchSnapshot()
    })
  })

  describe('artistsSearchResults()', () => {
    const SEARCH_TERM = 'The Beatles'

    it('should render "no search results" template', () => {
      const renderedTemplate = templates.artistsSearchResults(
        NO_SEARCH_RESULT_STUB,
        SEARCH_TERM
      )
      expect(renderedTemplate).toMatchSnapshot()
    })

    it('should render "results found" template', () => {
      const renderedTemplate = templates.artistsSearchResults(
        SEARCH_RESULT_STUB,
        SEARCH_TERM
      )
      expect(renderedTemplate).toMatchSnapshot()
    })
  })

  describe('getPagination()', () => {
    const STUB_SLUG = '/endpoint?'

    it('should handle empty pagination object', () => {
      const renderedTemplate = templates.getPagination(
        PAGINATION_STUB['pagination-empty']
      )
      expect(renderedTemplate).toMatchSnapshot()
    })

    it('should handle first page pagination object', () => {
      const renderedTemplate = templates.getPagination(
        PAGINATION_STUB['pagination-first'],
        STUB_SLUG
      )
      expect(renderedTemplate).toMatchSnapshot()
    })

    it('should handle middle page pagination object', () => {
      const renderedTemplate = templates.getPagination(
        PAGINATION_STUB['pagination-middle'],
        STUB_SLUG
      )
      expect(renderedTemplate).toMatchSnapshot()
    })

    it('should handle last page pagination object', () => {
      const renderedTemplate = templates.getPagination(
        PAGINATION_STUB['pagination-last'],
        STUB_SLUG
      )
      expect(renderedTemplate).toMatchSnapshot()
    })
  })

  describe('artist()', () => {
    it('should render "artist" template', () => {
      const renderedTemplate = templates.artist(ARTIST_STUB)
      expect(renderedTemplate).toMatchSnapshot()
    })
  })

  describe('explodeArtists()', () => {
    it('should handle single artist', () => {
      const renderedTemplate = templates.explodeArtists(MEMBERS_STUB.one)
      expect(renderedTemplate).toMatchSnapshot()
    })
    it('should handle two artists', () => {
      const renderedTemplate = templates.explodeArtists(MEMBERS_STUB.two)
      expect(renderedTemplate).toMatchSnapshot()
    })
    it('should handle multiple artists', () => {
      const renderedTemplate = templates.explodeArtists(MEMBERS_STUB.multiple)
      expect(renderedTemplate).toMatchSnapshot()
    })
  })

  describe('releaseList()', () => {
    it('should render "release list" template', () => {
      const renderedTemplate = templates.releaseList(RELEASE_LIST_STUB)
      expect(renderedTemplate).toMatchSnapshot()
    })
  })

  describe('release()', () => {
    it('should render "release" template', () => {
      const renderedTemplate = templates.release(RELEASE_STUB)
      expect(renderedTemplate).toMatchSnapshot()
    })
  })
})
