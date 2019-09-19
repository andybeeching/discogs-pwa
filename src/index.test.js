import * as constants from './lib/constants'

// mock the service worker import
jest.mock('serviceworker-webpack-plugin/lib/runtime', () => jest.fn())

describe('index.js - in DOM', () => {
  let App = null

  beforeEach(() => {
    // Bill and Ted style time control... excellent!
    jest.useFakeTimers()
    require('./index')
    App = window.App
  })

  afterEach(() => {
    jest.clearAllTimers()
    App.isAppLoaded = false
  })

  describe('loader', () => {
    it('should NOT be displayed if the page content loads instantly from cache', () => {
      // default state of Loader in HTML - hidden (visibility: none)
      document.body.innerHTML = '<div class="loader is-hidden"></div>'
      App.showLoader()

      // exercise
      // simulate window 'load' event (proxy for content loaded)
      // by directly invoking the assigned handler, 'hideLoader()'
      App.hideLoader()

      // assert that loader is hidden
      const loaderEl = document.querySelector(constants.LOADER_SELECTOR)
      expect(loaderEl.classList.contains(constants.IS_SHOWN)).not.toBe(true)
      expect(loaderEl.classList.contains(constants.IS_LOADED)).toBe(true)
      expect(loaderEl.classList.contains(constants.IS_HIDDEN)).toBe(true)
    })

    it('should NOT be displayed if the page content loads quickly over network', () => {
      // default state of Loader in HTML - hidden (visibility: none)
      document.body.innerHTML = '<div class="loader is-hidden"></div>'
      App.showLoader()

      // exercise
      // simulate short delay while content loads...
      jest.advanceTimersByTime(constants.LOADER_DELAY / 2)
      // simulate window 'load' event (proxy for content loaded)
      // by directly invoking the assigned handler, 'hideLoader()'
      App.hideLoader()

      // assert that loader is hidden
      const loaderEl = document.querySelector(constants.LOADER_SELECTOR)
      expect(loaderEl.classList.contains(constants.IS_SHOWN)).not.toBe(true)
      expect(loaderEl.classList.contains(constants.IS_LOADED)).toBe(true)
      expect(loaderEl.classList.contains(constants.IS_HIDDEN)).toBe(true)
    })

    it('should be displayed if the page content do not load quickly', () => {
      // default state of Loader in HTML - hidden (visibility: none)
      document.body.innerHTML = '<div class="loader is-hidden"></div>'
      App.showLoader()

      // exercise
      // simulate delay while content loads...
      jest.advanceTimersByTime(constants.LOADER_DELAY)

      // assert that loader is shown
      const loaderEl = document.querySelector(constants.LOADER_SELECTOR)
      expect(loaderEl.classList.contains(constants.IS_SHOWN)).toBe(true)
      expect(loaderEl.classList.contains(constants.IS_HIDDEN)).not.toBe(true)
    })

    it('should be dismissed when slow loading content finally loads', () => {
      // default state of Loader in HTML - hidden (visibility: none)
      document.body.innerHTML = '<div class="loader is-hidden"></div>'
      App.showLoader()

      // exercise
      // simulate delay while content loads...
      jest.advanceTimersByTime(constants.LOADER_DELAY)
      // simulate window 'load' event (proxy for content loaded)
      // by directly invoking the assigned handler, 'hideLoader()'
      App.hideLoader()

      // assert that loader is dismissed
      // NOTE: jsDOM cannot trigger 'transitionend' events, so can't assert
      // loader is completely hidden
      const loaderEl = document.querySelector(constants.LOADER_SELECTOR)
      expect(loaderEl.classList.contains(constants.IS_LOADED)).toBe(true)
    })
  })

  describe('Offline toast notification', () => {
    it('should NOT be displayed on page load regardless if online or offline', () => {
      // default state of Loader in HTML - hidden (visibility: none)
      document.body.innerHTML =
        '<div class="toast"><span class="toast-msg"></span></div>'

      // exercise
      // simulate window 'online' event
      App.onlineHandler()

      // assert that loader is hidden
      const toastEl = document.querySelector(constants.TOAST_SELECTOR)
      expect(toastEl.classList.contains(constants.IS_SHOWN)).not.toBe(true)
    })

    it('should be displayed on when the page goes offline', () => {
      // default state of Loader in HTML - hidden (visibility: none)
      document.body.innerHTML =
        '<div class="toast"><span class="toast-msg"></span></div>'

      // exercise
      // simulate window 'offline' event
      App.offlineHandler()

      // assert that loader is hidden
      const toastEl = document.querySelector(constants.TOAST_SELECTOR)
      expect(toastEl.classList.contains(constants.IS_SHOWN)).toBe(true)
    })
  })
})
