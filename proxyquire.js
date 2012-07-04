var path = require('path')
  , stubbed = false
  ;

var config = { }; 
function addMissingProperties(mdl) {
  var orig = mdl.__proxyquire.original;
  
  // In strict mode we 'require' all properties to be used in tests to be overridden beforehand
  if (mdl.__proxyquire && mdl.__proxyquire.strict) return;
  
  // In non strict mode (default), we fill in all missing properties from the original module
  Object.keys(orig).forEach(function (key) {
    if (!mdl[key]) { 
      mdl[key] = orig[key];   
    } else {
      // Remember the original method in case we delete/unoverride it later
      mdl[key].orig = orig[key];
    }
  });
}

function addOverrides(mdl, name) {

  // Store it under the given name
  if (!config[name]) {

    // configure entire module if it was not configured before
    config[name] = mdl;

  } else {

    // otherwise just reconfigure it by adding/overriding given properties
    Object.keys(mdl).forEach(function (key) {
      config[name][key] = mdl[key];
    });

  }
}

function resolve (mdl, caller__dirname) {
  
  // Resolve relative file requires, e.g., './mylib'
  if ( mdl.match(/^(\.|\/)/) ) {

    if (!caller__dirname) throw new Exception('In order to resolve relative modules, caller__dirname is required');

    // We use the __dirname of the script that is requiring, to get same behavior as if real require was called from it directly.
    return path.join(caller__dirname, mdl);

  } else {
    
    // Don't change references to global or 'node_module' requires, e.g. 'path'
    return mdl;
  }

}

function removeProperty (mdl, prop) {
  if (config[mdl].__proxyquire && config[mdl].__proxyquire.strict) {
    delete config[mdl][prop];
  } else {
    
    // replace overridden property with the original one from the real module 
    if (config[mdl].__proxyquire && config[mdl].__proxyquire.original) { 

      if (!config[mdl].__proxyquire.original[prop]) {
        throw new Exception('The property [' + prop + '] you are trying to remove does not exist on the original module!' + 
                            ' What are you up to?');
      }

      config[mdl][prop] = config[mdl].__proxyquire.original[prop];

    } else {
      throw new Exception('Did not find original module when trying to replace stubbed property with original one.' +
                          '\nPlease make sure to cause the module to be required before removing properties.');
    }
  }
}

function getApi () {
  var self = {
      reset: function () { 
        config = { };
        return self;
      }
    , add: function (arg) {
        Object.keys(arg).forEach(function (key) {

          addOverrides(arg[key], key); 

        });

        stubbed = true;
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

      // Shortcut the process if we are not testing
      if (!stubbed) return require(resolvedPath);

      // a) get overridden module or resolve it through original require
      if (config[arg]) {
        config[arg].__proxyquire = config[arg].__proxyquire || { };

        // Here is the only sure way to resolve the original require, so we attach it to the overridden module for later use
        // If non-strict and we didn't fill missing properties before 
        if (!config[arg].__proxyquire.strict && !config[arg].__proxyquire.original) {
          config[arg].__proxyquire.original = require(resolvedPath);
          addMissingProperties(config[arg]);
        }

        return config[arg];
      } else {
        return require(resolvedPath);
      }

    } else if (typeof arg === 'object') {
      
      // b) shortcut to reset and add overrides in one call
      getApi()
        .reset()
        .add(arg);

    } else {

      throw new Exception('arg needs to be string or object');

    }
  } else {

    // c) allow configuration
    return getApi();

  }
};


module.exports = proxyquire;
