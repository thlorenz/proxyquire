var path            =  require('path')
  , fs              =  require('fs')
  , util            =  require('util')
  , existsSync      =  fs.existsSync || path.existsSync // support node <=0.6
  , registeredStubs =  { }
  , stubkey         =  0
  ;

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

function proxyquire (mdl, caller__filename) {
  var mdlResolve = isRelativePath(mdl) ? path.join(path.dirname(caller__filename), mdl) : mdl;  

  if (registeredStubs[caller__filename] && registeredStubs[caller__filename][mdl]) {
    console.log('found', registeredStubs[caller__filename]);
    return registeredStubs[caller__filename][mdl];
  }
  else return require(mdlResolve);
}

function resolve (mdl, dirname, stubs) {
  var mdlPath        =  isRelativePath(mdl) ? path.join(dirname, mdl) : mdl
    , resolvedMdl    =  require.resolve(mdlPath)
    , resolvedFile   =  findFile(resolvedMdl)
    , originalCode   =  fs.readFileSync(resolvedFile)
    , mdlProxyFile   =  mdlPath + '@' + (stubkey++).toString()
    , resolvedProxy  =  normalizeExtension(mdlProxyFile) 
    , mdlProxyCode = 
        ['function require(mdl) { return module.require("' , __filename, '").require(mdl, __filename); }'
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
