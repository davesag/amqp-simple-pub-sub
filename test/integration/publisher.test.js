const { expect } = require('chai')
const waitUntil = require('wait-until')

const { makePublisher, makeSubscriber } = require('../../src')

describe('publish and subscribe', () => {
  const exchange = 'test'
  const queueName = 'test'

  let publisher
  let subscriber
  let messageReceived
  const messageSent = 'Hello'

  before(async () => {
    publisher = makePublisher({ exchange })
    subscriber = makeSubscriber({ exchange, queueName })
    const handler = message => {
      messageReceived = message.content.toString()
      subscriber.ack(message)
    }
    await publisher.start()
    await subscriber.start(handler)
  })

  after(async () => {
    await Promise.all([publisher.close(), subscriber.close()])
  })

  it('created the publisher', () => {
    expect(publisher).to.exist
  })

  it('created the subscriber', () => {
    expect(subscriber).to.exist
  })

  describe('publish a message', () => {
    before(done => {
      publisher.publish(queueName, messageSent).then(() => {
        waitUntil(
          100,
          10,
          () => messageReceived !== undefined,
          () => {
            done()
          }
        )
      })
    })

    it('subscriber received the published message', () => {
      expect(messageReceived).to.equal(messageSent)
    })
  })
})
