var require = require('../../proxyquire')
  , bar = require('./bar')
  ;

module.exports.gotoBar = function () {
  return bar.drinkUp();
};

module.exports.throwRound = function () {
  return bar.drinksOnMe();
};

