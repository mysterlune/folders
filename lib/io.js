var session_secret = app.get('session_secret');
var debug = false
,   _ = require('underscore')
,   cookie = require('cookie')
,   parseSignedCookie = require('connect').utils.parseSignedCookie
,   parseSignedCookies = require('connect').utils.parseSignedCookies
,   parseJSONCookies = require('connect').utils.parseJSONCookies
,   express = require('express');


(function() {
    
    var verbose = app && app.get('verbose_startup') || false;
    var io = app.get('io');
    var controllers = app.get('controllers');
    
    var sessionSockets = app.get('session_sockets');

    io.set('authorization', function (data, accept) {
        var cookieParser = express.cookieParser(app.get('session_secret'));
        cookieParser(data, {}, function(err) {
            if (err) {
                accept(err, false);
            } else {
                app.get('session_store').get(data.signedCookies[app.get('session_key')], function(err, session) {
                    if (err || !session) {
                        accept('Session error', false);
                    } else {
                        data.session = session;
                        accept(null, true);
                    }
                });
            }
        });
    });
    
    // build up the socket handlers
    sessionSockets.on('connection', function(err, socket, session) {

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
        // IMPORTANT: These custom event handlers are RESPONSIBLE for doing socket.emit() to
        //  respond back to the client.  This builder is deliberately establishing callbacks
        //  in the socket's context (via socket.on()) so in the callback "this" is the socket 
        //  object.
        _.each(controllers, function(controller, name, context) {
            
            verbose && console.log('\n  socket handler %s:', name);

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
        
        socket.on('disconnect', function(socket) {
            // console.log('----------------------------');
            // console.log(io.sockets.sockets['nickname']);
            // console.log('----------------------------');
            // delete io.sockets.sockets['nickname'];
            // 
            // console.log('----------------------------');
            // console.log(io.sockets.sockets['nickname']);
            // console.log('----------------------------');
        });

    });
    

})(this);