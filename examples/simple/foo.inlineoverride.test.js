'use strict'

var path = require('path')

require('../example-utils').listModuleAndTests(path.resolve(__dirname, '/foo.js'), __filename)

var proxyquire = require('../..')
var assert = require('assert')
var foo

// no overrides yet, so path.extname behaves normally
foo = proxyquire('./foo', {})
assert.strictEqual(foo.extnameAllCaps('file.txt'), '.TXT')

// override path.extname
foo = proxyquire('./foo', {
  path: { extname: function (file) { return 'Exterminate, exterminate the ' + file } }
})

// path.extname now behaves as we told it to
assert.strictEqual(foo.extnameAllCaps('file.txt'), 'EXTERMINATE, EXTERMINATE THE FILE.TXT')

// path.basename on the other hand still functions as before
assert.strictEqual(foo.basenameAllCaps('/a/b/file.txt'), 'FILE.TXT')

console.log('*** All asserts passed ***')
