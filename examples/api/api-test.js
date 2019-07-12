'use strict'

var assert = require('assert')
var stats = require('./samples/stats')
var proxyquire = require('../..')
var file = '/some/path/test.ext'
var foo
var fooCut
var fooWild
var cutBarStub = { bar: function () { return 'barber' } }
var wildBarStub = { bar: function () { return 'barbar' } }

foo = proxyquire('./samples/foo', { })
fooCut = proxyquire('./samples/foo', { './bar': cutBarStub })
fooWild = proxyquire('./samples/foo', { './bar': wildBarStub })

assert.strictEqual(stats.fooRequires(), 3)

assert.strictEqual(foo.bigBar(), 'BAR')
assert.strictEqual(fooCut.bigBar(), 'BARBER')
assert.strictEqual(fooWild.bigBar(), 'BARBAR')

// non overriden keys call thru by default
assert.strictEqual(foo.bigRab(), 'RAB')
assert.strictEqual(fooCut.bigRab(), 'RAB')

// non overridden module path untouched
assert.strictEqual(foo.bigExt(file), '.EXT')
assert.strictEqual(fooCut.bigExt(file), '.EXT')
assert.strictEqual(fooWild.bigExt(file), '.EXT')
assert.strictEqual(foo.bigBas(file), 'TEST.EXT')
assert.strictEqual(fooCut.bigBas(file), 'TEST.EXT')
assert.strictEqual(fooWild.bigBas(file), 'TEST.EXT')

// overriding keys after require works for both inline and non inline requires
cutBarStub.bar = function () { return 'friseur' }
cutBarStub.rab = function () { return 'rabarber' }

assert.strictEqual(fooCut.bigBar(), 'FRISEUR')
assert.strictEqual(fooCut.bigRab(), 'RABARBER')

// autofilling keys on delete only works for inline requires
cutBarStub.bar = undefined
assert.strictEqual(fooCut.bigBar(), 'BAR')

cutBarStub.rab = undefined
assert.throws(fooCut.bigRab)

// turn off callThru feature via noCallThru
// not turned off
foo = proxyquire('./samples/foo', {
  path: {
    extname: function (file) { return 'Exterminate, exterminate the ' + file }
  }
})

assert.strictEqual(foo.bigExt(file), 'EXTERMINATE, EXTERMINATE THE /SOME/PATH/TEST.EXT')
assert.strictEqual(foo.bigBas(file), 'TEST.EXT')

// turned off
foo = proxyquire('./samples/foo', {
  path: {
    extname: function (file) { return 'Exterminate, exterminate the ' + file },
    '@noCallThru': true
  }
})

assert.strictEqual(foo.bigExt(file), 'EXTERMINATE, EXTERMINATE THE /SOME/PATH/TEST.EXT')
assert.throws(foo.bigBas)

// turned off globally
// not turned back on per module

foo = proxyquire
  .noCallThru()
  .load('./samples/foo', {
    path: {
      extname: function (file) { return 'Exterminate, exterminate the ' + file }
    }
  })

assert.throws(foo.bigBas)

// turned back on per module

foo = proxyquire
  .noCallThru()
  .load('./samples/foo', {
    path: {
      extname: function (file) { return 'Exterminate, exterminate the ' + file },
      '@noCallThru': false
    }
  })

assert.strictEqual(foo.bigBas(file), 'TEST.EXT')

// turned back on globally

foo = proxyquire
  .callThru()
  .load('./samples/foo', {
    path: {
      extname: function (file) { return 'Exterminate, exterminate the ' + file }
    }
  })

assert.strictEqual(foo.bigBas(file), 'TEST.EXT')

// turned back off per module

foo = proxyquire
  .callThru()
  .load('./samples/foo', {
    path: {
      extname: function (file) { return 'Exterminate, exterminate the ' + file },
      '@noCallThru': true
    }
  })

assert.throws(foo.bigBas)

console.log('*** All Asserts passed ***')
