const amqp = require('amqplib')
const {
  QUEUE_NOT_STARTED,
  QUEUE_ALREADY_STARTED,
  EXCHANGE_MISSING,
  NOT_CONNECTED
} = require('./errors')
const defaults = require('./defaults')
const attachEvents = require('./attachEvents')

/**
 * Create a publisher with the given options.
 * @param options
 *   - exchange The name of the service exchange queue (required)
 *   - type The type of AMQP queue to use. Defaults to 'topic'
 *   - url The url of the AQMP server to use.  Defaults to 'amqp://localhost'
 *   - onError a hander to handle connection errors (optional)
 *   - onClose a handler to handle connection closed events (optional)
 * @return A Publisher
 */
const makePublisher = options => {
  const _options = {
    ...defaults,
    ...options
  }

  const { exchange, type, url, onError, onClose } = _options

  if (!exchange) throw new Error(EXCHANGE_MISSING)

  let connection
  let channel

  const start = async () => {
    if (channel) throw new Error(QUEUE_ALREADY_STARTED)
    connection = await amqp.connect(url)
    attachEvents(connection, { onError, onClose })

    channel = await connection.createChannel()
    await channel.assertExchange(exchange, type, { durable: true })
  }

  const stop = async () => {
    if (!channel) throw new Error(QUEUE_NOT_STARTED)
    await channel.close()
    channel = undefined
  }

  const publish = async (key, message) => {
    if (!channel) throw new Error(QUEUE_NOT_STARTED)
    const buffer = Buffer.from(message)
    return channel.publish(exchange, key, buffer)
  }

  const close = async () => {
    if (!connection) throw new Error(NOT_CONNECTED)
    await connection.close()
    channel = undefined
    connection = undefined
  }

  return { start, stop, publish, close }
}

module.exports = makePublisher
