var module = require("simplest-counter");
var bar = require("./bar.js");

exports.fn = function () {
  return bar.bar() + module.count();
};