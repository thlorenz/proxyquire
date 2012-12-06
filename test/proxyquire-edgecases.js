'use strict';
/*jshint asi:true */
/*global describe before beforeEach it */
var proxyquire = require('..').create().noCallThru()
  , someArray = []

function didThrowUndefinedIsNotFunction() {
  proxyquire('./samples/edgecases', { 
      fs :  { }
    , fn :  function () { console.log(); }
    , '/fs.json': { some: 'prop' }
  })
}

function alsoDidThrowUndefinedIsNotFunction() {
  proxyquire('./samples/edgecases', { 
      fs :  { }
    , fn :  function () { someArray.push(1) }
    , '/fs.json': { some: 'prop' }
  })
}

function wasFineSinceNoConsoleLog() {
  proxyquire('./samples/edgecases', { 
      fs :  { }
    , fn :  function () { return 1 + 1 }
    , '/fs.json': { some: 'prop' }
  })
}

function wasFineSinceFunctionIsFirst() {
  proxyquire('./samples/edgecases', { 
      fn :  function () { console.log(); }
    , fs :  { }
    , '/fs.json': { some: 'prop' }
  })
}

describe('when I require problematic stubs', function () {
  
  it('none of them should throw', function () {
    wasFineSinceFunctionIsFirst()
    wasFineSinceNoConsoleLog()

    didThrowUndefinedIsNotFunction()
    alsoDidThrowUndefinedIsNotFunction()
  })
})
