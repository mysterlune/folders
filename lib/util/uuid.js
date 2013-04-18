/**
* Purpose: Adds functionality for generating UUIDs
* Returns: Unique string
* Params: void
* Test: /test/server/uuid.test.js
*   TODO: Move unit test to own directory
*/

module.exports = function() {
    
    var UUID = function(options) {
        if(!this instanceof UUID) {
            return new UUID(options);
        }
        return this;
    }
    
    UUID.prototype.generate = function() {
        
        var S4 = function (){
            return Math.floor(
                Math.random() * 0x10000 // 65536
            ).toString(16);
        };

        return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
        
    }
    
    UUID.prototype.foo = 'bam';
    
    return UUID;
}