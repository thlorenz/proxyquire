'use strict';
/*jshint asi:true*/
/*global describe, before, beforeEach, it */

var assert = require('assert')
  , proxyquire = require('..')
  ;

describe('When proxying nested desctructured assignments', function () {
  var bazStub
  var baz

  before(function () {

    bazStub = {
      top: {
        inner: 'XYZXYZ',
        middle: 789789
      }
    };

    baz = proxyquire('./samples/nested-destructuring/bar', {
      './baz': bazStub
    });
  })

  it('stubs baz.inner in bar', function () {
    assert.equal(baz.inner, 'XYZXYZ');
  })

  it('stubs baz.middle in bar', function () {
    assert.equal(baz.middle, 789789);
  })

});

