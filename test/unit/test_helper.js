const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
const chaiString = require('chai-string')

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(chaiString)
