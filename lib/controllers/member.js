const Member = require('../models/member')

const create = async ctx => {
  if(!ctx.request.body.name || !ctx.request.body.nickname || !ctx.request.body.email) {
    ctx.status = 400
    ctx.body = {code: 400, error: 'Requires name, nickname and email'}
    return
  }
  const paymentUrl = await Member.create(ctx.request.body.name, ctx.request.body.nickname, ctx.request.body.email)
  ctx.body = {paymentUrl}
}
exports.create = create

const setupRecurring = async ctx => {
  await Member.setupRecurringPayment(ctx.request.body.id)
  ctx.body = 'confirmed!'
}
exports.setupRecurring = setupRecurring

const paid = async ctx => {
  console.log('paid body:', request.body)
  await Member.hasPaid(ctx.request.body.id)
  ctx.body = 'paid'
}
exports.paid = paid

const stopRecurring = async ctx => {
  if(!ctx.request.body.nickname) {
    ctx.status = 400
    ctx.body = {code: 400, error: 'Requires nickname'}
    return
  }

  await Member.stopRecurringPayment(ctx.request.body.nickname)
  ctx.body = 'stopped recurring payment'
}
exports.stopRecurring = stopRecurring
