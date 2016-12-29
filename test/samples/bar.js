var Sub=require('./sub.js');

function bar () {
  return 'bar';
}

function rab () {
  return 'rab';
}

function sub () {
  return Sub.subFn();
}


module.exports = { bar : bar, rab: rab, sub: sub };

