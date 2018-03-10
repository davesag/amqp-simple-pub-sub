# AMQP Simple Pub Sub

A simple Pub Sub system that uses AMQP Messaging to exchange data between services

* `develop` — [circleCI badge] [codecov badge]
* `master` — [circleCI badge] [codecov badge]

## To Use

    npm install amqp-simple-pub-sub

_ fill this in_

## Development

### Prerequisites

* [NodeJS](htps://nodejs.org), version 9.8.0 or better (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)
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
