'use strict';
/*jshint asi:true */
/*global describe before beforeEach it */
var proxyquire = require('..')
  , someArray = []

function didThrowUndefinedIsNotFunction() {
  proxyquire('./samples/edgecases', { 
      fs :  { }
    , fn :  function () { console.log(); }
  })
}

function alsoDidThrowUndefinedIsNotFunction() {
  proxyquire('./samples/edgecases', { 
      fs :  { }
    , fn :  function () { someArray.push(1) }
  })
}

function wasFineSinceNoConsoleLog() {
  proxyquire('./samples/edgecases', { 
      fs :  { }
    , './fn' :  function () { return 1 + 1 }
  })
}

function wasFineSinceFunctionIsFirst() {
  proxyquire('./samples/edgecases', { 
      fn :  function () { console.log(); }
    , fs :  { }
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
