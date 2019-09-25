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
}

// register service worker
if ('serviceWorker' in navigator && runtime && runtime.register) {
  window.addEventListener('load', () => {
    runtime.register()
  })
}

/**
 * Factory for App object which controls the page loader logic
 * and offline/online handler
 *
 * @return {Object}
 */
const createApp = () => {
  let loaderTimerId

  /**
   * Displays the pan-viewport loader
   *
   * @note the appearance of the loader is briefly delayed in the
   *       event that the contents are rendered quickly
   */
  const showLoader = () => {
    loaderTimerId = setTimeout(() => {
      const loader = document.querySelector(constants.LOADER_SELECTOR)

      loader.classList.replace(constants.IS_HIDDEN, constants.IS_SHOWN)
    }, constants.LOADER_DELAY)
  }

  /**
   * Dismisses the pan-viewport loader
   */
  const hideLoader = () => {
    window.App.isAppLoaded = true
    clearTimeout(loaderTimerId)

    const loader = document.querySelector(constants.LOADER_SELECTOR)

    if (loader.classList.contains(constants.IS_SHOWN)) {
      loader.classList.add(constants.IS_LOADED)

      loader.addEventListener('transitionend', () => {
        loader.classList.replace(constants.IS_SHOWN, constants.IS_HIDDEN)
        loader.classList.remove(constants.IS_LOADED)
      })
    }
  }

  /**
   * Displays the offline toast notification
   */
  const showOfflineNotification = () => {
    const toast = document.querySelector(constants.TOAST_SELECTOR)
    toast.classList.add(constants.IS_SHOWN)

    setTimeout(() => {
      toast.classList.remove(constants.IS_SHOWN)
    }, constants.TOAST_DURATION)
  }

  /**
   * Dismisses the offline toast notification
   */
  const hideOfflineNotification = () => {
    const toast = document.querySelector(constants.TOAST_SELECTOR)
    toast.classList.remove(constants.IS_SHOWN)
  }

  /**
   * Event delegate to intercept internal anchors and initiate a partial
   * page update from the server
   *
   * @param {String} url - the string to fetch
   * @param {Object} config - config object with 'replace' flag. This determines
   *                         whether next state is pushed|replaced on history stack
   */
  const fetchPartial = async (url, config = {}) => {
    showLoader()

    try {
      const { replace = false, data = false, nextUrl = url } = config
      const opts = { ...(data && { method: 'POST', body: data }) }

      const res = await fetch(url, opts)
      const html = await res.text()

      // Parse and extract page contents
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const content = doc.querySelector(constants.CONTENT_SELECTOR)

      // replace
      const target = document.querySelector(constants.CONTENT_SELECTOR)
      target.parentNode.replaceChild(content, target)

      // navigate away
      if (replace) {
        history.replaceState(null, null, nextUrl)
      } else {
        history.pushState(null, null, nextUrl)
      }
      hideLoader()
    } catch (err) {
      // window.location.href = '/offline'
      console.log(err)
      hideLoader()
    }
  }

  /**
   * Event delegate to intercept internal anchors and initiate a partial
   * page update from the server
   *
   * @param {Object} evt - passed by browser
   */
  const anchorDelegate = evt => {
    let node = evt.target

    while (node !== undefined && node !== null && node.localName !== 'a') {
      node = node.parentNode
    }

    if (
      node !== undefined &&
      node !== null &&
      node.getAttribute(constants.EXTERNAL_LINK_ATTR) !==
        constants.EXTERNAL_LINK_ATTR_VAL
    ) {
      fetchPartial(node.href)
      evt.preventDefault()
      return false
    }

    return true
  }

  /**
   * Handler for search form
   *
   * @note a corresponding search URL is generated to redirect the user
   *       this is so search results all ohave a unique URL corresponding
   *       to the search query
   */
  const formDelegate = evt => {
    evt.preventDefault()

    const formEl = document.querySelector(constants.SEARCH_FORM_SELECTOR)
    const data = new URLSearchParams(new FormData(formEl))
    const query = data.get(constants.SEARCH_QUERY_NAME)
    const nextUrl = `${constants.SEARCH_ENDPOINT}/${encodeURIComponent(
      query
    )}/${constants.SEARCH_TRAILING_SLUG}`

    fetchPartial(constants.SEARCH_ENDPOINT, { data, nextUrl })

    document.querySelector(constants.SEARCH_INPUT_SELECTOR).value = ''
  }

  /**
   * Handler for 'popstate' event
   *
   * @param {Object} evt - passed by browser
   * @note Replace the current page in history so as not to increase
   * the size of the history stack
   */
  const popstateHandler = evt => {
    fetchPartial(window.location.pathname, {
      replace: true
    })
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

  // history navigation
  document.addEventListener('click', anchorDelegate)
  document.addEventListener('submit', formDelegate)
  window.addEventListener('popstate', popstateHandler)

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
