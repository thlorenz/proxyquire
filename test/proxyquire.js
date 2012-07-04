/*jshint asi:true */

var require = require('../proxyquire');


describe('config', function () {

  it('initially has __reset function only', function () {
    Object.keys(require()).should.have.length(1);
    require().should.have.property('__reset');
  })

  describe('when I override path', function () {
    
    beforeEach(function () {
      require().path = { };
    });

    it('has __reset function and path property', function () {
      Object.keys(require()).should.have.length(2);
      require().should.have.property('__reset');
      require().should.have.property('path');
    })

    describe('and I reset it again', function () {

      beforeEach(function () {
        require().__reset();
      });

      it('has __reset function only', function () {
        Object.keys(require()).should.have.length(1);
        require().should.have.property('__reset');
      })
    })
  })
})

describe('when no module was overridden', function () {

  beforeEach(function () {
    require().__reset();
  });

  describe('built in modules are used', function () {
    it('path.extname("a.txt") returns ".txt"', function () {
      var path = require('path');
      path.extname('a.txt').should.eql('.txt')
    })
  })
  
})

describe('when module was overridden', function () {

  describe('overrode extname to return ".xtx"', function () {

    beforeEach(function () {
      require().path = { 
        extname: function () { return '.xtx'; }
      }
    });

    it('path.extname("a.txt") returns ".xtx"', function () {
      var path = require('path');
      path.extname('a.txt').should.eql('.xtx');
    })

    it('path.basename("/path/a.txt"', function () {
      
    })
    
  })
})
