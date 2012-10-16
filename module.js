// This works, but since we are not creating a *real* module, there may be problems with this approach
'use strict';
var path = require('path');
var runInThisContext = require('vm').runInThisContext;

function Module(parent) {
  this.exports = {};
  this.parent = parent;
  if (parent && parent.children) {
    parent.children.push(this);
  }

  this.filename = null;
  this.children = [];
  this.require = require;
}

function wrap (script) {
  return [
      '(function (exports, require, module, __filename, __dirname) { '
    , script
    , 'return module;'
    , '\n});'
    ].join('');
}

Module.prototype.compile = function(content, filename, requireOverride) {
  var self = this;
  self.id = filename;

  // remove shebang
  content = content.replace(/^\#\!.*/, '');

  function require (path) {
    return requireOverride(path);
  }

  require.resolve = function(request) {
    // TODO:
    return Module._resolveFilename(request, self);
  };

  require.main = process.mainModule;
  require.cache = module.require.cache;

  var dirname = path.dirname(filename);
  
  // create wrapper function
  var wrapper = wrap(content);

  var compiledWrapper = runInThisContext(wrapper, filename, true);
  var args = [self.exports, require, self, filename, dirname];
  return compiledWrapper.apply(self.exports, args);
};

module.exports = Module;

if (module.parent) return;
