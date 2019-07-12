'use strict'

var path = require('path')

require('../example-utils').listModuleAndTests(path.resolve(__dirname, '/foo.js'), __filename)

// Overriding callbacks that would normally be async will cause them to call back immediately
// Thus allowing you to run synchronous tests against async APIs.

var proxyquire = require('../..')
var assert = require('assert')
var readdirError = new Error('some error')
var fsStub = { }
var calledBack

var foo = proxyquire('./foo', { fs: fsStub })

/*
* Test caps locking of returned files
*/
fsStub.readdir = function (dir, cb) { cb(null, ['file1', 'file2']) }

calledBack = false
foo.filesAllCaps('./somedir', function (err, files) {
  assert.strictEqual(err, null)
  assert.strictEqual(files[0], 'FILE1')
  assert.strictEqual(files[1], 'FILE2')

  calledBack = true
})

// fs.readdir and thus filesAllCaps calls back before we get here, which means the code ran synchronously
assert(calledBack)

/*
* Test error propagation
*/
fsStub.readdir = function (dir, cb) { cb(readdirError) }

foo.filesAllCaps('./somedir', function (err, files) {
  assert.strictEqual(err, readdirError)
})

console.log('*** All asserts passed ***')
