/*jshint asi:true*/
/*global describe, before, beforeEach, it */
'use strict';

var assert = require('assert')
  , realFoo = require('./samples/foo')
  , path = require('path');

var stubs = {
  'samples/bar': {
    rab: function () {
      return 'resolved'
    }
  }
};

function resolver(stubs, fileName, module) {
  var dirname = path.dirname(module);
  var requireName = fileName.charAt(0) == '.' ? path.normalize(dirname + '/' + fileName) : fileName;
  for (var i in stubs) {
    if (requireName.indexOf(i) > 0) {
      return stubs[i]
    }
  }
}

describe('nameresolver', function () {
  describe('override', function () {
    var proxyquire = require('..')

    it('proxyquire can load module buy half name', function () {
      var proxiedFoo = proxyquire.resolveNames(resolver).load('./samples/foo', stubs);

      assert.equal(proxiedFoo.bigRab(), 'RESOLVED');
    });
  });
});
