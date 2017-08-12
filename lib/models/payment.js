// Mollie API initialisation
const Mollie = require('mollie-api-node')
const mollie = new Mollie.API.Client()
mollie.setApiKey(process.env.MOLLIE_API_KEY)

// Airtable API initalisation
const Airtable = require('airtable')
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY)

class Payment {
  static setup (member, customer, data) {
    return new Promise((resolve, reject) => {
      mollie.payments.create({
        amount: 0.01,
        customerId: customer.id,
        recurringType: 'first',
        description: 'Setup monthly donation for Pixelbar',
        redirectUrl: 'https://pixelbar.nl',
        webhookUrl: process.env.NOW_URL ? `${process.env.NOW_URL}/api/mollie/setup` : null
      }, payment => {
        resolve(payment.links.paymentUrl)
      })
    })
  }

  static create (member, amount) {
    return new Promise((resolve, reject) => {
      base(process.env.AIRTABLE_PAYMENTS_BASE)
      .create({created_at: new Date(), amount: amount, member: [member.id]}, (err, record) => {
        if (err) { console.error(err); reject(err) }
        resolve(record)
      })
    })
  }
}

module.exports = Payment
