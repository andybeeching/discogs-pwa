import 'normalize.css'
import * as constants from './lib/constants'
import './css/base.css'
import './css/typography.css'
import './css/loader.css'
import './css/toast.css'
import './css/style.css'
import runtime from 'serviceworker-webpack-plugin/lib/runtime'

if (module.hot) {
  module.hot.accept() // eslint-disable-line no-undef
} else {
  // register service worker
  if ('serviceWorker' in navigator && !!runtime.register) {
    window.addEventListener('load', runtime.register)
  }
}

const createApp = () => {
  let loaderTimerId

  // delay showing loader in case content is rendered quickly
  // - hiding by default aids non-JS browsing
  const showLoader = () => {
    loaderTimerId = setTimeout(() => {
      const loader = document.querySelector(constants.LOADER_SELECTOR)

      loader.classList.replace(constants.IS_HIDDEN, constants.IS_SHOWN)
    }, constants.LOADER_DELAY)
  }

  const hideLoader = () => {
    window.App.isAppLoaded = true
    clearTimeout(loaderTimerId)

    const loader = document.querySelector(constants.LOADER_SELECTOR)

    if (loader.classList.contains(constants.IS_SHOWN)) {
      loader.addEventListener('transitionend', () =>
        loader.classList.replace(constants.IS_SHOWN, constants.IS_HIDDEN)
      )
    }
    loader.classList.add(constants.IS_LOADED)
  }

  const showOfflineNotification = () => {
    const toast = document.querySelector(constants.TOAST_SELECTOR)
    toast.classList.add(constants.IS_SHOWN)

    setTimeout(() => {
      toast.classList.remove(constants.IS_SHOWN)
    }, constants.TOAST_DURATION)
  }

  const hideOfflineNotification = () => {
    const toast = document.querySelector(constants.TOAST_SELECTOR)
    toast.classList.remove(constants.IS_SHOWN)
  }

  const onlineHandler = () => {
    hideOfflineNotification()
  }

  const offlineHandler = () => {
    showOfflineNotification()
  }

  // must be 'load' as 'DOMContentLoaded' fires too soon
  window.addEventListener('load', hideLoader)

  // offline indicator
  window.addEventListener('online', onlineHandler)
  window.addEventListener('offline', offlineHandler)

  return {
    onlineHandler,
    offlineHandler,
    showLoader,
    hideLoader,
    isAppLoaded: false
  }
}

window.App = createApp()
export default createApp
