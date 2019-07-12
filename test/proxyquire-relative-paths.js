'use strict'

/* jshint asi:true */

var proxyquire = require('..')

describe('When requiring relative paths, they should be relative to the proxyrequired module', function () {
  it('should return the correct result', function () {
    var result = proxyquire('./samples/relative-paths/a/index.js', { './util': { c: 'c' } })
    result.should.eql({ a: 'a', c: 'c' })
  })
})
