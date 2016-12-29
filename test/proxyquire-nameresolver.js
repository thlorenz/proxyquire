/*jshint asi:true*/
/*global describe, before, beforeEach, it */
'use strict';

var realFoo = require('./samples/foo')
  , Module = require('module');

var assert = require('assert')
  , path = require('path');


var stubs = {
  'samples/bar': {
    rab: function () {
      return 'resolved'
    }
  },
  '/sub.js': {
    subFn: function () {
      return 'override';
    },
    '@override':true
  }
};

function resolver(stubs, fileName, module) {
  var dirname = module ? path.dirname(module) : '';
  var requireName = fileName;
  if (dirname) {
    requireName = fileName.charAt(0) == '.' ? path.normalize(dirname + '/' + fileName) : fileName;
  }

  for (var i in stubs) {
    if (requireName.indexOf(i) > 0) {
      return stubs[i];
    }
  }
}

function wipeCache(stubs, resolver, testCallback) {
  if (!testCallback) {
    testCallback = function () {
      return true;
    }
  }
  var cache = require.cache;
  var wipeList = [];
  var removedList = [];
  var newCache = Object.assign({}, cache);
  var objects = Object.keys(newCache);
  objects.forEach(function (moduleName) {
    var test = resolver(stubs, moduleName);
    if (test) {
      wipeList.push(moduleName);
      removedList.push(moduleName);
      delete newCache[moduleName];
    }
  });

  while (wipeList.length) {
    var objects = Object.keys(newCache);
    var removeList = wipeList;
    wipeList = [];

    objects.forEach(function (moduleName) {
      if (testCallback(moduleName)) {
        var subCache = newCache[moduleName].children;
        subCache.forEach(function (subModule) {
          if (removeList.indexOf(subModule.filename) >= 0) {
            wipeList.push(moduleName);
            removedList.push(moduleName);
            delete newCache[moduleName];
          }
        });
      }
    });
  }
  require.cache = Module._cache = newCache;
}

wipeCache(stubs, resolver, function (moduleName) {
  return moduleName.indexOf('/samples/') > 0;
});

var proxyquire = require('..')
var proxiedFoo = proxyquire.resolveNames(resolver).load('./samples/foo', stubs);
console.log(proxiedFoo.testSub());

if (0) {

  describe('nameresolver', function () {
    describe('override', function () {
      var proxyquire = require('..')

      it('proxyquire can load module buy half name', function () {
        var proxiedFoo = proxyquire.resolveNames(resolver).load('./samples/foo', stubs);

        assert.equal(proxiedFoo.bigRab(), 'RESOLVED');
      });
    });
  });
}
