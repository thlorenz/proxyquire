var path            =  require('path')
  , fs              =  require('fs')
  , util            =  require('util')
  , existsSync      =  fs.existsSync || path.existsSync // support node <=0.6
  , registeredStubs =  { }
  , stubkey         =  0
  , tmpDir          =  getTmpDir()
  ;


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

  log.trace();
  throw new ProxyquireError(
    util.format('Cannot find file you required.\nTried [%s] and [%s]', file, jsfile)
  );
}

function normalizeExtension (file) {
  if (path.extname(file) !== '') return file;
  return file + '.js';
}

function addMissingProperties(mdl, original) {
  
  // TODO: In nocallthru mode we enforce all properties to be used in tests to be overridden beforehand
  
  Object.keys(original).forEach(function (key) {
    if (!mdl[key]) { 
      mdl[key] = original[key];   
    } 
  });
  return mdl;
}

function setTmpDir(tmpdir) {
  if (!existsSync(tmpdir)) throw new ProxyquireError('%s doesn\'t exist, so it cannot be used as a tmp dir', tmpdir);
  else tmpDir = tmpdir;
}

function proxyquire (mdl, proxy__filename, original__dirname) {
  var mdlResolve = isRelativePath(mdl) ? path.join(original__dirname, mdl) : mdl
    , original = require(mdlResolve);

  if (registeredStubs[proxy__filename] && registeredStubs[proxy__filename][mdl])
    return addMissingProperties(registeredStubs[proxy__filename][mdl], original);
  else 
    return original;
}

function resolve (mdl, test__dirname, stubs) {
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

  if (stubs) registeredStubs[resolvedProxy] = stubs;

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
    resolve: resolve
  , require: proxyquire
};
