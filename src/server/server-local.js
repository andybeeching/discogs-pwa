import spdy from 'spdy'
import fs from 'fs'
import app from './server'

// development tools
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../../webpack.dev.config'

if (app.get('env') === 'development') {
  console.log('DEVELOPMENT SERVER')
  // log requested urls
  app.use((req, res, next) => {
    console.log('request: ', req.url)
    next()
  })
  const compiler = webpack(config)
  // enable HMR
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath
    })
  )
  app.use(webpackHotMiddleware(compiler))
}

// enable SSL
const sslDir = process.cwd()
const spdyServer = spdy.createServer(
  {
    key: fs.readFileSync(`${sslDir}/${process.env.SSL_KEY}`),
    cert: fs.readFileSync(`${sslDir}/${process.env.SSL_CERT}`)
  },
  app
)

// spin up server
const PORT = process.env.PORT || 8080
spdyServer.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`)
  console.log('Press Ctrl+C to quit.')
})
