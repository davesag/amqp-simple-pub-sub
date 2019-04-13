const { expect } = require('chai')
const waitUntil = require('wait-until')

const { makePublisher, makeSubscriber } = require('../../src')

/**
 *  In this test we have a single publisher and two sets of subscriber groups,
 *  each of which contain two services that compete for the chance to process an event.
 *
 *  The scenario is as follows.
 *
 *  The publisher is a service that finds images online.  Once it's found an image
 *  it emits an `image.detected` event.
 *
 *  There are two service groups listening for that event.
 *  1. An OCR service that will scan the image and convert it to text.
 *  2. A meta-data analysis service that will extract the image's meta-data.
 *  Because these things could take some time we wish to run multiple OCR services in parallel,
 *  and multiple meta-data analysis service in parallel.
 *  We must make sure however that at one of each of the OCR and Meta-Data services runs.
 */
describe('one publisher and two sets of competing subscribers', () => {
  const exchange = 'test'
  const queueNames = {
    OCR: 'OCR',
    MET: 'META-DATA'
  }

  const ocrSubscribers = []
  const metSubscribers = []
  const metReceived = []
  const ocrReceived = []
  const routingKeys = ['image.detected']

  let publisher
  const publishedEvent = {
    text: 'This is the image text',
    meta: 'This is the metadata'
  }

  before(async () => {
    // create the publisher.
    publisher = makePublisher({ exchange })

    // define the two OCR Services, listening for the 'image.detected' routing key
    const ocrOptions = { exchange, queueName: queueNames.OCR, routingKeys }
    ocrSubscribers.push(makeSubscriber(ocrOptions))
    ocrSubscribers.push(makeSubscriber(ocrOptions))

    // define the two Meta-Data Services, also listening for the 'image.detected' routing key
    const metOptions = { exchange, queueName: queueNames.MET, routingKeys }
    metSubscribers.push(makeSubscriber(metOptions))
    metSubscribers.push(makeSubscriber(metOptions))

    // create the OCR Service function.
    const ocrHandler = subscriber => message => {
      const data = JSON.parse(message.content.toString())
      ocrReceived.push(data.text)
      subscriber.ack(message)
    }

    // create the Meta-Data Service function.
    const metHandler = subscriber => message => {
      const data = JSON.parse(message.content.toString())
      metReceived.push(data.meta)
      subscriber.ack(message)
    }

    // start the publisher
    await publisher.start()

    // start all of the subscribers with the appropriate handlers.
    await Promise.all([
      ...ocrSubscribers.map(s => s.start(ocrHandler(s))),
      ...metSubscribers.map(s => s.start(metHandler(s)))
    ])
  })

  after(async () => {
    // cleanup after ourselves.
    await Promise.all([
      publisher.close(),
      ...ocrSubscribers.map(s => s.close()),
      ...metSubscribers.map(s => s.close())
    ])
  })

  it('created the publisher', () => {
    expect(publisher).to.exist
  })

  it('created the ocrSubscribers', () => {
    expect(ocrSubscribers).to.have.length(2)
  })

  it('created the metSubscribers', () => {
    expect(metSubscribers).to.have.length(2)
  })

  describe('publish a message', () => {
    before(done => {
      const message = JSON.stringify(publishedEvent)
      // publish the message with the 'image.detected' routing key.
      publisher.publish(routingKeys[0], message).then(() => {
        waitUntil(
          100,
          10,
          () => metReceived.length !== 0 && ocrReceived.length !== 0,
          () => {
            done()
          }
        )
      })
    })

    it('an ocrSubscriber handled the published message', () => {
      expect(ocrReceived).to.have.length(1)
      expect(ocrReceived[0]).to.equal(publishedEvent.text)
    })

    it('a metSubscriber handled the published message', () => {
      expect(metReceived).to.have.length(1)
      expect(metReceived[0]).to.equal(publishedEvent.meta)
    })
  })
})
