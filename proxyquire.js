'use strict';
/*jshint laxbreak:true, loopfunc:true*/

var path = require('path')
  , Module = require('module')
  , is = { }
  ;

// delete proxyquire from cache to force re-require in order to allow resolving test module via parent.module
delete require.cache[require.resolve(__filename)];

(function populateIs() {
  ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function (name) {
    is[name] = function (obj) {
      return Object.prototype.toString.call(obj) == '[object ' + name + ']';
    };
    is.Object = function (obj) {
      return obj === new Object(obj);
    };
  });
})();

function ProxyquireError(msg) {
  this.name = 'ProxyquireError';
  this.message = msg || 'An error occurred inside proxyquire.';
}

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

function Proxyquire() {
  var fn = this.load.bind(this);

  for (var key in Proxyquire.prototype)
    if (is.Function(this[key]) && Proxyquire.prototype.hasOwnProperty(key))
      fn[key] = this[key].bind(this);

  this.fn = fn;
  return fn;
}

/**
 * Sets the module to be used for the proxyquire context.
 * @param module The calling module.
 * @return {*} The proxyquire function for chaining.
 */
Proxyquire.prototype.fromModule = function (module) {
  this._parentModule = module;
  return this.fn;
};

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
  var parent = module.parent;
  request = arguments[0];
  stubs = arguments[1];

  validateArguments(request, stubs);

  var self = this, interceptedExtensions = {};

  for (var key in stubs) {
    if (!stubs.hasOwnProperty(key)) continue;

    var extname = path.extname(stubs[key]) || '.js';

    // Have we already setup the interceptor on this extension?
    if (interceptedExtensions.hasOwnProperty(extname)) continue;

    var ext_super = interceptedExtensions[extname] = require.extensions[extname];

    require.extensions[extname] = function ext(module, filename) {
      var require_super = module.require.bind(module);

      module.require = function (request) {
        if (stubs.hasOwnProperty(request)) {
          var stub = stubs[request];

          if (stub.hasOwnProperty('@noCallThru') ? !stub['@noCallThru'] : !self._noCallThru)
            fillMissingKeys(stub, require_super(request));

          return stub;
        }

        return require_super(request);
      };

      return ext_super(module, filename);
    };
  }

  var id = Module._resolveFilename(request, parent);
  var cached = Module._cache[id];
  if (cached) delete Module._cache[id];

  try {
    return parent.require(request);
  } finally {
    if (cached)
      Module._cache[id] = cached;
    else
      delete Module._cache[id];

    if (interceptedExtensions)
      for (key in interceptedExtensions)
        if (interceptedExtensions.hasOwnProperty(key))
          require.extensions[key] = interceptedExtensions[key];
  }
};

module.exports        =  new Proxyquire().load;
module.exports.create =  function () { return new Proxyquire(); };
module.exports.compat =  require('./compat').init(Proxyquire, ProxyquireError, is);
