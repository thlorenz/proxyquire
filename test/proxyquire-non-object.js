'use strict'

var assert = require('assert')
var proxyquire = require('..')
var stats = require('./samples/stats')

describe('Given foo requires the boof, foonum and foobool modules and  boof is a string, foonum is a Number and foobool is a bool', function () {
  var foo
  var boofber = 'a_string'
  var foonumber = 4
  var fooboolber = false
  var fooarray = ['x', 'y', 'z']

  describe('When I resolve foo with boofber stub as boof.', function () {
    before(function () {
      stats.reset()
      foo = proxyquire('./samples/foo', {'./boof': boofber})
    })

    it('foo is required 1 times', function () {
      assert.equal(stats.fooRequires(), 1)
    })

    describe('foo\'s boof is boofber', function () {
      it('foo.boof == boofber', function () {
        assert.equal(foo.boof, boofber)
      })
    })
  })

  describe('When I resolve foo with foonumber stub as foonum.', function () {
    before(function () {
      stats.reset()
      foo = proxyquire('./samples/foo', {'./foonum': foonumber})
    })

    it('foo is required 1 times', function () {
      assert.equal(stats.fooRequires(), 1)
    })

    describe('foo\'s foonum is foonumber', function () {
      it('foo.foonum == foonumber', function () {
        assert.equal(foo.foonum, foonumber)
      })
    })
  })

  describe('When I resolve foo with fooboolber stub as foobool.', function () {
    before(function () {
      stats.reset()
      foo = proxyquire('./samples/foo', {'./foobool': fooboolber})
    })

    it('foo is required 1 times', function () {
      assert.equal(stats.fooRequires(), 1)
    })

    describe('foo\'s foobool is fooboolber', function () {
      it('foo.foobool == fooboolber', function () {
        assert.equal(foo.foobool, fooboolber)
      })
    })
  })

  describe('When I resolve foo with ./fooarray stub as fooarray.', function () {
    before(function () {
      stats.reset()
      foo = proxyquire('./samples/foo', {'./fooarray': fooarray})
    })

    it('foo is required 1 times', function () {
      assert.equal(stats.fooRequires(), 1)
    })

    describe('foo\'s fooarray is fooarray', function () {
      it('foo.fooarray is fooarray', function () {
        assert.deepEqual(foo.fooarray, ['x', 'y', 'z'])
      })
    })
  })

  describe('When I resolve foo with ./fooarray stub as empty.', function () {
    before(function () {
      stats.reset()
      foo = proxyquire('./samples/foo', {'./fooarray': []})
    })

    it('foo is required 1 times', function () {
      assert.equal(stats.fooRequires(), 1)
    })

    describe('foo\'s fooarray is the original', function () {
      it('foo.fooarray is empty', function () {
        assert.deepEqual(foo.fooarray, ['a', 'b', 'c'])
      })
    })
  })

  describe('When I resolve foo with ./fooarray stub as empty with @noCallThru.', function () {
    before(function () {
      stats.reset()
      var empty = []
      Object.defineProperty(empty, '@noCallThru', {value: true})
      foo = proxyquire('./samples/foo', {'./fooarray': empty})
    })

    it('foo is required 1 times', function () {
      assert.equal(stats.fooRequires(), 1)
    })

    describe('foo\'s fooarray is empty', function () {
      it('foo.fooarray is empty', function () {
        assert.deepEqual(foo.fooarray, [])
      })
    })
  })
})
