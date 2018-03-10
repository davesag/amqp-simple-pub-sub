const defaults = {
  type: 'topic',
  url: process.env.AMQP_URL || 'amqp://localhost'
}

module.export = defaults
