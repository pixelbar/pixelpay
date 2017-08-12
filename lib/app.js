const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const forceHttps = require('koa-sslify')
const json = require('koa-json')
const http = require('http')
const routes = require('./routes')
const app = new Koa()

if(process.env.NOW === 'true') app.use(forceHttps({trustProtoHeader: true}))
app.use(bodyParser())
app.use(json())
app.use(routes())

const server = http.createServer(app.callback())
const port = process.env.PORT || 8080
server.listen(port)
console.log(`Server started on localhost:${port}`)
