module.exports.__dirname = __dirname;
module.exports.__filename = __filename;
module.exports.testRequire = function() {
  var bar = require('./bar');
  return bar.bar();
};
