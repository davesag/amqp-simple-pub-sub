const { expect } = require('chai')
const { stub, resetHistory } = require('sinon')
const proxyquire = require('proxyquire')

const { fakeChannel, fakeConnection, fakeQueue, mockAmqplib } = require('./fakes')
const {
  QUEUE_NOT_STARTED,
  QUEUE_ALREADY_STARTED,
  EXCHANGE_MISSING,
  QUEUE_MISSING,
  NOT_CONNECTED
} = require('../../src/errors')

describe('makeSubscriber', () => {
  const amqplib = mockAmqplib()
  const attachEvents = stub()
  const makeSubscriber = proxyquire('../../src/makeSubscriber', {
    amqplib,
    './attachEvents': attachEvents
  })

  let subscriber
  let queue
  let channel
  let connection

  const exchange = 'test'
  const queueName = 'testQueue'

  context('with missing options', () => {
    it('throws if not supplied with anything', () => {
      expect(() => makeSubscriber()).to.throw
    })

    it('throws EXCHANGE_MISSING if not supplied with an exchange', () => {
      expect(() => makeSubscriber({ queueName })).to.throw(EXCHANGE_MISSING)
    })

    it('throws EXCHANGE_MISSING if not supplied with a queueName', () => {
      expect(() => makeSubscriber({ exchange })).to.throw(QUEUE_MISSING)
    })
  })

  context('with valid options', () => {
    const hasFunction = pub => prop => {
      it(`has function ${prop}`, () => {
        expect(pub).has.property(prop)
        expect(pub[prop]).is.a('function')
      })
    }

    before(() => {
      subscriber = makeSubscriber({ exchange, queueName })
    })

    after(resetHistory)

    it('created a subscriber', () => {
      expect(subscriber).to.exist
    })

    it('has functions', () => {
      ;['start', 'stop', 'ack', 'nack', 'purgeQueue', 'close'].forEach(hasFunction(subscriber))
    })
  })

  describe('start', () => {
    const onError = stub()
    const onClose = stub()
    const url = 'amqp://localhost'
    const type = 'some type'
    const handler = stub()

    before(async () => {
      subscriber = makeSubscriber({
        url,
        type,
        exchange,
        queueName,
        onError,
        onClose
      })
      queue = fakeQueue()
      channel = fakeChannel()
      connection = fakeConnection()
      channel.assertQueue.resolves({ queue })
      channel.assertExchange.resolves()
      connection.createChannel.resolves(channel)
      amqplib.connect.resolves(connection)
      await subscriber.start(handler)
    })

    after(resetHistory)

    it('connected', () => {
      expect(amqplib.connect).to.have.been.calledOnceWith(url)
    })

    it('attached events', () => {
      expect(attachEvents).to.have.been.calledWith(connection, {
        onError,
        onClose
      })
    })

    it('created a channel', () => {
      expect(connection.createChannel).to.have.been.calledOnce
    })

    it('asserted the exchange', () => {
      expect(channel.assertExchange).to.have.been.calledOnceWith(exchange, type, { durable: true })
    })

    it('asserted the queue', () => {
      expect(channel.assertQueue).to.have.been.calledOnceWith(queueName, {
        exclusive: false
      })
    })

    it('bound the queue', () => {
      expect(channel.bindQueue).to.have.been.calledOnceWith(queue, exchange, queueName)
    })

    it('prefetched 1 item', () => {
      expect(channel.prefetch).to.have.been.calledWith(1)
    })

    it('consumed', () => {
      expect(channel.consume).to.have.been.calledOnceWith(queue, handler)
    })

    it('throws QUEUE_ALREADY_STARTED if you try and start it again', () =>
      expect(subscriber.start()).to.be.rejectedWith(QUEUE_ALREADY_STARTED))
  })

  describe('stop', () => {
    context('before the subscriber was started', () => {
      before(() => {
        subscriber = makeSubscriber({ exchange, queueName })
      })

      after(resetHistory)

      it('throws QUEUE_NOT_STARTED', () =>
        expect(subscriber.stop()).to.be.rejectedWith(QUEUE_NOT_STARTED))
    })

    context('after the subscriber was started', () => {
      before(async () => {
        subscriber = makeSubscriber({ exchange, queueName })
        queue = fakeQueue()
        channel = fakeChannel()
        connection = fakeConnection()
        channel.assertQueue.resolves({ queue })
        channel.assertExchange.resolves()
        channel.close.resolves()
        connection.createChannel.resolves(channel)
        amqplib.connect.resolves(connection)
        await subscriber.start(() => {})
        await subscriber.stop()
      })

      after(resetHistory)

      it('closed the channel', () => {
        expect(channel.close).to.have.been.calledOnce
      })
    })
  })

  describe('ack', () => {
    const message = 'some message'

    context('before the subscriber was started', () => {
      before(() => {
        subscriber = makeSubscriber({ exchange, queueName })
      })

      after(resetHistory)

      it('throws QUEUE_NOT_STARTED', () =>
        expect(() => subscriber.ack('some message')).to.throw(QUEUE_NOT_STARTED))
    })

    context('after the subscriber was started', () => {
      before(async () => {
        subscriber = makeSubscriber({ exchange, queueName })
        queue = fakeQueue()
        channel = fakeChannel()
        connection = fakeConnection()
        channel.assertQueue.resolves({ queue })
        channel.assertExchange.resolves()
        connection.createChannel.resolves(channel)
        amqplib.connect.resolves(connection)
        await subscriber.start(() => {})
        subscriber.ack(message)
      })

      after(resetHistory)

      it('called channel.ack with the message', () => {
        expect(channel.ack).to.have.been.calledWith(message)
      })
    })
  })

  describe('nack', () => {
    const message = 'some message'

    context('before the subscriber was started', () => {
      before(() => {
        subscriber = makeSubscriber({ exchange, queueName })
      })

      after(resetHistory)

      it('throws QUEUE_NOT_STARTED', () =>
        expect(() => subscriber.nack('some message')).to.throw(QUEUE_NOT_STARTED))
    })

    context('after the subscriber was started', () => {
      before(async () => {
        subscriber = makeSubscriber({ exchange, queueName })
        queue = fakeQueue()
        channel = fakeChannel()
        connection = fakeConnection()
        channel.assertQueue.resolves({ queue })
        channel.assertExchange.resolves()
        connection.createChannel.resolves(channel)
        amqplib.connect.resolves(connection)
        await subscriber.start(() => {})
        subscriber.nack(message)
      })

      after(resetHistory)

      it('called channel.nack with the message', () => {
        expect(channel.nack).to.have.been.calledWith(message)
      })
    })
  })

  describe('purgeQueue', () => {
    context('before the subscriber was started', () => {
      before(() => {
        subscriber = makeSubscriber({ exchange, queueName })
      })

      after(resetHistory)

      it('throws QUEUE_NOT_STARTED', () =>
        expect(subscriber.purgeQueue()).to.be.rejectedWith(QUEUE_NOT_STARTED))
    })

    context('after the subscriber was started', () => {
      before(async () => {
        subscriber = makeSubscriber({ exchange, queueName })
        queue = fakeQueue()
        channel = fakeChannel()
        connection = fakeConnection()
        channel.assertQueue.resolves({ queue })
        channel.assertExchange.resolves()
        channel.close.resolves()
        channel.purgeQueue.resolves()
        connection.createChannel.resolves(channel)
        amqplib.connect.resolves(connection)
        await subscriber.start(() => {})
        await subscriber.purgeQueue()
      })

      after(resetHistory)

      it('purged the queue', () => {
        expect(channel.purgeQueue).to.have.been.calledOnce
      })
    })
  })

  describe('close', () => {
    context('before the subscriber was started', () => {
      before(() => {
        subscriber = makeSubscriber({ exchange, queueName })
      })

      after(resetHistory)

      it('throws NOT_CONNECTED', () => expect(subscriber.close()).to.be.rejectedWith(NOT_CONNECTED))
    })

    context('after the subscriber was started', () => {
      before(async () => {
        subscriber = makeSubscriber({ exchange, queueName })
        queue = fakeQueue()
        channel = fakeChannel()
        connection = fakeConnection()
        channel.assertQueue.resolves({ queue })
        channel.assertExchange.resolves()
        channel.close.resolves()
        connection.createChannel.resolves(channel)
        connection.close.resolves()
        amqplib.connect.resolves(connection)
        await subscriber.start(() => {})
        await subscriber.close()
      })

      after(resetHistory)

      it('closed the connection', () => {
        expect(connection.close).to.have.been.calledOnce
      })
    })
  })
})
