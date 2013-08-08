'use strict';
/*jshint laxbreak:true, loopfunc:true*/

var path = require('path')
  , Module = require('module')
  , ProxyquireError = require('./proxyquire-error')
  , is = require('./is')
  ;

function fillMissingKeys(mdl, original) {
  Object.keys(original).forEach(function (key) {
    if (!mdl[key])  mdl[key] = original[key];
  });

  return mdl;
}

function validateArguments(request, stubs) {
  var msg = (function getMessage() {
    if (!request)
      return 'Missing argument: "request". Need it to resolve desired module.';

    if (!stubs)
      return 'Missing argument: "stubs". If no stubbing is needed, use regular require instead.';

    if (!is.String(request))
      return 'Invalid argument: "request". Needs to be a requirable string that is the module to load.';

    if (!is.Object(stubs))
      return 'Invalid argument: "stubs". Needs to be an object containing overrides e.g., {"path": { extname: function () { ... } } }.';
  })();

  if (msg) throw new ProxyquireError(msg);
}

function Proxyquire(parent) {
  var self = this
    , fn = self.load.bind(self)
    , proto = Proxyquire.prototype
    ;

  this._parent = parent;

  Object.keys(proto)
    .forEach(function (key) {
      if (is.Function(proto[key])) fn[key] = proto[key].bind(self);
    });

  self.fn = fn;
  return fn;
}

/**
 * Disables call thru, which determines if keys of original modules will be used
 * when they weren't stubbed out.
 * @name noCallThru
 * @function
 * @private
 * @return {object} The proxyquire function to allow chaining
 */
Proxyquire.prototype.noCallThru = function () {
  this._noCallThru = true;
  return this.fn;
};

/**
 * Enables call thru, which determines if keys of original modules will be used
 * when they weren't stubbed out.
 * @name callThru
 * @function
 * @private
 * @return {object} The proxyquire function to allow chaining
 */
Proxyquire.prototype.callThru = function () {
  this._noCallThru = false;
  return this.fn;
};

/**
 * Loads a module using the given stubs instead of their normally resolved required modules.
 * @param request The requirable module path to load.
 * @param stubs The stubs to use. e.g., { "path": { extname: function () { ... } } }
 * @return {*} A newly resolved module with the given stubs.
 */
Proxyquire.prototype.load = function (request, stubs) {
  validateArguments(request, stubs);

  // Find the ID (location) of the SUT, relative to the parent
  var id = Module._resolveFilename(request, this._parent);

  // Temporarily delete the SUT from the require cache, if it exists.
  var cached = Module._cache[id];
  if (cached) delete Module._cache[id];

  // Override the core require function for the SUT's file extension.
  var extname = path.extname(id);
  var ext_super = require.extensions[extname];

  var self = this;
  require.extensions[extname] = function ext(module, filename) {
    // NOTE: This function is for requiring the SUT

    // require_super is the normal require for the SUT.
    var require_super = module.require.bind(module);
    require_super.extensions = require.extensions;
    require_super.extensions[extname] = ext_super;
    require_super.main = process.mainModule;
    
    module.require = function (request) {
      // NOTE: This function is for requiring dependencies for the SUT

      // If the request string isn't stubbed, just do the usual thing.
      if (!stubs.hasOwnProperty(request)) return require_super(request);

      var stub = stubs[request];

      if (stub.hasOwnProperty('@noCallThru') ? !stub['@noCallThru'] : !self._noCallThru)
        fillMissingKeys(stub, require_super(request));

      return stub;
    };

    // Now that we've overridden the SUT's require, we can proceed as usual.
    return ext_super(module, filename);
  };

  try {
    return this._parent.require(request);
  } finally {
    if (cached)
      Module._cache[id] = cached;
    else
      delete Module._cache[id];

    if (ext_super)
      require.extensions[extname] = ext_super;
  }
};

module.exports = Proxyquire;
