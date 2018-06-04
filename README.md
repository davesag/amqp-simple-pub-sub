# AMQP Simple Pub Sub

[![Greenkeeper badge](https://badges.greenkeeper.io/davesag/amqp-simple-pub-sub.svg)](https://greenkeeper.io/)

A simple Pub Sub system that uses AMQP Messaging to exchange data between services

* `develop` — [![CircleCI](https://circleci.com/gh/davesag/amqp-simple-pub-sub/tree/develop.svg?style=svg)](https://circleci.com/gh/davesag/amqp-simple-pub-sub/tree/develop) [![codecov](https://codecov.io/gh/davesag/amqp-simple-pub-sub/branch/develop/graph/badge.svg)](https://codecov.io/gh/davesag/amqp-simple-pub-sub)
* `master` — [![CircleCI](https://circleci.com/gh/davesag/amqp-simple-pub-sub/tree/master.svg?style=svg)](https://circleci.com/gh/davesag/amqp-simple-pub-sub/tree/master) [![codecov](https://codecov.io/gh/davesag/amqp-simple-pub-sub/branch/master/graph/badge.svg)](https://codecov.io/gh/davesag/amqp-simple-pub-sub)

[![NPM](https://nodei.co/npm/amqp-simple-pub-sub.png)](https://nodei.co/npm/amqp-simple-pub-sub/)

## To Use

    npm install amqp-simple-pub-sub

### Create a Publisher
    const { makePublisher } = require('amqp-simple-pub-sub')
    const publisher = makePublisher({ exchange: 'testService' })

### Publish a message

    await publisher.start()
    publisher.publish('test', 'Hello World')

### Create a Subscriber

    const { makeSubscriber } = require('amqp-simple-pub-sub')

    const subscriber = makeSubscriber({
      exchange: 'testService',
      queueName: 'testQueue',
      routingKeys: ['test']
    })

### Subscribe to a queue and listen for messages

    const handler = message => {
      console.log('Message Received', message)
      subscriber.ack(message)
    }

    subscriber.start(handler)

### Other Options

#### Publisher

The full options object is as follows

    {
      type: 'topic' // the default
      url: 'amqp://localhost' // the default
      exchange: 'you must provide this' // it's the name of your service usually
      onError: err => { // optional
        console.error('A connection error happened', err) // or do something clever
      }
      onClose: () => { // optional
        console.log('The connection has closed.') // or do something clever
      }
    }

#### Subscriber

The full options object is as follows

    {
      type: 'topic' // the default
      url: 'amqp://localhost' // the default
      exchange: 'you must provide this' // it's the name of your service usually
      queueName: 'you must also provide this' // give your queue a name
      routingKeys: ['an', 'array', 'of', 'routingKeys'] // optional.  Uses [queueName] otherwise.
      onError: err => { // optional
        console.error('A connection error happened', err) // or do something clever
      }
      onClose: () => { // optional
        console.log('The connection has closed.') // or do something clever
      }
    }

## Development

### Prerequisites

* [NodeJS](htps://nodejs.org), version 10+ or better (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)
* [Docker](https://www.docker.com) (Use [Docker for Mac](https://docs.docker.com/docker-for-mac/), not the homebrew version)

### Initialisation

    npm install

### To Start the queue server for integration testing.

    docker-compose up -d

Runs Rabbit MQ.

### Test it

* `npm test` — runs the unit tests (quick and does not need rabbit mq running)
* `npm run test:integration` — runs the integration tests (not so quick and needs rabbitmq running)

### Lint it

    npm run lint

## Contributing

Please see the [contributing notes](CONTRIBUTING.md).
