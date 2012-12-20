/*jshint asi:true*/
/*global describe before beforeEach it */
"use strict";

var assert = require('assert')
  , proxyquire = require('../..').compat()
  ;

describe('Illegal parameters to resolve give meaningful errors', function () {
  var bar = { bar: function () { return 'bar'; } }
    , exception
    ;
  
  function throws(action, regex) {
    assert.throws(action, function (err) {
      return err.name === 'ProxyquireError' && regex.test(err.message);
    });
  }

  describe('when I pass no module', function () {
    function act () {
      proxyquire(undefined, __dirname); 
    }

    it('throws an exception explaining that module needs to be passed', function () {
      throws(act, /missing argument: "mdl"/i);
    })
    
  })

  describe('when I pass an object as module', function () {

    function act () {
      proxyquire({ }, __dirname, { './bar': bar }); 
    }
      
    it('throws an exception explaining that module needs to be a string', function () {
      throws(act, /invalid argument: "mdl".+needs to be a string/i);
    })
  })

  describe('when I pass no test__dirname', function () {
    function act () {
      proxyquire('module'); 
    }

    it('throws an exception explaining that resolve without stubs makes no sense', function () {
      throws(act, /missing argument: "__dirname" of test file/i);
    })
  })

  describe('when I pass an object as test__dirname', function () {

    function act () {
      proxyquire('./samples/foo', { }, { './bar': bar }); 
    }
      
    it('throws an exception explaining that test__dirname needs to be a string', function () {
      throws(act, /invalid argument: "__dirname" of test file.+needs to be a string/i);
    })
  })

  describe('when I pass no stubs', function () {
    function act () {
      proxyquire('./samples/foo', __dirname); 
    }

    it('throws an exception explaining that resolve without stubs makes no sense', function () {
      throws(act,  /missing argument: "stubs".+use regular require instead/i);
    })
    
  })

  describe('when I pass a string as stubs', function () {
    function act () {
      proxyquire('./samples/foo', __dirname, 'stubs'); 
    }

    it('throws an exception explaining that stubs need to be an object', function () {
      throws(act,  /invalid argument: "stubs".+needs to be an object/i);
    })
  })
})
