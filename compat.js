'use strict';
//
// Compatibility Support 0.3.x
//

module.exports.init = function (Proxyquire, ProxyquireError, is) {
  var globalCompatProxyquire = new Proxyquire();

  return function (parent, useGlobal) {
    function validateArgments(mdl, test__dirname, stubs) {
      if (!mdl)
        throw new ProxyquireError(
          'Missing argument: "mdl". Need it know to which module to require.'
        );

      if (!test__dirname)
        throw new ProxyquireError(
          'Missing argument: "__dirname" of test file. Need it to resolve module relative to test directory.'
        );

      if (!stubs)
        throw new ProxyquireError(
          'Missing argument: "stubs". If no stubbing is needed for [' + mdl + '], use regular require instead.'
        );

      if (!is.String(mdl))
        throw new ProxyquireError(
          'Invalid argument: "mdl". Needs to be a string that contains path to module to be resolved.'
        );

      if (!is.String(test__dirname))
        throw new ProxyquireError(
          'Invalid argument: "__dirname" of test file. Needs to be a string that contains path to test file resolving the module.'
        );

      if (!is.Object(stubs))
        throw new ProxyquireError(
          'Invalid argument: "stubs". Needs to be an object containing overrides e.g., {"path": { extname: function () { ... } } }.'
        );
    }

    var pq = useGlobal ? globalCompatProxyquire : new Proxyquire();

    var compat = function (mdl, test__dirname, stubs) {
      validateArgments.apply(null, arguments);
      return pq.load(mdl, stubs);
    };

    compat.resolve = compat;

    compat.tmpDir = function () {};

    compat.noCallThru = function (flag) {
      if (flag !== false)
        pq.noCallThru();
      else
        pq.callThru();

      return compat;
    };

    return compat;
  };
};
