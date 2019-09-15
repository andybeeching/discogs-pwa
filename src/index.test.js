import * as constants from './lib/constants'

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
    expect(loaderEl.classList.contains(constants.LOADER_SHOWN)).not.toBe(true)
    expect(loaderEl.classList.contains(constants.LOADER_LOADED)).toBe(true)
    expect(loaderEl.classList.contains(constants.LOADER_HIDDEN)).toBe(true)
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
    expect(loaderEl.classList.contains(constants.LOADER_SHOWN)).not.toBe(true)
    expect(loaderEl.classList.contains(constants.LOADER_LOADED)).toBe(true)
    expect(loaderEl.classList.contains(constants.LOADER_HIDDEN)).toBe(true)
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
    expect(loaderEl.classList.contains(constants.LOADER_SHOWN)).toBe(true)
    expect(loaderEl.classList.contains(constants.LOADER_HIDDEN)).not.toBe(true)
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
    expect(loaderEl.classList.contains(constants.LOADER_LOADED)).toBe(true)
  })
})
