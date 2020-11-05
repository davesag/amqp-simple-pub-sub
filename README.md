# AMQP Simple Pub Sub

A Pub Sub system that uses `AMQP` messaging to exchange data between services.

[![NPM](https://nodei.co/npm/amqp-simple-pub-sub.png)](https://nodei.co/npm/amqp-simple-pub-sub/)

## To Use

You project needs to be using at least Node version 8, and ideally Node 10 (LTS) or later.

```sh
npm install amqp-simple-pub-sub
```

### Create a Publisher

```js
const { makePublisher } = require('amqp-simple-pub-sub')
const publisher = makePublisher({ exchange: 'testService' })
```

### Publish a message

```js
await publisher.start()
publisher.publish('test', 'Hello World')
```

### Create a Subscriber

```js
const { makeSubscriber } = require('amqp-simple-pub-sub')

const subscriber = makeSubscriber({
  exchange: 'testService',
  queueName: 'testQueue',
  routingKeys: ['test']
})
```

### Subscribe to a queue and listen for messages

```js
const handler = message => {
  console.log('Message Received', message)
  subscriber.ack(message)
}

subscriber.start(handler)
```

### Other Options

#### Publisher

The full options object is as follows

```js
{
  type: 'topic', // the default
  url: 'amqp://localhost', // the default
  exchange: 'you must provide this', // it's the name of your service usually
  onError: err => { // optional
    console.error('A connection error happened', err) // or do something clever
  },
  onClose: () => { // optional
    console.log('The connection has closed.') // or do something clever
  }
}
```

#### Subscriber

The full options object is as follows

```js
{
  type: 'topic', // the default
  url: 'amqp://localhost', // the default
  exchange: 'you must provide this', // it's the name of your service usually
  queueName: 'you must also provide this', // give your queue a name
  routingKeys: ['an', 'array', 'of', 'routingKeys'], // optional.  Uses [queueName] otherwise.
  onError: err => { // optional
    console.error('A connection error happened', err) // or do something clever
  },
  onClose: () => { // optional
    console.log('The connection has closed.') // or do something clever
  }
}
```

#### Examples

See some examples in the tests, and also:

- [competing-services-example](https://github.com/davesag/competing-services-example)
- And the associated article: [itnext.io/connecting-competing-microservices-using-rabbitmq](https://itnext.io/connecting-competing-microservices-using-rabbitmq-28e5269861b6)

## Related Projects

- [`amqp-delegate`](https://github.com/davesag/amqp-delegate) — A library that simplifies, to the point of triviality, use of AMQP based remote workers.
- [`ampq-event-tester`](https://github.com/davesag/amqp-event-tester) — A Dockerised and configurable utility to help integration-test your AMQP services.

## Development

### Branches

<!-- prettier-ignore -->
| Branch | Tests | Code Coverage | Audit | Comments |
| ------ | ----- | ------------- | ----- | -------- |
| `develop` | [![CircleCI](https://circleci.com/gh/davesag/amqp-simple-pub-sub/tree/develop.svg?style=svg)](https://circleci.com/gh/davesag/amqp-simple-pub-sub/tree/develop) | [![codecov](https://codecov.io/gh/davesag/amqp-simple-pub-sub/branch/develop/graph/badge.svg)](https://codecov.io/gh/davesag/amqp-simple-pub-sub) | [![Vulnerabilities](https://snyk.io/test/github/davesag/amqp-simple-pub-sub/develop/badge.svg)](https://snyk.io/test/github/davesag/amqp-simple-pub-sub/develop) | Work in progress |
| `master` | [![CircleCI](https://circleci.com/gh/davesag/amqp-simple-pub-sub/tree/master.svg?style=svg)](https://circleci.com/gh/davesag/amqp-simple-pub-sub/tree/master) | [![codecov](https://codecov.io/gh/davesag/amqp-simple-pub-sub/branch/master/graph/badge.svg)](https://codecov.io/gh/davesag/amqp-simple-pub-sub) | [![Vulnerabilities](https://snyk.io/test/github/davesag/amqp-simple-pub-sub/master/badge.svg)](https://snyk.io/test/github/davesag/amqp-simple-pub-sub/master) | Latest release |

### Prerequisites

- [NodeJS](htps://nodejs.org), 15.1.0+ (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.) You must use npm version 7.0.8 or better.
- [Docker](https://www.docker.com) (Use [Docker for Mac](https://docs.docker.com/docker-for-mac/), not the homebrew version)

### Initialisation

```sh
npm install
```

### To Start the queue server for integration testing.

```sh
docker-compose up -d
```

Runs Rabbit MQ.

### Test it

- `npm test` — runs the unit tests (quick and does not need `rabbitmq` running)
- `npm run test:unit:cov` — runs the unit tests with code coverage (does not need `rabbitmq`)
- `npm run test:integration` — runs the integration tests (needs `rabbitmq`)

### Lint it

```sh
npm run lint
```

## Contributing

Please see the [contributing notes](CONTRIBUTING.md).
