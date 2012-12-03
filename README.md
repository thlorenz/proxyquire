# proxyquire [![Build Status](https://secure.travis-ci.org/thlorenz/proxyquire.png)](http://travis-ci.org/thlorenz/proxyquire)

Proxies nodejs's require in order to make overriding dependencies during testing easy while staying **totally unobstrusive**.

# Features

- **no changes to your code** are necessary 
- non overriden methods of a module behave like the original
- mocking framework agnostic, if it can stub a function then it works with proxyquire
- "use strict" compliant

# Example

**foo.js:**

```javascript
var path = require('path');

module.exports.extnameAllCaps = function (file) { 
  return path.extname(file).toUpperCase();
};

module.exports.basenameAllCaps = function (file) { 
  return path.basename(file).toUpperCase();
};
```

**foo.test.js:**

```javascript
var proxyquire =  require('proxyquire')
  , assert     =  require('assert')
  , pathStub   =  { };

// when no overrides are specified, path.extname behaves normally
var foo = proxyquire(module, './foo', { 'path': pathStub });
assert.equal(foo.extnameAllCaps('file.txt'), '.TXT');

// override path.extname
pathStub.extname = function (file) { return 'Exterminate, exterminate the ' + file; };

// path.extname now behaves as we told it to
assert.equal(foo.extnameAllCaps('file.txt'), 'EXTERMINATE, EXTERMINATE THE FILE.TXT');

// path.basename and all other path module methods still function as before
assert.equal(foo.basenameAllCaps('/a/b/file.txt'), 'FILE.TXT');
```

**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Usage](#usage)
- [API](#api)
	- [Preventing call thru to original dependency](#preventing-call-thru-to-original-dependency)
	- [Creating a context](#creating-a-context)
	- [Setting a contextual module](#setting-a-contextual-module)
	- [Prevent call thru for all stubs in a context](#prevent-call-thru-for-all-stubs-in-a-context)
		- [Re-enable call thru for all stubs in a context](#re-enable-call-thru-for-all-stubs-in-a-context)
	- [All together, now](#all-together-now)
	- [Examples](#examples)
- [Backwards Compatibility for proxyquire v0.3.x](#backwards-compatibility-for-proxyquire-v03x)
- [More Examples](#more-examples)

# Usage

Two simple steps to override require in your tests:

- add `var proxyquire = require('proxyquire');` to top level of your test file
- `proxyquire(...)` the module you want to test and pass along stubs for modules you want to override

# API

***proxyquire({Module} parent, {string} request, {Object} stubs)***

- **parent**: the module running the test. i.e., `module`
- **request**: path to the module to be tested e.g., `../lib/foo`
- **stubs**: key/value pairs of the form `{ modulePath: stub, ... }`
    - module paths are relative to the tested module **not** the test file 
    - therefore specify it exactly as in the require statement inside the tested file
    - values themselves are key/value pairs of functions/properties and the appropriate override

## Preventing call thru to original dependency

By default proxyquire calls the function defined on the *original* dependency whenever it is not found on the stub.

If you prefer a more strict behavior you can prevent *callThru* on a per module or contextual basis.

If *callThru* is disabled, you can stub out modules that don't even exist on the machine that your tests are running on.
While I wouldn't recommend this in general, I have seen cases where it is legitimately useful (e.g., when requiring
global environment configs in json format that may not be available on all machines).

**Prevent call thru on path stub:**

```javascript
var foo = proxyquire(module, './foo', {
  path: {
      extname: function (file) { ... }
    , '@noCallThru': true
  }
});
```

## Creating a context

For more advanced configuration, you can create a context by calling `proxyquire.create`. This enables a fluent API that
lets you do a few things.

## Setting a contextual module

If you plan on calling `proxyquire` several times in a test, you can default the module like so:

```javascript
var proxyquire = require('proxyquire').create().fromModule(module);

var foo = proxyquire('./foo', stubs);
```

## Prevent call thru for all stubs in a context

```javascript
var proxyquire = require('proxyquire').create().noCallThru();
```

### Re-enable call thru for all stubs in a context

```javascript
proxyquire.callThru();
```

**Call thru config per module wins:**

```javascript
var foo = proxyquire
    .noCallThru()
    .load(module, './foo', {

        // no calls to original './bar' methods will be made
        './bar' : { toAtm: function (val) { ... } }

        // for 'path' module they will be made
      , path: { 
          extname: function (file) { ... } 
        , '@noCallThru': false
        }
    });
```

## All together, now

```javascript
var proxyquire = require('proxyquire').create().fromModule(module).noCallThru();
var foo = require('./foo', stubs);

proxyquire.callThru();

var foo2 = require('./foo', stubs);
```

## Examples

**We are testing foo which depends on bar:**

```javascript
// bar.js module
module.exports = { 
    toAtm: function (val) { return  0.986923267 * val; }
};

// foo.js module 
// requires bar which we will stub out in tests
var bar = require('./bar');
[ ... ]

```

**Tests:**

```javascript
// foo-test.js module which is one folder below foo.js (e.g., in ./tests/)

/*
 *   Option a) Resolve and override in one step:
 */
var foo = proxyquire(module, '../foo', {
  './bar': { toAtm: function (val) { return 0; /* wonder what happens now */ } }
});

// [ .. run some tests .. ]

/*
 *   Option b) Resolve with empty stub and add overrides later
 */
var barStub = { };

var foo =  proxyquire(module, '../foo', { './bar': barStub });

// Add override
bar.toAtm = function (val) { return 0; /* wonder what happens now */ };

[ .. run some tests .. ]

// Change override
bar.toAtm = function (val) { return -1 * val; /* or now */ };

[ .. run some tests .. ]

// Resolve foo and override multiple of its dependencies in one step - oh my!
var foo = proxyquire(module, './foo', {
    './bar' : { 
      toAtm: function (val) { return 0; /* wonder what happens now */ } 
    }
  , path    : { 
      extname: function (file) { return 'exterminate the name of ' + file; } 
    }
});
```

# Backwards Compatibility for proxyquire v0.3.x

To upgrade your project from v0.3.x to v0.4.x, a nifty compat function has been included. Simply do a
global find and replace for `require('proxyquire')` and change them to `require('proxyquire').compat(module)`. This
returns an object that wraps the result of `proxyquire.create().fromModule(...)` that provides exactly
the same API as v0.3.x.

If your test scripts relied on the fact that v0.3.x stored `noCallThru` in the module scope, you can use
`require('proxyquire').compat(module, true)` to use a global compat object, instead.

# More Examples

For more examples look inside the [examples folder](./proxyquire/tree/master/examples/) or
look through the [tests](./proxyquire/blob/master/test/proxyquire.js)

**Specific Examples:**

- test async APIs synchronously: [examples/async](./proxyquire/tree/master/examples/async).
- using proxyquire with [Sinon.JS](http://sinonjs.org/): [examples/sinon](./proxyquire/tree/master/examples/sinon).

