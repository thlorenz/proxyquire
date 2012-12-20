/*jshint asi:true*/
/*global describe before beforeEach it */
'use strict';

var assert = require('assert')
  , proxyquire = require('../..').compat();

describe('api', function () {
  it('proxyquire function is the same as proxyquire.resolve function', function () {
    assert.equal(proxyquire, proxyquire.resolve)
  })
})
