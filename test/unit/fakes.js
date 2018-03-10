const { stub } = require('sinon')

const fakeQueue = () => 'some queue'

const fakeChannel = () => ({
  assertExchange: stub().returnsPromise(),
  publish: stub().returnsPromise(),
  close: stub().returnsPromise(),
  assertQueue: stub().returnsPromise(),
  purgeQueue: stub().returnsPromise(),
  bindQueue: stub(),
  prefetch: stub(),
  consume: stub(),
  ack: stub(),
  nack: stub()
})

const fakeConnection = () => ({
  createChannel: stub().returnsPromise(),
  close: stub().returnsPromise()
})

const mockAmqplib = () => ({
  connect: stub().returnsPromise()
})

module.exports = {
  fakeQueue,
  fakeChannel,
  fakeConnection,
  mockAmqplib
}
