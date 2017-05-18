/*jshint asi:true*/
/*global describe, before, beforeEach, it */
'use strict';

var assert = require('assert')
  , realFoo = require('./samples/global/foo');

var proxyquire = require('..');

describe('global flags set', function () {
  it('should override require globally', function () {
    var stubs = {
      './baz': {
        method: function() {
          return true;
        },
        '@global': true
      }
    };

    var proxiedFoo = proxyquire('./samples/global/foo', stubs);

    assert.equal(realFoo(), false);
    assert.equal(proxiedFoo(), true);
  });

  it('should override require globally even when require\'s execution is deferred', function () {
    var stubs = {
      './baz': {
        method: function() {
          return true;
        },
        '@runtimeGlobal': true
      }
    };

    var proxiedFoo = proxyquire('./samples/global/foo-deferred', stubs);

    assert.equal(realFoo(), false);
    assert.equal(proxiedFoo(), true);
  });

  it('should not throw when a native module is required a second time', function () {
    var stubs = {
      'foo': {
        '@global': true
      }
    };

    proxyquire('native-hello-world', stubs)
    proxyquire('native-hello-world', stubs)
  })
});

describe('global flags not set', function () {
  it('should not override require globally', function () {
    var stubs = {
      './baz': {
        method: function() {
          return true;
        }
      }
    };

    var proxiedFoo = proxyquire('./samples/global/foo', stubs);

    assert.equal(realFoo(), false);
    assert.equal(proxiedFoo(), false);
  });

  it('should not override require globally even when require\'s execution is deferred', function () {
    var stubs = {
      './baz': {
        method: function() {
          return true;
        }
      }
    };

    var proxiedFoo = proxyquire('./samples/global/foo-deferred', stubs);

    assert.equal(realFoo(), false);
    assert.equal(proxiedFoo(), false);
  });
});

describe('global in node_modules', function () {
  it('should not wipe node_modules', function () {

    var test = require('./samples/using-node-modules');
    assert.equal(test.fn(), "bar0");
    assert.equal(test.fn(), "bar1");
    // next call -> bar2 !

    var stubs = {
      'bar': {
        '@runtimeGlobal': true
      }
    };

    // should wipe
    assert.equal(proxyquire('./samples/using-node-modules', stubs).fn(), "bar0");
    assert.equal(proxyquire('./samples/using-node-modules', stubs).fn(), "bar0");

    // next call -> bar2. Module restored from cache
    assert.equal(proxyquire.onlyForProjectFiles().load('./samples/using-node-modules', stubs).fn(), "bar2");
    assert.equal(proxyquire.onlyForProjectFiles().load('./samples/using-node-modules', stubs).fn(), "bar3");

    proxyquire.forAllFiles();
  });
});