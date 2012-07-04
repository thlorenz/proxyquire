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
        ({ 
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

describe('overriding incrementally', function () {
  var path;
  describe('when I override path.basename to return "1" and then path.extname to return "2"', function () {
    before(function () {
      proxyquire({
        path: { 
          basename: function () { return 1; }
        }
      });

      proxyquire({
        path: { 
          extname: function () { return 2; }
        }
      });

      path = proxyquire('path');
    });

    it('path.basename("x") returns 1', function () {
      path.basename('x').should.eql(1);  
    })
    
    it('path.extname("x") returns 2', function () {
      path.extname('x').should.eql(2);  
    })
  })
})


