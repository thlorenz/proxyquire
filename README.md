# proxyquire

Proxies nodejs require in order to allow overriding dependencies during testing.

# Installation

    npm install proxyquire

# Usage

3 simple steps

- include `var require = require('proxyquire');` on top of any module whose requires you want to be able to control
- setup desired module overrides e.g., `proxyquire({ path: { extname: function () { return 'meh'; } });` in your test
- require the module you want to test and excercise its methods

# API

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
  module2 it is configured to be `strict` (see strict vs.  non-strict
  overrides)

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

For more examples look inside the [examples folder](./tree/master/examples/) or
look through the [tests](./blob/master/test/proxyquire.js)

