'use strict'

var assert = require('assert')
var ProxyError = require('../lib/proxyquire-error')

describe('Proxyquire', function () {
  describe('load()', function () {
    it('defaults to preserving the cache', function () {
      var original = require('./samples/foo')
      original.state = 'cached'

      var proxyquire = require('..')
      proxyquire('./samples/foo', { 'path': { } })

      var foo = require('./samples/foo')
      assert.equal('cached', foo.state)
      assert.equal(foo, original)
    })

    it('does not pollute the cache when module is proxyquired before it is loaded', function () {
      var proxyquire = require('..')

      proxyquire('./samples/no-call-thru-test', { './required': false })
      var original = require('./samples/no-call-thru-test')

      assert.equal(original.original, true)
    })
  })

  describe('preserveCache()', function () {
    it('returns a reference to itself, so it can be chained', function () {
      var proxyquire = require('..')
      assert.equal(proxyquire.preserveCache(), proxyquire)
    })

    it('has Proxyquire restore the cache for the module', function () {
      var original = require('./samples/foo')
      original.state = 'cached'

      var proxyquire = require('..')
      proxyquire.preserveCache()
      proxyquire.load('./samples/foo', { 'path': { } })

      var foo = require('./samples/foo')
      assert.equal('cached', foo.state)
      assert.equal(foo, original)
    })

    it('allows Singletons to function properly', function () {
      var original = require('./samples/foo-singleton').getInstance()

      var proxyquire = require('..')
      proxyquire.preserveCache()
      proxyquire.load('./samples/foo-singleton', { 'path': { } }).getInstance()

      var fooSingleton = require('./samples/foo-singleton').getInstance()
      assert.equal(fooSingleton, original)
    })
  })

  describe('noPreserveCache()', function () {
    it('returns a reference to itself, so it can be chained', function () {
      var proxyquire = require('..')
      assert.equal(proxyquire.noPreserveCache(), proxyquire)
    })

    it('forces subsequent requires to reload the proxied module', function () {
      var original = require('./samples/foo')
      original.state = 'cached'

      var proxyquire = require('..')
      proxyquire.load('./samples/foo', { 'path': { } })

      var cacheFoo = require('./samples/foo')
      assert.equal('cached', cacheFoo.state)
      assert.equal(cacheFoo, original)

      proxyquire.noPreserveCache()
      proxyquire.load('./samples/foo', { 'path': { } })
      var foo = require('./samples/foo')
      assert.equal('', foo.state)
      assert.notEqual(foo, original)
    })

    it('deletes the require.cache for the module being stubbed', function () {
      var proxyquire = require('..').noPreserveCache()

      proxyquire.load('./samples/foo', { 'path': { } })
      assert.equal(undefined, require.cache[require.resolve('./samples/foo')])
    })

    it('deletes the require.cache for the stubs', function () {
      var proxyquire = require('..').noPreserveCache()

      var bar = {}
      var foo = proxyquire.load('./samples/cache/foo', { './bar': bar })
      bar.f.g = function () { return 'a' }
      bar.h = function () { return 'a' }

      assert.equal(foo.bar.f.g(), 'a')
      assert.equal(foo.bar.h(), 'a')

      foo = proxyquire.load('./samples/cache/foo', { './bar': {} })
      assert.equal(foo.bar.h(), 'h')
      assert.equal(foo.bar.f.g(), 'g')

      assert.equal(undefined, require.cache[require.resolve('./samples/cache/foo')])
      assert.equal(undefined, require.cache[require.resolve('./samples/cache/bar')])
    })

    it('silences errors when stub lookups fail', function () {
      var proxyquire = require('..').noPreserveCache()

      assert.doesNotThrow(function () {
        proxyquire.load('./samples/cache/foo', { './does-not-exist': {} })
      })
    })
  })

  describe('requireStubs()', function () {
    it('returns a reference to itself, so it can be chained', function () {
      var proxyquire = require('..')
      assert.equal(proxyquire.requireStubs(), proxyquire)
    })

    it('throws an error when a require statement without a registered stub is loaded', () => {
      var proxyquire = require('..')
      proxyquire.requireStubs()

      assert.throws(function () {
        proxyquire.load('./samples/require-stubs/dep2', {})
      }, function (err) {
        return (err instanceof ProxyError) &&
          err.message === 'Module at path "./dep3" does not have a registered stub with proxyquire'
      })

      assert.doesNotThrow(function () {
        proxyquire.load('./samples/require-stubs/dep2', { './dep3': {} })
      }, 'Unexpected error when loading a require that had a registered stub')
    })

    it('allows call through modules to load their dependencies without registered stubs', function () {
      var proxyquire = require('..')
      proxyquire.requireStubs()

      // Default call through behavior still works
      try {
        var dep1 = proxyquire.load('./samples/require-stubs/dep1', {
          './dep2': {}
        })

        // Dependency Chain:
        //    - dependency 1 requires depencency 2
        //    - dependency 2 requires dependency 3
        //
        // Notes:
        //     because call through behavior is allowed dependency 2 is loaded which then loads dependency 3
        //     even though no stub was registered for dependency 3 ('./dep3')
        assert.equal(dep1.dep2.dep3.name, 'dep3')
      } catch (err) {
        assert.fail(err)
      }
    })
  })
})
