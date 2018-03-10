const ERRORS = {
  QUEUE_ALREADY_STARTED: 'Message Queue has already been started',
  QUEUE_NOT_STARTED: 'Message Queue has not been started',
  EXCHANGE_MISSING: 'You must supply an exchange name in the options',
  QUEUE_MISSING: 'You must provide a queue name in the options',
  NOT_CONNECTED: 'You are not connected to an AMQP server'
}

module.exports = ERRORS
