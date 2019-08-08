'use strict'

var assert = require('assert')
var proxyquire = require('..')
var path = require('path')
var fooPath = path.join(__dirname, './samples/notexisting/foo.js')
var fooRelativePath = path.join(__dirname, './samples/notexisting/foo-relative.js')

describe('When resolving foo that requires stubbed /not/existing/bar.json', function () {
  it('throws an error', function () {
    assert.throws(function () {
      proxyquire(fooPath, {
        '/not/existing/bar.json': { config: 'bar\'s config' }
      })
    })
  })
})

describe('When resolving foo that requires stubbed /not/existing/bar.json with @noCallThru', function () {
  it('resolves foo with stubbed bar', function () {
    var foo = proxyquire(fooPath, {
      '/not/existing/bar.json': { config: 'bar\'s config', '@noCallThru': true }
    })
    assert.strictEqual(foo.config, 'bar\'s config')
  })
})

describe('When resolving foo that requires stubbed /not/existing/bar.json with noCallThru()', function () {
  it('resolves foo with stubbed bar', function () {
    proxyquire.noCallThru()
    var foo = proxyquire(fooPath, {
      '/not/existing/bar.json': { config: 'bar\'s config' }
    })
    assert.strictEqual(foo.config, 'bar\'s config')
    proxyquire.callThru()
  })
})

describe('When resolving foo-relative that requires relative stubbed ../not/existing/bar.json with @noCallThru', function () {
  it('resolves foo-relative with stubbed bar', function () {
    var fooRelative = proxyquire(fooRelativePath, {
      '../not/existing/bar.json': { config: 'bar\'s config', '@noCallThru': true }
    })
    assert.strictEqual(fooRelative.config, 'bar\'s config')
  })
})
