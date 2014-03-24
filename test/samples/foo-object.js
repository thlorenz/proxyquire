var path = require('path');

Foo = function() {};

Foo.prototype.bigExt = function(file) {
    return path.extname(file).toUpperCase();
};

var instance = null;
exports.getInstance = function() {
    if (instance === null) {
        instance = new Foo();
    }

    return instance;
};

exports.createNew = function() {
    return new Foo();
};