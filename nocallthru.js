'use strict'

var Proxyquire = require('./lib/proxyquire')

// delete this module from the cache to force re-require in order to allow resolving test module via parent.module
delete require.cache[require.resolve(__filename)]

module.exports = new Proxyquire(module.parent).noCallThru()
