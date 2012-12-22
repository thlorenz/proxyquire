'use strict';

var Proxyquire = require('./proxyquire')
  , ProxyquireError = require('./proxyquire-error')
  , is = require('./is');

//
// Compatibility Support 0.3.x
//

function validateArgments(mdl, test__dirname, stubs) {
  if (!mdl)
    throw new ProxyquireError(
      'Missing argument: "mdl". Need it know to which module to require.'
    );

  if (!test__dirname)
    throw new ProxyquireError(
      'Missing argument: "__dirname" of test file. Need it to resolve module relative to test directory.'
    );

  if (!stubs)
    throw new ProxyquireError(
      'Missing argument: "stubs". If no stubbing is needed for [' + mdl + '], use regular require instead.'
    );

  if (!is.String(mdl))
    throw new ProxyquireError(
      'Invalid argument: "mdl". Needs to be a string that contains path to module to be resolved.'
    );

  if (!is.String(test__dirname))
    throw new ProxyquireError(
      'Invalid argument: "__dirname" of test file. Needs to be a string that contains path to test file resolving the module.'
    );

  if (!is.Object(stubs))
    throw new ProxyquireError(
      'Invalid argument: "stubs". Needs to be an object containing overrides e.g., {"path": { extname: function () { ... } } }.'
    );
}

function CompatProxyquire() {}

CompatProxyquire.prototype = Object.create(Proxyquire.prototype);
CompatProxyquire.prototype.constructor = CompatProxyquire;

CompatProxyquire.prototype._parent = null;

CompatProxyquire.prototype.load = function(mdl, parent, stubs) {
  this._parent = parent;

  try {
    return Proxyquire.prototype.load.call(this, mdl, stubs);
  } finally {
    this._parent = null;
  }
};

var globalCompatProxyquire = globalCompatProxyquire || new CompatProxyquire();

function compat(parent, useGlobal) {
  var pq = useGlobal ? globalCompatProxyquire : new CompatProxyquire();

  var compat_ = function (mdl, test__dirname, stubs) {
    validateArgments.apply(null, arguments);
    return pq.load(mdl, parent, stubs);
  };

  compat_.resolve = compat_;

  compat_.tmpDir = function () {};

  compat_.noCallThru = function (flag) {
    if (flag !== false)
      pq.noCallThru();
    else
      pq.callThru();

    return compat_;
  };

  return compat_;
}

module.exports = compat;
