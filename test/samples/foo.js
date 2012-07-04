var require = require('../../proxyquire')
  , bar = require('./bar')
  ;

console.log('requiring foo');

module.exports.gotoBar = function () {
  return bar.drinkUp();
};

module.exports.throwRound = function () {
  return bar.drinksOnMe();
};

