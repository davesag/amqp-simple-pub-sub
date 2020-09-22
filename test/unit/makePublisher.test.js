const { expect } = require('chai')
const { stub, match } = require('sinon')
const proxyquire = require('proxyquire')

const { fakeChannel, fakeConnection, mockAmqplib } = require('./fakes')

const {
  QUEUE_NOT_STARTED,
  QUEUE_ALREADY_STARTED,
  EXCHANGE_MISSING,
  NOT_CONNECTED
} = require('../../src/errors')

describe('makePublisher', () => {
  const amqplib = mockAmqplib()
  const exchange = 'test'
  const attachEvents = stub()

  const makePublisher = proxyquire('../../src/makePublisher', {
    amqplib,
    './attachEvents': attachEvents
  })

  const url = 'amqp://localhost'
  const type = 'type'
  const onError = () => {}
  const onClose = () => {}

  let publisher
  let channel
  let connection

  context('with missing options', () => {
    it('throws EXCHANGE_MISSING if not supplied with an exchange', () =>
      expect(() => makePublisher()).to.throw(EXCHANGE_MISSING))
  })

  context('with valid options', () => {
    const hasFunction = pub => prop => {
      it(`has function ${prop}`, () => {
        expect(pub).has.property(prop)
        expect(pub[prop]).is.a('function')
      })
    }

    before(() => {
      publisher = makePublisher({ exchange })
    })

    it('created a publisher', () => {
      expect(publisher).to.exist
    })

    it('has functions', () => {
      ;['start', 'stop', 'publish', 'close'].forEach(hasFunction(publisher))
    })
  })

  describe('start', () => {
    before(async () => {
      publisher = makePublisher({ exchange, url, type, onError, onClose })
      channel = fakeChannel()
      connection = fakeConnection()
      channel.assertExchange.resolves()
      connection.createChannel.resolves(channel)
      amqplib.connect.resolves(connection)
      await publisher.start()
    })

    it('connected', () => {
      expect(amqplib.connect).to.have.been.calledWith(url)
    })

    it('attached events', () => {
      expect(attachEvents).to.have.been.calledWith(
        connection,
        match({
          onError,
          onClose
        })
      )
    })

    it('created a channel', () => {
      expect(connection.createChannel).to.have.been.calledOnce
    })

    it('asserted the exchange', () => {
      expect(channel.assertExchange).to.have.been.calledWith(exchange, type, {
        durable: true
      })
    })

    it('throws QUEUE_ALREADY_STARTED if you try and start it again', () =>
      expect(publisher.start()).to.be.rejectedWith(QUEUE_ALREADY_STARTED))
  })

  describe('stop', () => {
    context('before the publisher was started', () => {
      before(() => {
        publisher = makePublisher({ exchange })
      })

      it('throws QUEUE_NOT_STARTED', () =>
        expect(publisher.stop()).to.be.rejectedWith(QUEUE_NOT_STARTED))
    })

    context('after the publisher was started', () => {
      before(async () => {
        publisher = makePublisher({ exchange })
        channel = fakeChannel()
        connection = fakeConnection()
        channel.assertExchange.resolves()
        channel.close.resolves()
        connection.createChannel.resolves(channel)
        amqplib.connect.resolves(connection)
        await publisher.start()
        await publisher.stop()
      })

      it('closed the channel', () => {
        expect(channel.close).to.have.been.calledOnce
      })
    })
  })

  describe('publish', () => {
    context('before the publisher was started', () => {
      before(() => {
        publisher = makePublisher({ exchange })
      })

      it('throws QUEUE_NOT_STARTED', () =>
        expect(publisher.publish()).to.be.rejectedWith(QUEUE_NOT_STARTED))
    })

    context('after the publisher was started', () => {
      const key = 'some key'
      const data = 'some data'

      before(async () => {
        publisher = makePublisher({ exchange })
        channel = fakeChannel()
        connection = fakeConnection()
        channel.assertExchange.resolves()
        channel.publish.resolves()
        connection.createChannel.resolves(channel)
        amqplib.connect.resolves(connection)
        await publisher.start()
        await publisher.publish(key, data)
      })

      it('published a buffer of the data with the key for the exchange', () => {
        expect(channel.publish).to.have.been.calledWith(exchange, key, Buffer.from(data))
      })
    })
  })

  describe('close', () => {
    context('before the publisher was started', () => {
      before(() => {
        publisher = makePublisher({ exchange })
      })

      it('throws NOT_CONNECTED', () => expect(publisher.close()).to.be.rejectedWith(NOT_CONNECTED))
    })

    context('after the publisher was started', () => {
      before(async () => {
        publisher = makePublisher({ exchange })
        channel = fakeChannel()
        connection = fakeConnection()
        channel.assertExchange.resolves()
        connection.createChannel.resolves(channel)
        connection.close.resolves()
        amqplib.connect.resolves(connection)
        await publisher.start()
        await publisher.close()
      })

      it('closed the connection', () => {
        expect(connection.close).to.have.been.calledOnce
      })
    })
  })
})
