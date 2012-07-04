var path = require('path')
  , util = require('util')
  ;

var config = { }; 

function removeProperty (mdl, prop) {
  // replace overridden property with the original one from the real module 
  // if strict mode was used, it will be undefined and will throw if called, which is what we want
  config[mdl][prop] = config[mdl][prop].orig;
}

function getApi () {
  var self = {
      reset: function () { 
        config = { };
        return self;
      }
    , add: function (arg) {
        proxyquire(arg);
        return self;
      }
    , del: function (arg) {

        // Remove entire module
        if (typeof arg === 'string') {
          delete config[arg];
          return self;
        }

        // Remove only specified properties of the given module
        Object.keys(arg).forEach( function (mdl) {

          if (config[mdl]) {
            var prop = arg[mdl];

            if (typeof prop === 'string') {

              removeProperty(mdl, prop);

            } else if (Array.isArray(prop)) {

              prop.forEach(function (p) {
                removeProperty(mdl, p);
              });

            } else {
              throw new Exception('argument to delete needs to be key: String, or key: Array[String] object');
            }
          }
          
        });

        return self;
      }
  };
  return self;
}

function addOverrides(mdl, name, resolvedName) {

  // Store it under the given name (resolvedName is only used to make real require work)
  if (!config[name]) {
    // configure entire module if it was not configured before
    config[name] = mdl;
  } else {
    // otherwise just reconfigure it by adding/overriding given properties
    Object.keys(mdl).forEach(function (key) {
      config[name][key] = mdl[key];
    });
  }
  
  // In strict mode we 'require' all properties to be used in tests to be overridden beforehand
  if (mdl.__proxyquire && mdl.__proxyquire.strict) return;

  // In non strict mode (default), we fill in all missing properties from the original module
  var orig = require(resolvedName);
  Object.keys(orig).forEach(function (key) {
    if (!mdl[key]) { 
      mdl[key] = orig[key];   
    } else {
      // Remember the original method in case we delete/unoverride it later
      mdl[key].orig = orig[key];
    }
  });
}

function resolve (mdl, caller__dirname) {
  
  // Resolve relative file requires, e.g., './mylib'
  return  mdl.match(/^(\.|\/)/) ? 

    // We use the __dirname of the script that is requiring, to get same behavior as if real require was called from it directly.
    path.join(caller__dirname, mdl) : 
    
    // Don't change references to global or 'node_module' requires, e.g. 'path'
    mdl;

}

function proxyquire(arg) {
  
  var callerArgs = arguments.callee.caller.arguments
    , caller__dirname = callerArgs[4]
    ;
    
  // Three options:
  //   a) arg is string 
  //   b) arg is object
  //   c) no arg at all

  if (arg) {
    
    if (typeof arg === 'string') {

      var resolvedPath = resolve(arg, caller__dirname);

      // a) get overridden module or resolve it through original require
      return config[arg] ? config[arg] : require(resolvedPath);

    } else if (typeof arg === 'object') {
      
      // b) add more overrides
      Object.keys(arg).forEach(function (key) {

        var resolvedKey = resolve(key, caller__dirname);
        addOverrides(arg[key], key, resolvedKey); 

      });

    } else {

      throw new Exception('arg needs to be string or object');

    }
  } else {

    // c) allow configuration
    return getApi();

  }
};


module.exports = proxyquire;
