/*jshint asi:true*/
/*global describe before beforeEach it */
"use strict";

var assert = require('assert');

var file = '/folder/test.ext';

describe('When using global compat', function () {
  it('should persist noCallThru between requires', function () {
    var g1 = require('../..').compat(true).noCallThru();
    var g2 = require('../..').compat(true);

    var foo = g2('./samples/foo', __dirname, { path:{} });
    assert.throws(foo.bigBas);
  })

  it('does not persist noCallThru to non-global compats', function () {
    var g1 = require('../..').compat(true).noCallThru();
    var g2 = require('../..').compat();

    var foo = g2('./samples/foo', __dirname, {
      path: {
        extname:function (file) { return 'override ' + file; }
      }
    });
    assert.equal(foo.bigBas(file), 'TEST.EXT');
  })
})