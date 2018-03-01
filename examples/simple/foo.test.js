'use strict'

var path = require('path')

require('../example-utils').listModuleAndTests(path.resolve(__dirname, '/foo.js'), __filename)

var proxyquire = require('../..')
var assert = require('assert')
var pathStub = { }

// when not overridden, path.extname behaves normally
var foo = proxyquire('./foo', { 'path': pathStub })
assert.equal(foo.extnameAllCaps('file.txt'), '.TXT')

// override path.extname
pathStub.extname = function (file) { return 'Exterminate, exterminate the ' + file }

// path.extname now behaves as we told it to
assert.equal(foo.extnameAllCaps('file.txt'), 'EXTERMINATE, EXTERMINATE THE FILE.TXT')

// path.basename and all other path module methods still function as before
assert.equal(foo.basenameAllCaps('/a/b/file.txt'), 'FILE.TXT')

console.log('*** All asserts passed ***')
