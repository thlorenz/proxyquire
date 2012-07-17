var path   =  require('path')
  , fs     =  require('fs')
  , util   =  require('util')
  , existsSync = fs.existsSync || path.existsSync // support node 0.6 
  , active =  false
  , config = { }
  , testdirname
  , forceStrict
  ;

function ProxyquireError(msg) {
  this.name = 'ProxyquireError';
  this.message = msg || 'An error occurred inside proxyquire.';
}


function resolve (mdl, caller__dirname) {
  
  // Resolve relative file requires, e.g., './mylib'
  if ( mdl.match(/^(\.{1,2}\/)/) ) {

    if (!caller__dirname) {
      console.trace();
      throw new ProxyquireError('In order to resolve relative modules, caller__dirname is required');
    }

    // We use the __dirname of the script that is requiring, to get same behavior as if real require was called from it directly.
    return path.join(caller__dirname, mdl);

  } else {
    
    // Don't change references to global or 'node_module' requires, e.g. 'path' or absolute paths e.g. '/user/bin/module.js'
    return mdl;
  }
}

function addMissingProperties(mdl) {
  var orig = mdl.__proxyquire.original;
  
  // In strict mode we 'require' all properties to be used in tests to be overridden beforehand
  if (mdl.__proxyquire && (forceStrict || mdl.__proxyquire.strict)) return;
  
  // In non strict mode (default), we fill in all missing properties from the original module
  Object.keys(orig).forEach(function (key) {
    if (!mdl[key]) { 
      mdl[key] = orig[key];   
    } 
  });
}

//
// Main proxyquire function
// Replaces 'require' in to be tested files and serves as shortcut 'reset().add(..)' in tests
// 
function proxyquire(arg) {
  
  var callerArgs = arguments.callee.caller.arguments
    , caller__dirname = callerArgs[4]
    ;
    
  // Two options:
  //   a) arg is string - used by module that we are testing when it requires its dependencies
  //   b) arg is object - used as a shortcut to invoke reset and then add in one step

  if (arg) {
    
    if (typeof arg === 'string') {

      var resolvedPath = resolve(arg, caller__dirname);

      // Shortcut the process if we are not testing
      if (!active) return require(resolvedPath);

      // a) get overridden module or resolve it through original require
      if (config[arg]) {
        config[arg].__proxyquire = config[arg].__proxyquire || { };

        // Here is the only sure way to resolve the original require, so we attach it to the overridden module for later use
        // If non-strict and we didn't fill missing properties before ...
        if (!config[arg].__proxyquire.strict && !config[arg].__proxyquire.original) {
          config[arg].__proxyquire.original = require(resolvedPath);
          addMissingProperties(config[arg]);
        }

        return config[arg];
      } else {
        
        var original = require(resolvedPath);
        return original;
      }

    } else if (typeof arg === 'object') {
      
      // b) shortcut to reset and add overrides in one call
      return proxyquire
        .reset()
        .add(arg);

    } else {
      throw new ProxyquireError('arg needs to be string or object');
    }
  } else {
      throw new ProxyquireError('need to pass string or object argument');
  }
}

//
// proxyquire function also functions (npi) as an object that exposes proxyquire api.
// The proxyquire API contains all methods to be used in tests to configure proxyquire and require the to be tested module
//
(function attachApi () {

  function clearRequireCache() {
    Object.keys(require.cache).forEach(function (key) {
      if (key !==  __filename)
        delete require.cache[key];
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

  function removeProperty (mdl, prop) {
    if (config[mdl].__proxyquire && config[mdl].__proxyquire.strict) {
      delete config[mdl][prop];
    } else {
      
      // replace overridden property with the original one from the real module 
      if (config[mdl].__proxyquire && config[mdl].__proxyquire.original) { 

        if (!config[mdl].__proxyquire.original[prop]) {
          throw new ProxyquireError(
            'The property [' + prop + '] you are trying to remove does not exist on the original module!' + 
            ' What are you up to?'
          );
        }

        config[mdl][prop] = config[mdl].__proxyquire.original[prop];

      } else {
        throw new ProxyquireError(
          'Did not find original module when trying to replace stubbed property with original one.' +
          '\nPlease make sure to cause the module to be required before removing properties.'
        );
      }
    }
  }

  proxyquire.reset = function () { 
      config = { };
      clearRequireCache();
      active = true;
      return this;
  };

  proxyquire.setup = function (forceStrict) { 
      // Needs to be called at root of test file, so we can resolve its __dirname
      // Ideally this is done like so: var proxyquire = require('proxyquire').setup();
    
      var callerArgs = arguments.callee.caller.arguments
      ,  caller__dirname = callerArgs[4];
      
      if (!caller__dirname) {
        throw new ProxyquireError('Please call proxyquire.setup only from the TOP LEVEL of your test file!');
      }

      testdirname = caller__dirname;
      return this;
  };

  proxyquire.forceStrict = function (force) { 
      forceStrict = force === undefined || force;
      return this; 
  };

  proxyquire.add = function (arg) {
      Object.keys(arg).forEach(function (key) {
        addOverrides(arg[key], key); 
      });

      active = true;
      return this;
  };

  proxyquire.del = function (arg) {

      // Remove entire module
      if (typeof arg === 'string') {
        // Cannot delete module property here, since dependant holds reference to it and thus wouldn't be affected
        // Instead we need to remove all props to get them to point at the real required module

        Object.keys(config[arg]).forEach( function (p) {
          if (p !== '__proxyquire') removeProperty(arg, p);
        });

        return this;
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
            throw new ProxyquireError('argument to delete needs to be key: String, or key: Array[String] object');
          }
        }
        
      });

      return this;
  };

  proxyquire.require = function (arg, caller__dirname) {

      if (!testdirname && !caller__dirname) {
        throw new ProxyquireError(
          'Please call proxyquire.setup() from TOP LEVEL of your test file before using proxyquire.require!\n' +
          'Alternatively pass __dirname of test file as second argument to proxyquire.require.'
        );
      }

      // Automatically injects require override into code of the file to be required.
      // Saves result as new file and requires that file instead of the original one.
      // That way no change to original code is necessary in order to hook into proxyquire.
    
      function find(file) {
        var jsfile;

        // finds foo.js even if it is required as foo
        if (existsSync(file)) 
          return file;
        else {
          jsfile = file + '.js';
          if (existsSync(jsfile))
            return jsfile;
        }

        // Cannot find file
        throw new ProxyquireError(
          util.format('Cannot find file you required.\nTried [%s] and [%s]', file, jsfile) +
          '\nIf you are running tests from different files asynchronously, pass in scripts __dirname instead of using ' +
          'proxyquire.setup().'
        );
      }

      var originalFile    =  find(resolve(arg, caller__dirname || testdirname))
        , originalCode    =  fs.readFileSync(originalFile)
        , proxyquiredFile =  originalFile + '.proxyquirefied'
        , proxyquiredCode =  
            // all on first line (don't introduce new line in order to keep original and proxified line numbers matching)
            '/* START proxyquirefying (This file should have been removed after testing, please remove!) */'  +
            'var require = require("' + this._proxyquire + '"); '                                             +
            '/* END proxyquirefying Original code on this line: */ '                                          +
            originalCode
        , dependency
        ;
        
        fs.writeFileSync(proxyquiredFile, proxyquiredCode);

        try {
          dependency = require(proxyquiredFile);
        } catch (err) {
          console.trace();
          console.error(err);
          throw (err);
        } finally {
          // Make sure we remove the generated file even if require fails
          fs.unlinkSync(proxyquiredFile); 
        }

      return dependency;
  };

  proxyquire.print = function () { 
      console.log('config:');
      console.dir(this._getConfig());
      console.log('testdirname: ', testdirname);
      console.log('forceStrict: ', forceStrict);
  };

  // Diagnostics
  proxyquire._getConfig      =  function () { return config; };
  proxyquire._getForceStrict =  function () { return forceStrict; };
  proxyquire._getTestdirname =  function () { return testdirname; };
  
  // Don't touch below prop. Only here for testing purposes.
  proxyquire._proxyquire     =  'proxyquire';
}) ();

module.exports = proxyquire;
