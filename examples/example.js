var require = require('../proxyquire');

var file = '/a/b/file.js';

// **************************************** 
// No overrides yet
// **************************************** 

var path = require('path');
console.log(path.extname(file));    // .js
console.log(path.basename(file));   // file.js

// **************************************** 
// Let's override path.extname
// **************************************** 

require({
  path: { 
    extname: function (x) { return 'I dunno what extension of ' + x + ' is :('; }
  }
});

var path = require('path');
console.log(path.extname(file));    // I dunno what extension of /a/b/file.js is :(
console.log(path.basename(file));   // file.js

// **************************************** 
// Let's add override of path.basename
// **************************************** 

require({
  path: {
    basename: function (x) { return 'baseball'; }
  }
});

var path = require('path');
console.log(path.extname(file));    // I dunno what extension of /a/b/file.js is :(
console.log(path.basename(file));   // baseball

// **************************************** 
// Let's change override of path.basename
// **************************************** 

require({
  path: {
    basename: function (x) { return 'soccer'; }
  }
});

var path = require('path');
console.log(path.extname(file));    // I dunno what extension of /a/b/file.js is :(
console.log(path.basename(file));   // soccer

// **************************************** 
// All back to normal
// **************************************** 

require.reset();
var path = require('path');
console.log(path.extname(file));    // .js
console.log(path.basename(file));   // file.js

