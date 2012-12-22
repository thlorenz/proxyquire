'use strict';

function ProxyquireError(msg) {
  this.name = 'ProxyquireError';
  Error.captureStackTrace(this, ProxyquireError);
  this.message = msg || 'An error occurred inside proxyquire.';
}

module.exports = ProxyquireError;
