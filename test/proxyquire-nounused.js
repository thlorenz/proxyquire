'use strict';
/*jshint asi:true*/
/*global describe, before, beforeEach, it */

var assert = require('assert')
  , proxyquire = require('..')
  , path = require('path')
  , fooPath = path.join(__dirname, './samples/foo-singleton.js');

describe('When resolving something unused', function () {

  it('should work in default behavior', function () {
    proxyquire.load(fooPath, {
      '/not/used.js': { a: 'b' },
      'path': { a: 'b' }
    })
  });

  it('throws error if stubs is not used', function () {
    assert.throws(function () {
      proxyquire.noUnusedStubs().load(fooPath, {
        '/not/used.js': { a: 'b' },
        'path': { a: 'b' }
      })
    });
  });

  it('throws error if stubs is not used', function () {
    assert.throws(function () {
      proxyquire.noUnmockedStubs().load(fooPath, {
        //'path': { a: 'b' }
      })
    });
  })
})
