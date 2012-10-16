'use strict';
/*jshint asi:true*/
/*global describe before beforeEach it */

var assert = require('assert')
  , proxyquire = require('./../proxyquire')
  , path = require('path')
  ;

// NB. These tests would (should?) only ever fail on windows
describe('Windows should be supported so that', function () {
  var windowspaths
    , barMock = { bar: function () { return 'mock'; } }
    ;

  before(function() {
    windowspaths = proxyquire('./samples/windowspaths', __dirname, {'./bar': barMock});
  })

  it('the module\'s __dirname variable is the original parent directory', function() {
    assert.equal(windowspaths.__dirname, path.join(__dirname, 'samples'));
  })

  it('the module\'s __filename variable is the original file name', function() {
    assert.equal(windowspaths.__filename, path.join(__dirname, 'samples', 'windowspaths.js'));
  })

  it('the module\'s require function returns the registered mock bar object', function() {
    assert.equal(windowspaths.testRequire(), 'mock', 'testRequire should call the mock bar function');
  })
})
