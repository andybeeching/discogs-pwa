import express from 'express'
import serveStatic from 'serve-static'
import compression from 'compression'
import helmet from 'helmet'

export default app => {
  app.use(express.static(__dirname))
  // if (app.get('env') === 'development') {
  //   // map statics - no caching
  //   app.use(express.static(__dirname))
  // } else {
  //   // map statics and apply caching
  //   app.use(
  //     serveStatic(__dirname, {
  //       maxAge: 31536000,
  //       immutable: true
  //     })
  //   )

  //   // caching rules for page responses
  //   app.use((req, res, next) => {
  //     res.set('Cache-Control', 'max-age=604800, must-revalidate')
  //     next()
  //   })
  // }

  // gzip compression
  // - static assets are too small to benefit from Brotli
  app.use(compression())

  // security
  app.use(helmet())
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        blockAllMixedContent: true,
        upgradeInsecureRequests: true,
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'https://img.discogs.com'],
        objectSrc: ["'none'"]
      }
    })
  )

  // parse POST data
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  return app
}
