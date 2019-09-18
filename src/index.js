import 'normalize.css'
import * as constants from './lib/constants'
import './css/base.css'
import './css/typography.css'
import './css/loader.css'
import './css/style.css'
import runtime from 'serviceworker-webpack-plugin/lib/runtime'

if (module.hot) {
  module.hot.accept() // eslint-disable-line no-undef
} else {
  // register service worker
  if ('serviceWorker' in navigator) {
    runtime.register()
  }
}

const createApp = () => {
  let loaderTimerId

  // delay showing loader in case content is rendered quickly
  // - hiding by default aids non-JS browsing
  const showLoader = () => {
    loaderTimerId = setTimeout(() => {
      const loader = document.querySelector(constants.LOADER_SELECTOR)

      loader.classList.replace(constants.LOADER_HIDDEN, constants.LOADER_SHOWN)
    }, constants.LOADER_DELAY)
  }

  const hideLoader = () => {
    window.App.isAppLoaded = true
    clearTimeout(loaderTimerId)

    const loader = document.querySelector(constants.LOADER_SELECTOR)

    if (loader.classList.contains(constants.LOADER_SHOWN)) {
      loader.addEventListener('transitionend', () =>
        loader.classList.replace(
          constants.LOADER_SHOWN,
          constants.LOADER_HIDDEN
        )
      )
    }
    loader.classList.add(constants.LOADER_LOADED)
  }

  // must be 'load' as 'DOMContentLoaded' fires too soon
  window.addEventListener('load', hideLoader)

  return {
    showLoader,
    hideLoader,
    isAppLoaded: false
  }
}

window.App = createApp()
export default createApp
