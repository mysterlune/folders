(function() {

    var assert = require('assert')
    , expect = require('expect.js')
    , async = require('async')
    , http = require('http');
    
    describe('Short async test', function() {

        describe('Just doing status check on Google, Yahoo! home pages', function() {
            
            describe('Running the parallel test', function() {

                async.parallel({
                    google: function(callback){
                        describe('Google', function() {
                            it('Google status', function(done) {
                                http.get('http://www.google.com', function(res){
                                    expect(res.statusCode).to.be.equal(200);
                                    callback(null, res.statusCode);
                                    done();
                                });
                            });
                        });
                    }
                    , yahoo: function(callback){
                        describe('Yahoo!', function() {
                            it('Yahoo! status', function(done) {
                                http.get('http://www.yahoo.com', function(res){
                                    expect(res.statusCode).to.be.equal(200);
                                    callback(null, res.statusCode);
                                    done();
                                });
                            });
                        });
                    }
                }
                , function(err, results) {
                    describe('The results are in...', function() {
                        it('Combined results check out', function(done) {
                            expect(results).to.be.a('object');
                            expect(results.google).to.be.equal(200);
                            expect(results.yahoo).to.be.equal(200);
                            done();
                        });
                    });
                });
            
            });
            
        });
        
    });

    async.series({
        google: function(callback){
            describe('Google', function() {
                it('Google status', function(done) {
                    http.get('http://www.google.com', function(res){
                        expect(res.statusCode).to.be.equal(200);
                        callback(null, res.statusCode);
                        done();
                    });
                });
            });
        }
        , yahoo: function(callback){
            describe('Yahoo!', function() {
                it('Yahoo! status', function(done) {
                    http.get('http://www.yahoo.com', function(res){
                        expect(res.statusCode).to.be.equal(200);
                        callback(null, res.statusCode);
                        done();
                    });
                });
            });
        }
    }
    , function(err, results) {
        describe('The results are in...', function() {
            it('Combined results check out', function(done) {
                expect(results).to.be.a('object');
                expect(results.google).to.be.equal(200);
                expect(results.yahoo).to.be.equal(200);
                done();
            });
        });
    });

}).call(this);