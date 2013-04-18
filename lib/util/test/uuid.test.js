(function() {

    var uuid = require('../uuid')()
    , _ = require('underscore')
    , expect = require('expect.js');
    
    describe('Ensuring 100 unique UUIDs', function() {
        
        it('Loop of 100', function(done) {
            
            var arr = [];
            var gen = new uuid();
            _.each(_.range(100), function(a,b,c) {
                var id = gen.generate();
                var is_unique = (_.indexOf(arr, id) < 0);
                arr.push(id);
                expect(is_unique).to.be.equal(true);
            });

            done();
        });

        it('Loop of 1000', function(done) {
            
            var arr = [];
            var gen = new uuid();
            _.each(_.range(1000), function(a,b,c) {
                var id = gen.generate();
                var is_unique = (_.indexOf(arr, id) < 0);
                arr.push(id);
                expect(is_unique).to.be.equal(true);
            });

            done();
        });
        
    })

}).call(this);