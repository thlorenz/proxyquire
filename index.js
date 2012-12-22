'use strict';

var Proxyquire = require('./lib/proxyquire')
  , compat = require('./lib/compat');

// delete this module from the cache to force re-require in order to allow resolving test module via parent.module
delete require.cache[require.resolve(__filename)];

module.exports = new Proxyquire(module.parent);
module.exports.compat = function (useGlobal) { return compat(module.parent, useGlobal); };
