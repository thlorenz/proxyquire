'use strict'

/*
 * These examples demonstrate how to use proxyquire with Sinon.JS (<http://sinonjs.org/>).
 * Run these tests with mocha (<http://visionmedia.github.com/mocha/>).
 * e.g., mocha foo-tests.js
 */

var proxyquire = require('../..')
var sinon = require('sinon')
var assert = require('assert')
var fs = require('fs')
var path = require('path')
var foo

// Stubbing return values
describe('when path.extname(file) returns ".markdown"', function () {
  var extnameStub
  var file = 'somefile'

  before(function () {
    extnameStub = sinon.stub(path, 'extname')
    foo = proxyquire('./foo', { path: { extname: extnameStub } })

    extnameStub.withArgs(file).returns('.markdown')
  })

  after(function () {
    path.extname.restore()
  })

  it('extnameAllCaps returns ".MARKDOWN"', function () {
    assert.equal(foo.extnameAllCaps(file), '.MARKDOWN')
  })
})

// Stubbing callbacks
describe('when fs.readdir calls back with ["file1", "file2"]', function () {
  var readdirStub

  before(function () {
    readdirStub = sinon.stub(fs, 'readdir')
    foo = proxyquire('./foo', { fs: { readdir: readdirStub } })

    readdirStub.withArgs('../simple').yields(null, [ 'file1', 'file2' ])
  })

  after(function () {
    fs.readdir.restore()
  })

  it('filesAllCaps calls back with ["FILE1", "FILE2"]', function (done) {
    foo.filesAllCaps('../simple', function (err, files) {
      assert.equal(err, null)
      assert.equal(files[0], 'FILE1')
      assert.equal(files[1], 'FILE2')
      done()
    })
  })
})

describe('when fs.readdir returns an error', function () {
  var readdirError,
    readdirStub

  before(function () {
    readdirStub = sinon.stub(fs, 'readdir')
    foo = proxyquire('./foo', { fs: { readdir: readdirStub } })

    readdirError = new Error('some error')
    readdirStub.withArgs('../simple').yields(readdirError, null)
  })

  after(function () {
    fs.readdir.restore()
  })

  it('filesAllCaps calls back with that error', function (done) {
    foo.filesAllCaps('../simple', function (err, files) {
      assert.equal(err, readdirError)
      assert.equal(files, null)
      done()
    })
  })
})

// Spying
describe('when calling filesAllCaps with "../simple"', function () {
  var readdirSpy

  before(function () {
    readdirSpy = sinon.spy(fs, 'readdir')
    foo = proxyquire('./foo', { fs: { readdir: readdirSpy } })
  })

  after(function () {
    fs.readdir.restore()
  })

  it('calls fs.readdir with "../simple"', function (done) {
    foo.filesAllCaps('../simple', function (err, files) {
      assert.ifError(err)
      assert(fs.readdir.calledOnce)
      assert.equal(fs.readdir.getCall(0).args[0], '../simple')
      done()
    })
  })
})
