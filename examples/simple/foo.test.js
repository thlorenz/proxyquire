require('../example-utils').listModuleAndTests(__dirname + '/foo.js', __filename);

var proxyquire = require('../../proxyquire').setup()
  , assert = require('assert')
  ;

// Needed since we use proxyquire locally instead of an imported module inside 'node_modules'
proxyquire._proxyquire = '../../proxyquire';

// no overrides yet, so path.extname behaves normally
var foo = proxyquire.require('./foo');
assert.equal(foo.extnameAllCaps('file.txt'), '.TXT');

// override path.extname
proxyquire({
  path: { extname: function (file) { return 'Exterminate, exterminate the ' + file; } }
});

// path.extname now behaves as we told it to
foo = proxyquire.require('./foo');
assert.equal(foo.extnameAllCaps('file.txt'), 'EXTERMINATE, EXTERMINATE THE FILE.TXT');

// path.basename on the other hand still functions as before
assert.equal(foo.basenameAllCaps('/a/b/file.txt'), 'FILE.TXT');

console.log('*** All asserts passed ***');
