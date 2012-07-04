var config = {
  __reset: function () { 
    Object.keys(this).forEach(function (x) { if (x != '__reset') delete config[x]; });
  }  
};

module.exports = function (name) {
  if (name) {
    return config[name] ? config[name] : require(name);
  } else {
    return config;
  }
  };

