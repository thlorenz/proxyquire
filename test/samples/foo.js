var stats = require('./stats')
var bar = require('./bar')
var boof = require('./boof')
var foonum = require('./foonum')
var foobool = require('./foobool')
var fooarray = require('./fooarray')
var path = require('path')
var crypto

// Require if present.
try { crypto = require('crypto') } catch (e) { crypto = 'caught' }

stats.incFooRequires()

function bigBar () {
  // inline require
  return require('./bar').bar().toUpperCase()
}

function bigRab () {
  // module wide require
  return bar.rab().toUpperCase()
}

function bigExt (file) {
  return path.extname(file).toUpperCase()
}

function bigBas (file) {
  return path.basename(file).toUpperCase()
}

function bigCrypto () {
  return crypto
}

module.exports = {
  bigBar: bigBar,
  bigRab: bigRab,
  bigExt: bigExt,
  bigBas: bigBas,
  boof: boof,
  foonum: foonum,
  foobool: foobool,
  fooarray: fooarray,
  bigCrypto: bigCrypto,
  state: ''
}
