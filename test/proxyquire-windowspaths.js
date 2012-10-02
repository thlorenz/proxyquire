/*jshint asi:true*/
/*global describe before beforeEach it */
"use strict";

var assert = require('assert')
  , proxyquire = require('./../proxyquire')
  , path = require('path')
  ;

// NB. These tests would (should?) only ever fail on windows
describe('Constructed file path strings in generated temporary module should handle backslahes correctly for Windows support', function () {
  var windowspaths;

  before(function() {
    windowspaths = proxyquire.resolve('./samples/windowspaths', __dirname, {});
  })

  it('for instance the generated __dirname variable should be valid', function() {
    assert.equal(windowspaths.__dirname, path.join(__dirname, 'samples'));
  })

  it('for instance the generated __filename variable should be valid', function() {
    assert.equal(windowspaths.__filename, path.join(__dirname, 'samples', 'windowspaths.js'));
  })

  it('for instance the generated require function should not contain unescaped string literals', function() {
    var requireFunctionText = windowspaths.require.toString();
    var backslashCount = 0;
    requireFunctionText.split('').forEach(function(character) {
      if (character === '\\') {
        backslashCount++;
      } else {
        assert((backslashCount % 2 === 0), 'backslashes should always come in pairs, ie. be escaped: ' + requireFunctionText);
        backslashCount = 0;
      }
    });
  })
})
