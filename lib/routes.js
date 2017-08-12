const router = require('koa-router')
const Member = require('./controllers/member')

module.exports = () => router()
  .post('/api/members', Member.create)
  .post('/api/members/stop', Member.stopRecurring)
  .post('/api/mollie/setup', Member.setupRecurring)
  .post('/api/mollie/paid', Member.paid)
  .get('/api/ping', ctx => {
    ctx.body = 'pong'
  })
  .routes()
