# proxyquire [![Build Status](https://secure.travis-ci.org/thlorenz/proxyquire.png)](http://travis-ci.org/thlorenz/proxyquire)

Proxies nodejs's require in order to make overriding dependencies during testing easy while staying **totally unobstrusive**.

# Features

- **no changes to your code** are necessary 
- non overriden methods of a module behave like the original
- overrides can be removed individually after they were added
- strict mode to enforce overriding all methods used in a to be tested module

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
var proxyquire = require('proxyquire').setup()
  , assert = require('assert');

// no overrides yet, so path.extname behaves normally
var foo = proxyquire.require('./foo');
assert.equal(foo.extnameAllCaps('file.txt'), '.TXT');

// override path.extname
proxyquire({
  path: { extname: function (file) { return 'Exterminate, exterminate the ' + file; } }
});

// path.extname now behaves as we told it to
foo = proxyquire.require('./foo');
assert.equal(foo.extnameAllCaps('file.txt'), 'EXTERMINATE, EXTERMINATE THE FILE.TXT');

// path.basename and all other path module methods still function as before
assert.equal(foo.basenameAllCaps('/a/b/file.txt'), 'FILE.TXT');
```

**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
    - [Setup proxyquire inside test](#setup-proxyquire-inside-test)
    - [Require module to be tested](#require-module-to-be-tested)
    - [Reset all overrides](#reset-all-overrides)
    - [Override methods of required modules](#override-methods-of-required-modules)
    - [Reset and override in one step](#reset-and-override-in-one-step)
    - [Removing overrides](#removing-overrides)
    - [Forcing strict for all overrides](#forcing-strict-for-all-overrides)
    - [Chain API Calls](#chain-api-calls)
    - [strict vs. non-strict overrides](#strict-vs-non-strict-overrides)
        - [Non-strict](#non-strict)
        - [Strict](#strict)
- [More Examples](#more-examples)

# Installation

    npm install proxyquire

# Usage

Three simple steps to override require in your tests:

- `var proxyquire = require('proxyquire').setup();` on top level of your test file
- setup desired module overrides e.g., `proxyquire({ path: { extname: function () { return 'meh'; } });` in your test
- `proxyquire.require(..)` the module you want to test and excercise its methods

Alternatively if you are worried about test speed and/or are testing very large modules:

- include `var require = require('proxyquire');` on top of any module whose requires you want to be able to control
- setup desired module overrides (same as above)
- use regular nodejs `require` in order to require the module you want to test and excercise its methods

# API

## Setup proxyquire inside test

***var proxyquire = require('proxyquire').setup();***

- needs to be called from **top level of test file**
- properly sets up calls to `proxyquire.require(..)`

## Require module to be tested

***proxyquire.require(String [, String])***

Works the same as nodejs's `require` while preparing the to be tested module to have its dependencies overridden.

- without touching the original code `proxyquire.require` injects a `require` override before passing it on to nodejs's `require`
- since this happens automatically, **you don't need to change the code** of the module whose dependencies you want to override
- optional second argument can be used to manually pass `__dirname` of test file, but ideally this would be done via `proxyquire.setup()`

## Reset all overrides

***proxyquire.reset()***

Useful if you want to entirely start over in overriding dependencies.

- resets any registered overrides
- flushes nodejs's require cache in order to force re-requiring the module you
  are testing, in order to cause any new overridden modules to be re-required as well

## Override methods of required modules

***proxyquire.add(Object)***

Adds overrides for given methods in particular modules.

**Example:**

```javascript
proxyquire.add({
    './module1': {
          prop: /* override */
        , func: function () { /* override */ }
        }
  ,  module2: {
          prop: /* override */
        , func: function () { /* override */ }
        , __proxyquire: { strict: true }
        }
  });
```


- note that a relative path to the module can be given (`'./module1'`)
    - **Important**: this is the path as it appears inside the module you are testing, proxyquire will resolve it as if it was required from that module
- `__proxyquire` property allows to further configure overrides. In the case of
  module2 it is configured to be `strict` see [strict vs. non-strict
  overrides](#strict-vs-non-strict-overrides)

## Reset and override in one step

***proxyquire(Object)***

A shortcut which calls `proxyquire.reset()` and then `proxyquire.add(Object)`

## Removing overrides

***proxyquire.del(String | Object)***

Removes overrides and replaces them with method of the real module unless it was overridden using **strict** mode.

## Forcing strict for all overrides

***proxyquire.forceStrict([force])***

Allows to enforce [strict mode](#strict-vs-non-strict-overrides) for all overrides, even if they aren't explicitly declared as strict.

- force parameter is optional and if not present `true` is assumed, thus
  `forceStrict()` has the same effect as `forceStrict(true)`
- if force parameter is false, strict mode is no longer enforced e.g., things
  are back to normal
- note that once the strict mode is changed, it will stay so for the entire
  lifetime of proxyquire even if [reset](#reset-all-overrides) is called.
- once strict mode is enforced, you may change it back to non-strict mode via `forceStrict(false)`

**Examples:** 

Assume `path.extname` and `path.basename` were overridden previously.

Remove all `path` module overrides:

```javascript
proxyquire.del('path');
```


Remove only `path.extname` override:

```javascript
proxyquire.del({ path: 'extname' });
```


Explicitly remove `path.extname` and `path.basename` overrides. (In this case
this has the same effect as overriding entire `path` module):

```javascript
proxyquire.del({ path: [ 'extname', 'basename' ] });
```

## Chain API Calls

**proxyquire**'s API supports chaining of method calls during setup.

Things like:

```javascript
proxyquire
  .enforceStrict()
  .reset()
  .add({
    path: { extname: function (x) { return 'what?'; } 
  })
  .add({
    fs: { realpath: function (x, y) { return 'no really, what?'; } 
  })
  ;
```

are perfectly legal. 

## strict vs. non-strict overrides

Controls what happens when a function that wasn't overridden (added) via **proxyquire** is called.

In **non-strict** mode **proxyquire** will call the method with the same name on the 'real' module.

In **strict** mode **proxyquire** will fail with `has no method ...` exception

The default strict mode can be changed by [forcing strict for all overrides](#forcing-strict-for-all-overrides).

**Examples:**

### Non-strict

```javascript
proxyquire.add({
    path: { extname: function (x) { return 'what?'; } 
})
require('path').basename('/a/b/c.txt') // returns 'c.txt'
```

### Strict

```javascript
proxyquire.add({
    path: { extname: function (x) { return 'what?'; } 
  , __proxyquire: { strict: true }
})
require('path').basename('/a/b/c.txt') // will throw an error
```

# More Examples

For more examples look inside the [examples folder](./proxyquire/tree/master/examples/) or
look through the [tests](./proxyquire/blob/master/test/proxyquire.js)

