var _ = require('underscore');

(function() {
    
    var verbose = app && app.get('verbose_startup') || false;
    var io = app.get('io');
    var controllers = app.get('controllers');
    
    // build up the socket handlers
    io.sockets.on('connection', function(socket) {
        
        // In ember.js socket adapter, this is how types are defined...
        // var TYPES = {
        //     CREATE: "CREATE",
        //     CREATES: "CREATES",
        //     UPDATE: "UPDATE",
        //     UPDATES: "UPDATES",
        //     DELETE: "DELETE",
        //     DELETES: "DELETES",
        //     FIND: "FIND",
        //     FIND_MANY: "FIND_MANY",
        //     FIND_QUERY: "FIND_QUERY",
        //     FIND_ALL: "FIND_ALL"
        // };
        
        verbose && console.log('\nSetting up socket payload handlers\n  controller:\n    socketEvent -> controller.path');
        
        // In a controller module, the name of the controller (obj.name || just the filename)
        //  and an "io" key mapping functions to the controller actions they simulate, e.g.
        //  say, for a "foo" controller:
        //      foo.io.find = function(payload) {}
        //      foo.io.delete = function(payload) {}
        // The socket event will be (for these examples) "fooFind" and "fooDelete"
        // IMPORATNT: These custom event handlers are RESPONSIBLE for doing socket.emit() to
        //  respond back to the client.  This builder is deliberately establishing callbacks
        //  in the socket's context (via socket.on()) so in the callback "this" is the socket 
        //  object.
        _.each(controllers, function(controller, name, context) {
            
            verbose && console.log('\n   %s:', name);

            _.each(controller.io, function(value, key, context) {
                if (!~[
                    'index'
                    , 'find'
                    , 'findAll'
                    , 'findMany'
                    , 'findQuery'
                    , 'create'
                    , 'creates'
                    , 'update'
                    , 'updates'
                    , 'delete'
                    , 'deletes'
                ].indexOf(key)) return;
                var action = controller.name;
                switch (key) {
                    case 'find':
                    case 'findAll':
                    case 'findMany':
                    case 'findQuery':
                    case 'create':
                    case 'creates':
                    case 'update':
                    case 'updates':
                    case 'delete':
                    case 'deletes':
                    case 'index':
                        action = controller.plural
                    break;
                    default:
                        // using whitelist, shouldn't ever get here...
                        throw new Error('unrecognized route: ' + name + '.' + key);
                }
                
                var socketKey = action + key.charAt(0).toUpperCase() + key.slice(1);
                socket.on(socketKey, value);
                verbose && console.log('     %s -> %s.io.%s', socketKey, name, key);
            });
        });

    });

})(this);