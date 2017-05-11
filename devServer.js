var express = require('express')
var httpProxy = require('http-proxy')
var webpack = require('webpack')
var webpackConfig = require('./webpack.config')
var path = require('path')

// const DashboardPlugin = require('webpack-dashboard/plugin')
// const compression = require('compression')

var app = express()
var PORT = 8081
var apiProxy = httpProxy.createProxyServer()
var webpackCompiler = webpack(webpackConfig)
var serverOptions = {
  contentBase: 'http://localhost:' + PORT,
  quiet: true,
  noInfo: true,
  hot: true,
  inline: true,
  lazy: false,
  publicPath: webpackConfig.output.publicPath,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: { colors: true }
}

app.use(require('webpack-dev-middleware')(webpackCompiler, serverOptions))
app.use(require('webpack-hot-middleware')(webpackCompiler))

app.use(['/auth/*', '/query/*', '/api/*'], function (req, res) {
  req.url = req.originalUrl // Janky hack to pass also query string and parameters...
  apiProxy.web(req, res, {
    target: {
      port: 8080,
      host: 'localhost'
    }
  })
  apiProxy.on('error', (err) => {
    console.log('Proxy error\n', err)
    res.end('not found', 404)
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

var httpServer = app.listen(PORT, () => {
  console.log(`HMR server on http://localhost:${PORT} [${app.settings.env}]`)
})

process.on('SIGTERM', () => {
  httpServer.close(() => {
    process.exit(0)
  })
})
