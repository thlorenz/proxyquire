'use strict'
/* jshint asi:true */

var assert = require('assert')
var proxyquire = require('..')
var path = require('path')
var fooPath = path.join(__dirname, './samples/foo.js')

describe('When resolving foo that requires nulled file package', function () {
  it('throws an error', function () {
    assert.throws(function () {
      proxyquire(fooPath, { path: null })
    }, function (error) {
      return error.code === 'MODULE_NOT_FOUND'
    })
  })
})

describe('When resolving foo that optionally requires nulled crypto package', function () {
  it('catches when resolving crypto', function () {
    var foo = proxyquire(fooPath, { crypto: null })
    assert.strictEqual(foo.bigCrypto(), 'caught')
  })
})
