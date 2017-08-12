// Mollie API initialisation
const Mollie = require('mollie-api-node')
const mollie = new Mollie.API.Client()
mollie.setApiKey(process.env.MOLLIE_API_KEY)

// Airtable API initalisation
const Airtable = require('airtable')
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY)

const Payment = require('./payment')

class Member {
  static create (name, nickname, email, amount = 25) {
    const data = {name, nickname, email, amount}

    return new Promise((resolve, reject) => {
      mollie.customers.create({
        name: data.name,
        email: data.email
      }, customer => {
        base(process.env.AIRTABLE_MEMBERS_BASE)
        .create(Object.assign({}, data, {mollie_id: customer.id, created_at: new Date()}), (err, record) => {
          if (err) { console.error(err); reject(err) }
          Payment.setup(record, customer, data)
          .then(resolve)
          .catch(reject)
        })
      })
    })
  }

  static setupRecurringPayment (paymentId) {
    return new Promise((resolve, reject) => {
      mollie.payments.get(paymentId, payment => {
        if (payment.isPaid()) {
          mollie.customers_mandates.withParentId(payment.customerId)
          .get(payment.mandateId, mandate => {
            if (mandate.status === 'valid') {
              this.get({mollie_id: payment.customerId})
              .then(member => {
                mollie.customers_subscriptions.withParentId(payment.customerId).create({
                  amount: member.fields.amount,
                  interval: '1 month',
                  description: 'Monthly donation for Pixelbar',
                  webhookUrl: process.env.NOW_URL ? `${process.env.NOW_URL}/api/mollie/paid` : null
                }, subscription => {
                  Member.update(member.id, {subscription_id: subscription.id})
                  .then(() => Payment.create(member, 0.01))
                  .then(resolve)
                  .catch(reject)
                })
              })
            }
          })
        } else {
          reject('Could not complete the request')
        }
      })
    })
  }

  static stopRecurringPayment (nickname) {
    return new Promise((resolve, reject) => {
      Member.get({nickname})
      .then(member => {
        mollie.callRest('DELETE', 'subscription', subscription_id, null, (response) => {
          Member.update(member.id, {subscription_id: null})
          .then(resolve)
        })
      })
    })
  }

  static hasPaid (paymendId) {
    return new Promise((resolve, reject) => {
      mollie.payments.get(paymentId, payment => {
        if (payment.isPaid()) {
          Member.get({mollie_id: payment.customerId})
          .then(member => Payment.create(member, payment.amount))
          .then(resolve)
          .catch(reject)
        } else {
          reject('Could not complete the request')
        }
      })
    })
  }

  static get (query) {
    return new Promise((resolve, reject) => {
      let users = []
      base(process.env.AIRTABLE_MEMBERS_BASE).select()
      .eachPage((records, next) => {
        users = [...users, ...records]
        next()
      }, err => {
        if (err) { console.error(err); reject(err) }
        const result = users.find(user => Object.keys(query).every(key => user.fields[key] && user.fields[key] === query[key]))
        resolve(result)
      })
    })
  }

  static update (id, data) {
    return new Promise((resolve, reject) => {
      base(process.env.AIRTABLE_MEMBERS_BASE)
      .update(id, data, (err, record) => {
        if (err) { console.error(err); reject(err) }
        resolve(record)
      })
    })
  }
}

module.exports = Member
