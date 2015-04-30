'use strict';

/*global describe, before, beforeEach, it */

var proxyquire = require('..')

describe('fs', function () {
  it('can proxy fs to graceful-fs', function () {
    debugger;
    proxyquire('./samples/fs', {
      fs: require('graceful-fs')
    })
  })
})
