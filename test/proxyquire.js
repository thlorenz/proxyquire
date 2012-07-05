/*jshint asi:true */

var proxyquire = require('../proxyquire');

describe('when no module was overridden', function () {

  beforeEach(function () {
    proxyquire().reset();
  });

  describe('built in modules are used', function () {
    it('path.extname("a.txt") returns ".txt"', function () {
      var path = proxyquire('path');
      path.extname('a.txt').should.eql('.txt')
    })
  })
  
})

describe('module overrides', function () {

  describe('override extname to return ".xtx"', function () {
    var path 

    beforeEach(function () {
      proxyquire({ 
          path: { 
            extname: function () { return '.xtx'; }
          }
        });

      path = proxyquire('path');
    });

    it('path.extname("a.txt") returns ".xtx"', function () {
      path.extname('a.txt').should.eql('.xtx');
    })

    it('path.basename("/path/a.txt" returns "a.txt"', function () {
      path.basename('/path/a.txt').should.eql('a.txt');
    })
    
  })

  describe('strict override extname to return ".xtx"', function () {
    var path 

    beforeEach(function () {
      proxyquire()
        .reset()
        .add({ 
          path: { 
              extname: function () { return '.xtx'; }
            , __proxyquire: { strict: true }
          }
        });

      path = proxyquire('path');
    });

    it('path.extname("a.txt") returns ".xtx"', function () {
      path.extname('a.txt').should.eql('.xtx');
    })

    it('path.basename("/path/a.txt" throws "has no method basename"', function () {
      (function () {
        path.basename('/path/a.txt')
      }).should.throw(/has no method.*basename/);
    })
  })
})


describe('module path resolution', function () {
  describe('when I require a module that is part of my project', function () {
    it('resolves that module', function () {
      // foo requires bar using proxyquire
      require('./samples/foo').gotoBar().should.eql('you are a drunk');
    })     
  })
})

describe('adding and removing overrides incrementally', function () {
  describe('when I override path.basename to return "1"', function () {

    var path;
    beforeEach(function () {
      proxyquire()
        .reset()
        .add({
          path: { 
            basename: function () { return 1; }
          }
      })
      path = proxyquire('path');
    });

    it('path.basename("x") returns 1', function () {
      path.basename('x').should.eql(1);  
    })
    
    it('path.extname("x") returns ""', function () {
      path.extname('x').should.eql('');  
    })

    describe('and then path.extname to return "2"', function () {

      beforeEach(function () {
        proxyquire().add({
          path: { 
            extname: function () { return 2; }
          }
        })
      });

      it('path.basename("x") returns 1', function () {
        path.basename('x').should.eql(1);  
      })

      it('path.extname("x") returns 2', function () {
        path.extname('x').should.eql(2);  
      })

      describe('and then I remove path.basename override', function () {
        beforeEach(function () {
          proxyquire().del({ path: 'basename' });
        });

        it('path.basename("x") returns x', function () {
          path.basename('x').should.eql('x');  
        })

        it('path.extname("x") returns 2', function () {
          path.extname('x').should.eql(2);  
        })

        describe('and then I remove path.extname override', function () {
          beforeEach(function () {
            proxyquire().del({ path: 'extname' });
          });

          it('path.basename("x") returns x', function () {
            path.basename('x').should.eql('x');  
          })

          it('path.extname("x") returns ""', function () {
            path.extname('x').should.eql("");  
          })
        })
      })
    })
  })
})


describe('removing overrides for local module,', function () {

  var foo;

  beforeEach(function init() {

    // foo proxyquires bar
    // foo.gotoBar calls bar.drinkUp
    // foo.throwRound calls bar.drinksOnMe

    proxyquire({
      './bar': { 
          drinkUp    :  function () { return 'keep it up'; }
        , drinksOnMe :  function () { return 'you wish'; }
      }
    });

    foo = require('./samples/foo');
  });

  describe('when I override drinkUp and drinksOnMe,', function () {

    it('drinkUp returns stub', function () {
      foo.gotoBar().should.eql('keep it up');
    })

    it('drinksOnMe returns stub', function () {
      foo.throwRound().should.eql('you wish');  
    })
    
    describe('and then I remove drinkUp override,', function () {
      beforeEach( function () {
        proxyquire().del({ './bar': 'drinkUp' });
      });

      it('drinkUp returns original', function () {
        foo.gotoBar().should.eql('you are a drunk');
      })

      it('drinksOnMe returns stub', function () {
        foo.throwRound().should.eql('you wish');  
      })

      describe('and then I remove drinksOnMe override,', function () {
        beforeEach( function () {
          proxyquire().del({ './bar': 'drinksOnMe' });
        });

        it('drinkUp returns original', function () {
          foo.gotoBar().should.eql('you are a drunk');
        })

        it('drinksOnMe returns original', function () {
          foo.throwRound().should.eql('you are rich');  
        })
      })
    })
    
    describe('and then I remove both drinkUp and drinksOnMe overrides,', function () {
      beforeEach( function () {
        proxyquire().del({ './bar': [ 'drinkUp', 'drinksOnMe' ] });
      });

      it('drinkUp returns original', function () {
        foo.gotoBar().should.eql('you are a drunk');
      })

      it('drinksOnMe returns original', function () {
        foo.throwRound().should.eql('you are rich');  
      })
    })

    describe('and then I remove entire ./bar module', function () {
      beforeEach( function () {
        proxyquire().del('./bar');  
      });

      it('drinkUp returns original', function () {
        foo.gotoBar().should.eql('you are a drunk');
      })

      it('drinksOnMe returns original', function () {
        foo.throwRound().should.eql('you are rich');  
      })
    })
  })
})

describe('when I override path.basename to return 1 in strict mode', function () {
  
  var path;
  beforeEach(function () {
    proxyquire({
      path: { 
          basename: function () { return 1; }
        , __proxyquire: { strict: true }
      }
    })
    path = proxyquire('path');
  });

  it('path.basename("x") returns 1', function () {
    path.basename('x').should.eql(1);  
  })

  describe('and then remove path.basename override', function () {
    beforeEach(function () {
      proxyquire().del({ path: 'basename' });
    })

    it('path.basename("/path/a.txt" throws "has no method basename"', function () {
      (function () {
        path.basename('/path/a.txt')
      }).should.throw(/has no method.*basename/);
    })
  })
})
