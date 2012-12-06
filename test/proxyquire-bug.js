'use strict';
/*jshint asi:true */
/*global describe before beforeEach it */
var proxyquire = require('..')
  , someArray = []

function throwsUndefinedIsNotFunction() {
  proxyquire('./samples/foo', { 
      fs :  { }
    , fn :  function () { console.log(); }
  })
}

function alsoThrowsUndefinedIsNotFunction() {
  proxyquire('./samples/foo', { 
      fs :  { }
    , fn :  function () { someArray.push(1) }
  })
}

function fineSinceNoConsoleLog() {
  proxyquire('./samples/foo', { 
      fs :  { }
    , fn :  function () { return 1 + 1 }
  })
}

function fineSinceOnlyOneStubbedProperty() {
  proxyquire('./samples/foo', { 
    fn :  function () { console.log(); }
  })
}

function fineSinceFunctionIsFirst() {
  proxyquire('./samples/foo', { 
      fn :  function () { console.log(); }
    , fs :  { }
  })
}

return;
fineSinceOnlyOneStubbedProperty()
console.log(require.extensions);

// throwsUndefinedIsNotFunction()

/*describe('when I require problematic stubs', function () {
  
  it('none of them should throw', function () {
    fineSinceOnlyOneStubbedProperty()
    fineSinceNoConsoleLog()
    fineSinceFunctionIsFirst()
    alsoThrowsUndefinedIsNotFunction()
  })
})*/
