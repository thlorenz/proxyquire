/*jshint laxbreak:true*/
"use strict";

var path            =  require('path')
  , fs              =  require('fs')
  , util            =  require('util')
  , existsSync      =  fs.existsSync || path.existsSync // support node <=0.6
  , registeredStubs =  { }
  , stubkey         =  0
  , tmpDir          =  getTmpDir()
  , callThru        =  true
  , is              =  { }
  ;
  
(function populateIs () {
  ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name) {
    is[name] = function(obj) {
      return Object.prototype.toString.call(obj) == '[object ' + name + ']';
    };
    is.Object = function(obj) {
      return obj === new Object(obj);
    };
  });
}) ();

function getTmpDir () {
  var defaultTmp = '/tmp'
    , envVars = ['TMPDIR', 'TMP', 'TEMP']
    ;

  for (var i = 0; i < envVars.length; i++) {
    var key = envVars[i];
    if(process.env[key]) return fs.realpathSync(process.env[key]);
  }

  return fs.realpathSync(defaultTmp);
}

function ProxyquireError(msg) {
  this.name = 'ProxyquireError';
  this.message = msg || 'An error occurred inside proxyquire.';
}

function isRelativePath(p) {
  return p.match(/^(\.{1,2}\/)/);
}

function findFile(file) {
  var jsfile;

  // finds foo.js even if it is required as foo
  if (existsSync(file)) 
    return file;
  else {
    jsfile = file + '.js';
    if (existsSync(jsfile))
      return jsfile;
  }

  console.trace();
  throw new ProxyquireError(
    util.format('Cannot find file you required.\nTried [%s] and [%s]', file, jsfile)
  );
}

function normalizeExtension (file) {
  if (path.extname(file) !== '') return file;
  return file + '.js';
}

function fillMissingKeys(mdl, original) {

  Object.keys(original).forEach(function (key) {
    if (!mdl[key])  mdl[key] = original[key];   
  });

  return mdl;
}

function validateArguments(mdl, test__dirname, stubs) {
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

  Object.keys(stubs).forEach(function (key) {
    if (is.Function(stubs[key]))
      throw new ProxyquireError(
          '\n\tFound "' + key + '" to be an orphan stub. Please specify what module the stub is for.'
        + '\n\tFor example: { "./foo": ' + key + ' }'
      );
    
  });
}

/**
* Overrides default tmp dir used by proxyquire to store modified modules before they are required.
* @name setTmpDir
* @function
* @param {string} tmpdir The path to the tmp dir to be used
*/
function setTmpDir(tmpdir) {
  if (!existsSync(tmpdir)) {
    console.trace();
    throw new ProxyquireError('%s doesn\'t exist, so it cannot be used as a tmp dir.', tmpdir);
  }
  tmpDir = tmpdir;
}

/**
  * Overrides default setting for call thru, which determines if keys of original modules will be used
  * when they weren't stubbed out.
  * @name noCallThru
  * @function 
  * @param {boolean} [ flag = true ]
  * @return {object} proxyquire exports to allow chaining
  */
function noCallThru(flag) {
  // default to true when 'flag' is flagt supplied
  callThru = flag === false;
  return module.exports;
}

function proxyquire (mdl, proxy__filename, original__dirname) {
  var mdlResolve = isRelativePath(mdl) ? path.join(original__dirname, mdl) : mdl
    , original = require(mdlResolve)
    , registeredMdl;

  if (registeredStubs[proxy__filename]) {
    registeredMdl =  registeredStubs[proxy__filename][mdl];

    if (registeredMdl)
      return registeredMdl['@noCallThru'] ?
        registeredMdl                     :  
        fillMissingKeys(registeredMdl, original);
  }

  return original;
}

function resolve (mdl, test__dirname, stubs) {

  validateArguments(mdl, test__dirname, stubs);

  var mdlPath        =  isRelativePath(mdl) ? path.join(test__dirname, mdl) : mdl
    , resolvedMdl    =  require.resolve(mdlPath)
    , resolvedFile   =  findFile(resolvedMdl)
    , originalCode   =  fs.readFileSync(resolvedFile)
    , mdlProxyFile   =  path.basename(resolvedFile) + '@' + (stubkey++).toString()
    , resolvedProxy  =  path.join(tmpDir, normalizeExtension(mdlProxyFile))
    // all code will be written on one line, prepended to whatever was on first line to maintain linenos
    , mdlProxyCode = 
        ['function require(mdl) { '
        , 'return module'
        ,   '.require("' , __filename, '")'
        ,   '.require(mdl, "' + resolvedProxy + '", "' + path.dirname(resolvedFile) + '"); '
        , '} '
        , originalCode 
        ].join('')
    , dependency
    ;

  if (stubs) { 
    // Adjust no call thru settings for each stubbed module if it was overridden globally
    if (!callThru) {
      Object.keys(stubs).forEach(function (key) {
        // allow turning call thru back on per module by setting it to false
        if (stubs[key]['@noCallThru'] !== false) stubs[key]['@noCallThru'] = true;
      });
    }
      
    registeredStubs[resolvedProxy] = stubs;
  }

  fs.writeFileSync(resolvedProxy, mdlProxyCode);

  try {
    dependency = require(resolvedProxy);
  } catch (err) {
    console.trace();
    console.error(err);
    throw (err);
  } finally {
    // Make sure we remove the generated file even if require fails
    fs.unlinkSync(resolvedProxy); 
  }

  return dependency;
}

module.exports = {
    resolve    :  resolve
  , require    :  proxyquire
  , tmpDir     :  setTmpDir
  , noCallThru :  noCallThru
};
