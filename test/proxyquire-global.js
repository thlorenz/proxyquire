'use strict'

var assert = require('assert')
var realFoo = require('./samples/global/foo')

var proxyquire = require('..')

describe('global flags set', function () {
  it('should override require globally', function () {
    var stubs = {
      './baz': {
        method: function () {
          return true
        },
        '@global': true
      }
    }

    var proxiedFoo = proxyquire('./samples/global/foo', stubs)

    assert.strictEqual(realFoo(), false)
    assert.strictEqual(proxiedFoo(), true)
  })

  it('should override require globally even when require\'s execution is deferred', function () {
    var stubs = {
      './baz': {
        method: function () {
          return true
        },
        '@runtimeGlobal': true
      }
    }

    var proxiedFoo = proxyquire('./samples/global/foo-deferred', stubs)

    assert.strictEqual(realFoo(), false)
    assert.strictEqual(proxiedFoo(), true)
  })

  it('should not throw when a native module is required a second time', function () {
    var stubs = {
      foo: {
        '@global': true
      }
    }

    // Using 'crypto' instead of 'native-hello-world' as it's a built-in native module
    // that's always available and doesn't require compilation
    proxyquire('crypto', stubs)
    proxyquire('crypto', stubs)
  })
})

describe('global flags not set', function () {
  it('should not override require globally', function () {
    var stubs = {
      './baz': {
        method: function () {
          return true
        }
      }
    }

    var proxiedFoo = proxyquire('./samples/global/foo', stubs)

    assert.strictEqual(realFoo(), false)
    assert.strictEqual(proxiedFoo(), false)
  })

  it('should not override require globally even when require\'s execution is deferred', function () {
    var stubs = {
      './baz': {
        method: function () {
          return true
        }
      }
    }

    var proxiedFoo = proxyquire('./samples/global/foo-deferred', stubs)

    assert.strictEqual(realFoo(), false)
    assert.strictEqual(proxiedFoo(), false)
  })
})
