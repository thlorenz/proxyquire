'use strict'
/* jshint asi:true */

var assert = require('assert')
var proxyquire = require('..')

describe('When resolving foo that requires bar and stubbed baz where bar requires unstubbed baz', function () {
  var bazStub,
    foo,
    baz

  before(function () {
    bazStub = {
      testexport: 'stubbed'
    }

    foo = proxyquire('./samples/sub-dependencies/foo', {
      './baz': bazStub
    })

    baz = require('./samples/sub-dependencies/baz')
  })

  it('does not stub baz in bar', function () {
    assert.strictEqual(foo.bar.baz.testexport, 'test')
  })

  it('does not affect a normal baz import', function () {
    assert.strictEqual(baz.testexport, 'test')
  })
})
