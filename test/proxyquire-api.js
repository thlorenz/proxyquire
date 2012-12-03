/*jshint asi:true*/
/*global describe before beforeEach it */
'use strict';

var assert = require('assert')
  , realFoo = require('./samples/foo');

var stubs = {
  path:{
    extname:function () {},
    basename:function () {}
  }
};

describe('api', function () {
  describe('default export', function () {
    var proxyquire = require('./../proxyquire')

    it('proxyquire can load', function () {
      var proxiedFoo = proxyquire(module, './samples/foo', stubs);

      assert.equal(typeof proxiedFoo, 'object');
      assert.notStrictEqual(realFoo, proxiedFoo);
    });
  });

  describe('contextual proxyquires', function () {
   var proxyquire = require('./../proxyquire').create().fromModule(module);

    it('can load without specifying the module', function(){
      var proxiedFoo = proxyquire('./samples/foo', stubs);

      assert.equal(typeof proxiedFoo, 'object');
      assert.notStrictEqual(realFoo, proxiedFoo);
    })
  })
});
