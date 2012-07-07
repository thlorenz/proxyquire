**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [proxyquire ](#proxyquire)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
	- [proxyquire.setup()](#proxyquiresetup)
	- [proxyquire.require(String [, String])](#proxyquirerequirestring-[-string])
	- [proxyquire.reset()](#proxyquirereset)
	- [proxyquire.add(Object)](#proxyquireaddobject)
	- [proxyquire(Object)](#proxyquireobject)
	- [proxyquire.del(String | Object)](#proxyquiredelstring-|-object)
	- [strict vs. non-strict overrides](#strict-vs-non-strict-overrides)
		- [Non-strict](#non-strict)
		- [Strict](#strict)
	- [Chaining API Calls](#chaining-api-calls)
	- [More Examples](#more-examples)

# proxyquire 
[![Build Status](https://secure.travis-ci.org/thlorenz/proxyquire.png)](http://travis-ci.org/thlorenz/proxyquire)

Proxies nodejs require in order to allow overriding dependencies during testing.

**No changes to your code** are necessary!

Just configure overrides in your tests and **proxyquire** does the rest.

# Installation

    npm install proxyquire

# Usage

Three simple steps to override require in your tests:

- `var proxyquire = require('proxyquire').setup();` on top level of your test file
- setup desired module overrides e.g., `proxyquire({ path: { extname: function () { return 'meh'; } });` in your test
- `proxyquire.require(..)` the module you want to test and excercise its methods

Alternatively if you are more worried about test speed and/or are testing very large modules:

- include `var require = require('proxyquire');` on top of any module whose requires you want to be able to control
- setup desired module overrides (same as above)
- use regular nodejs `require` in order to require the module you want to test and excercise its methods

# API

## proxyquire.setup()

- needs to be called from **top level of test file**
- needed to properly setup **proxyquire** for the use of `proxyquire.require(..)`
- ideally you do this like so: `var proxyquire = require('proxyquire').setup();`

## proxyquire.require(String [, String])

Works the same as nodejs's `require` with one major difference:

- without touching the original code `proxyquire.require` injects a `require` override before passing it on to nodejs's `require`
- therefore you need to add **no changes to your code**
- optional second argument can be used to manually pass `__dirname` of test file, but ideally this would be done via `proxyquire.setup`

## proxyquire.reset()
    
- resets any registered overrides
- flushes nodejs's require cache in order to force re-requiring the module you
  are testing, in order to cause any new overridden modules to be re-required as well
- this is useful if you want to entirely start over in overriding dependencies

## proxyquire.add(Object)

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

Overrides given modules:

- note that a relative path to the module can be given 
    - **Important**: this is the path as it appears inside the module you are testing, proxyquire will resolve it as if it was required from that module
- `__proxyquire` property allows to further configure overrides. In the case of
  module2 it is configured to be `strict` see [strict vs. non-strict
  overrides](#strict-vs-non-strict-overrides)

## proxyquire(Object)

A shortcut which calls `proxyquire.reset()` and then `proxyquire.add(Object)`

## proxyquire.del(String | Object)

Removes overrides and replaces them with method of the real module unless it was overridden using **strict** mode.

**Examples:** *assuming `path.extname` and `path.basename` were overridden previously*

```javascript
proxyquire.del('path');
```

Removes all `path` module overrides.


```javascript
proxyquire.del({ path: 'extname' });
```

Removes only `path.extname` override.

```javascript
proxyquire.del({ path: [ 'extname', 'basename' ] });
```

Explicitly removes `path.extname` and `path.basename` overrides. (In this case
this has the same effect as overriding entire `path` module).

## strict vs. non-strict overrides

Controls what happens when a function that wasn't overridden (added) via **proxyquire** is called.

In **non-strict** mode **proxyquire** will call the method with the same name on the 'real' module.

In **strict** mode **proxyquire** will fail with `has no method ...` exception

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

## Chaining API Calls

**proxyquire**'s API supports chaining of method calls during setup.

Things like:

```javascript
proxyquire
  .reset()
  .add({
    path: { extname: function (x) { return 'what?'; } 
  })
  .add({
    fs: { realpath: function (x, y) { return 'no really, what?'; } 
  })
  .del('path')
  ;
```

are perfectly legal. 
Yes I know this example is totally contrived, but it shows lots of possibilities in one shot ;) .

## More Examples

For more examples look inside the [examples folder](./proxyquire/tree/master/examples/) or
look through the [tests](./proxyquire/blob/master/test/proxyquire.js)

