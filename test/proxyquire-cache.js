/*jshint asi:true*/
/*global describe, before, beforeEach, it */

"use strict";

var assert = require('assert');

describe("Proxyquire's effects on require.cache", function() {
  var pathStub = { extname: function(file) { return 'stubbed'; } };

  describe('load()', function() {
    it('will default to clearing the cache', function() {
      require('./samples/foo-object');

      var proxyquire = require('..');
      proxyquire('./samples/foo-object', { 'path': pathStub });

      var foo = require('./samples/foo-object').createNew();
      assert.equal('.TXT', foo.bigExt('file.txt'));
    });
  });

  describe('preserveCache()', function() {
    it('will return a reference to itself, so it can be chained', function() {
      var proxyquire = require('..');
      assert.equal(proxyquire.preserveCache(), proxyquire);
    });

    it('will have Proxyquire restore the cache for the module', function() {
      require('./samples/foo-object');

      var proxyquire = require('..');
      proxyquire.preserveCache();
      proxyquire.load('./samples/foo-object', { 'path': pathStub });

      // This module will not be reloaded, but called from the original cache
      // As such, the object definition that references the stubbed path for foo-object will not be altered
      var foo = require('./samples/foo-object').createNew();
      assert.equal('STUBBED', foo.bigExt('file.txt'));
    });

    it('will allow Singletons to function properly', function() {
      var originalFoo = require('./samples/foo-object').getInstance();

      var proxyquire = require('..');
      proxyquire.preserveCache();
      proxyquire.load('./samples/foo-object', { 'path': pathStub }).getInstance();

      var fooAfterPreserve = require('./samples/foo-object').getInstance();
      assert.equal(fooAfterPreserve, originalFoo);
    });
  });

  describe('noCache()', function() {
    it('will return a reference to itself, so it can be chained', function() {
      var proxyquire = require('..');
      assert.equal(proxyquire.noCache(), proxyquire);
    });

    it('will toggle preserveCache() off', function() {
      require('./samples/foo-object');

      var proxyquire = require('..');
      proxyquire.preserveCache();
      proxyquire.load('./samples/foo-object', { 'path': pathStub });
      var foo = require('./samples/foo-object').createNew();
      assert.equal('STUBBED', foo.bigExt('file.txt'));

      proxyquire.noCache();
      proxyquire.load('./samples/foo-object', { 'path': pathStub });
      var fooCleared = require('./samples/foo-object').createNew();
      assert.equal('.TXT', fooCleared.bigExt('file.txt'));
    });
  });
});