/*jshint asi:true*/
/*global describe before beforeEach it */
"use strict";

var assert = require('assert')
  , proxyquire = require('./../proxyquire')
  , stats  = require('./samples/stats')
  ;

describe('Given foo requires the bar and path modules and bar.bar() returns "bar"', function () {
  var file = '/folder/test.ext'
    , foo
    , foober
    , barber = { bar: function () { return 'barber'; } }
    ;
  
  describe('When I resolve foo with no overrides to bar as foo and resolve foo with barber stub as foober.', function () {
    before(function () {
      foo = proxyquire.resolve('./samples/foo', __dirname, { './bar': { /* no overrides */ } });
      foober = proxyquire.resolve('./samples/foo', __dirname, { './bar': barber });
    })

    it('foo is required 2 times', function () {
      assert.equal(stats.fooRequires(), 2);
    })   

    describe('foo\'s bar is unchanged', function () {
      it('foo.bigBar() == "BAR"', function () {
        assert.equal(foo.bigBar(), 'BAR');
      })
    })

    describe('only stubbed modules have overrides in foober', function () {

      it('foober.bigBar() == "BARBER"', function () {
        assert.equal(foober.bigBar(), 'BARBER');
      })

      it('foober.bigExt("/folder/test.ext") == ".EXT"', function () {
        assert.equal(foober.bigExt(file), '.EXT');
      })

      it('foober.bigBas("/folder/test.ext") == "TEST.EXT"', function () {
        assert.equal(foober.bigBas(file), 'TEST.EXT');
      })
      
    })

    describe('when I override keys of stubs after resolve', function () {

      before(function () {
        barber.bar = function () { return 'friseur'; }
        barber.rab = function () { return 'rabarber'; }
      });

      it('overrides behavior when module is required inside function call', function () {
        assert.equal(foober.bigBar(), 'FRISEUR');
      })   

      it('overrides behavior when module is required on top of file', function () {
        assert.equal(foober.bigRab(), 'RABARBER');
      })   


      describe('and then delete overrides of stubs after resolve', function () {

        beforeEach(function () {
          barber.bar = undefined;
          barber.rab = undefined;
        })

        it('reverts to original behavior when module is required inside function call', function () {
          assert.equal(foober.bigBar(), 'BAR');
        })

        it('doesn\'t properly revert to original behavior when module is required on top of file ', function () {
          assert.throws(foober.bigRab);
        })
        
      })
    })
  })

  describe('When foo.bigExt() returns capitalized path.extname and foo.bigBas() returns capitalized path.basename', function () {
    describe('and path.extname(file) is stubbed to return "override " + file', function () {

      describe('and callThru was not changed globally or for path module', function () {
        before(function () {
          foo = proxyquire
            .resolve('./samples/foo', __dirname, { 
              path: { 
                  extname: function (file) { return 'override ' + file; }
                } 
            });
        })

        it('foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT"', function () {
          assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
        })

        it('foo.bigBas(file) == "TEST.EXT"', function () {
          assert.equal(foo.bigBas(file), 'TEST.EXT');
        })
      })

      describe('and callThru is turned off for path module', function () {
        before(function () {
          foo = proxyquire
            .resolve('./samples/foo', __dirname, { 
              path: { 
                  extname: function (file) { return 'override ' + file; }
                , '@noCallThru': true
                } 
            });
        })

        it('foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT"', function () {
          assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
        })

        it('foo.bigBas(file) throws', function () {
          assert.throws(foo.bigBas);
        })
        
      })
      
      describe('and callThru was turned off globally', function () {
        before(function () {
          proxyquire.noCallThru();
        })

        describe('and not changed for path module', function () {
          before(function () {
            foo = proxyquire
              .resolve('./samples/foo', __dirname, { 
                path: { 
                    extname: function (file) { return 'override ' + file; }
                  } 
              });
          })

          it('foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT"', function () {
            assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
          })

          it('foo.bigBas(file) throws', function () {
            assert.throws(foo.bigBas);
          })
        })

        describe('and turned back on for path module', function () {
          before(function () {
            foo = proxyquire
              .resolve('./samples/foo', __dirname, { 
                path: { 
                    extname: function (file) { return 'override ' + file; }
                  , '@noCallThru': false
                  } 
              });
          })

          it('foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT"', function () {
            assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
          })

          it('foo.bigBas(file) == "TEST.EXT"', function () {
            assert.equal(foo.bigBas(file), 'TEST.EXT');
          })
        })

        describe('and turned back on globally', function () {
          before(function () {
            foo = proxyquire
              .noCallThru(false)
              .resolve('./samples/foo', __dirname, { 
                path: { 
                    extname: function (file) { return 'override ' + file; }
                  } 
              });
          })

          it('foo.bigExt(file) == "OVERRIDE /FOLDER/TEST.EXT"', function () {
            assert.equal(foo.bigExt(file), 'OVERRIDE /FOLDER/TEST.EXT');
          })

          it('foo.bigBas(file) == "TEST.EXT"', function () {
            assert.equal(foo.bigBas(file), 'TEST.EXT');
          })
        })
      })
    })
  })
})

describe('Multiple requires of same module don\'t affect each other', function () {
  describe('Given I require foo stubbed with bar1 as foo1 and foo stubbed with bar2 as foo2', function () {
    var foo1
      , foo2
      , bar1 = { bar: function () { return 'bar1'; } }
      , bar2 = { bar: function () { return 'bar2'; } }
      ;

    before(function () {
      foo1 = proxyquire.resolve('./samples/foo', __dirname, { './bar': bar1 });
      foo2 = proxyquire.resolve('./samples/foo', __dirname, { './bar': bar2 });
    })
    
    it('foo1.bigBar() == "BAR1"', function () {
      assert.equal(foo1.bigBar(), 'BAR1');  
    })

    it('foo2.bigBar() == "BAR2"', function () {
      assert.equal(foo2.bigBar(), 'BAR2');  
    })

    describe('and I change bar1.bar() to return barone', function () {
      before(function () {
        bar1.bar = function () { return 'barone'; };
      })
      
      it('foo1.bigBar() == "BARONE"', function () {
        assert.equal(foo1.bigBar(), 'BARONE');  
      })

      it('foo2.bigBar() == "BAR2"', function () {
        assert.equal(foo2.bigBar(), 'BAR2');  
      })

    })
  })
})


describe('Illegal parameters to resolve give meaningful errors', function () {
  var bar = { bar: function () { return 'bar'; } }
    , exception
    ;

  describe('when I pass no module', function () {
    function act () {
      proxyquire.resolve(undefined, __dirname); 
    }

    it('throws an exception explaining that resolve without stubs makes no sense', function () {
      assert.throws(act, 'ProxyquireError', /missing argument: "module"/i);
    })
    
  })

  describe('when I pass no test__dirname', function () {
    function act () {
      proxyquire.resolve('module'); 
    }

    it('throws an exception explaining that resolve without stubs makes no sense', function () {
      assert.throws(act, 'ProxyquireError', /missing argument: "__dirname" of test file/i);
    })
    
  })
  describe('when I pass no stubs', function () {
    function act () {
      proxyquire.resolve('./samples/foo', __dirname); 
    }

    it('throws an exception explaining that resolve without stubs makes no sense', function () {
      assert.throws(act, 'ProxyquireError', /missing argument: "stubs".+use regular require instead/i);
    })
    
  })

  describe('when I pass { bar: function () { .. } } as stubs (e.g., fail to assign it to "./bar")', function () {
    function act () {
      proxyquire.resolve('./samples/foo', __dirname, bar); 
    }

    it('throws an exception explaining that stub needs to be assigned to a module', function () {
      assert.throws(act,  'ProxyquireError',  /specify what module the stub is for/i);
    })
  })  
})
