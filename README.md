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
var foo = proxyquire.resolve('./foo', __dirname, { 'path': pathStub });
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
	- [Resolve module to be tested and configure stubs](#resolve-module-to-be-tested-and-configure-stubs)
    - [Preventing call thru to original dependency](#preventing-call-thru-to-original-dependency)
	- [Changing the TmpDir](#changing-the-tmpdir)
    - [Examples](#examples)
- [More Examples](#more-examples)


# Usage

Two simple steps to override require in your tests:

- add `var proxyquire = require('proxyquire');` to top level of your test file
- `proxyquire.resolve(...)` the module you want to test and pass along stubs for modules you want to override

# API

## Resolve module to be tested and configure stubs

***proxyquire.resolve({string} mdl, {string} test__dirname, {Object} stubs)***

- **mdl**: path to the module to be tested e.g., `../lib/foo`
- **test__dirname**: the `__dirname` of the module containing the tests
- **stubs**: key/value pairs of the form `{ modulePath: stub, ... }`
    - module paths are relative to the tested module **not** the test file 
    - therefore specify it exactly as in the require statement inside the tested file
    - values themselves are key/value pairs of functions/properties and the appropriate override

## Preventing call thru to original dependency

By default proxyquire calls the function defined on the *original* dependency whenever it is not found on the stub.

If you prefer a more strict behavior you can prevent *callThru* on a per module or global basis.

**Prevent call thru on path stub:**

```javascript
var foo = proxyquire.resolve('./foo', __dirname, {
  path: { 
      extname: function (file) { ... } 
    , '@noCallThru': true
  }
});
```

**Prevent call thru for all future stubs:**

```javascript
proxyquire.noCallThru();
```

**Re-enable call thru for all future stubs:**

```javascript
proxyquire.noCallThru(false);
```

**Call thru config per module wins:**

```javascript
var foo = proxyquire
    .noCallThru()
    .resolve('./foo', __dirname, {

        // no calls to original './bar' methods will be made
        './bar' : { toAtm: function (val) { ... } }

        // for 'path' module they will be made
      , path: { 
          extname: function (file) { ... } 
        , '@noCallThru': false
        }
    });
```

## Changing the TmpDir

***proxyquire.tmpDir({string} tmpdir)***

In order to hook into your code, proxyquire writes some intermediate files into the tmp directory.

By default it will use the *TMPDIR* of your environment, but this method allows you to override it.

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
var foo = proxyquire.resolve('../foo', __dirname, {
  './bar': { toAtm: function (val) { return 0; /* wonder what happens now */ } }
});

// [ .. run some tests .. ]

/*
 *   Option b) Resolve with empty stub and add overrides later
 */
var barStub = { };

var foo =  proxyquire.resolve('../foo', __dirname, { './bar': barStub }); 

// Add override
bar.toAtm = function (val) { return 0; /* wonder what happens now */ };

[ .. run some tests .. ]

// Change override
bar.toAtm = function (val) { return -1 * val; /* or now */ };

[ .. run some tests .. ]

// Resolve foo and override multiple of its dependencies in one step - oh my!
var foo = proxyquire.resolve('./foo', __dirname, {
    './bar' : { 
      toAtm: function (val) { return 0; /* wonder what happens now */ } 
    }
  , path    : { 
      extname: function (file) { return 'exterminate the name of ' + file; } 
    }
});
```

# More Examples

For more examples look inside the [examples folder](./proxyquire/tree/master/examples/) or
look through the [tests](./proxyquire/blob/master/test/proxyquire.js)

**Specific Examples:**

- test async APIs synchronously: [examples/async](./proxyquire/tree/master/examples/async).
- using proxyquire with [Sinon.JS](http://sinonjs.org/): [examples/sinon](./proxyquire/tree/master/examples/sinon).

