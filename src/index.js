import 'normalize.css'
import * as constants from './lib/constants'
import './css/style.css'

console.log('HMR still works')

if (module.hot) {
  module.hot.accept() // eslint-disable-line no-undef
}

window.App = (function() {
  let loaderTimerId

  // delay showing loader in case content is rendered quickly
  // - hiding by default aids non-JS browsing
  const showLoader = () => {
    loaderTimerId = setTimeout(() => {
      const loader = document.querySelector(constants.LOADER_SELECTOR)

      loader.classList.replace(constants.LOADER_HIDDEN, constants.LOADER_SHOWN)
    }, 200)
  }

  // must be 'load' as 'DOMContentLoaded' fires too soon
  window.addEventListener('load', evt => {
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
  })

  return {
    showLoader,
    isAppLoaded: false
  }
})()
