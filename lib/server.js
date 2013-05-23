/**

Server: This is the core offering of this module.

    The following function establishes a listening WebSocket (Socket.io) server
    via an Express HTTP server.
    
    Server establishes basic runtime configurations consumed from an "options"
    parameter passed in at startup time.
    
    Server loads middleware such as Memcache, session parser, exception handlers.  When
    the top-level package ("folders") is required, Server is not automatically run.
    
    Server must be called upon like this:
    
        var server = require('folders');
        var options = { [your config object] };
        server(options);
        
    When Server is invoked like this, configs are read into an Express app (global app), middlewares
    are loaded, and a "boot" routine is triggered.
    
    @see boot.js
    
**/
var Server = function(options, app_config) {
    
    if(!options || (typeof options !== 'object')) {
        throw new Error('Startup configuration must be passed as "options" parameter to the Server module');
        return;
    }

    if(!app_config || (typeof app_config !== 'object')) {
        throw new Error('Startup configuration (app-specific) must be passed as "app_config" parameter to the Server module');
        return;
    }
    
    var use_rest = false;
    var express = require('express')
        , http = require('http')
        , hbs = require('hbs')
        , io = require('socket.io')
        , path = require('path')
        , rest_client = require('superagent')
        , debug = app_config.debug
        , _ = require('underscore')
        , UUID = require('utilities').UUID()
        , redis = require('redis')
        , fs = require('fs');
    
    /* global app */
    app = express();

    var server = http.createServer(app)
        , io = io.listen(server, {log: debug});

    app.set('generateUuid', function generateUuid() {
        var gen = new UUID();
        return gen.generate();
    });
        
    app.configure(function(){
        
        // Memcached Store for session data

        // pass the express to the connect memcached module
        // allowing it to inherit from express.session.Store
        var MemcachedStore = require('connect-memcached')(express);
                
        // Returns true if the passed `object` has a property matching a depth described in `arr`
        // @usage:
        //  var obj = { foo: { bar: { baz: "biz" } } };
        //  var hasBaz = detectDeepPropertyExistence(['foo','bar','baz'], obj); // true
        // @returns: boolean
        function detectDeepPropertyExistence(arr, object) {
            var obj = object, depth = 0;
            _.each(arr, function(a,b,c) { if(_.has(obj, a)) { depth++; obj = obj[a]; } }, this);
            return (depth === arr.length);
        }
        
        // MUST HAVE Proper Memcached configuration in `options`
        var search = ['Plugin::Cache', 'backends', 'default', 'pools'];
        if(!detectDeepPropertyExistence(search, options)) { throw new Error('No Memcached configuration found at "'+search.join('.')+'"'); }
        
        // If we don't get an error by now, assume we have the config object for Memcached
        var mem_config = options['Plugin::Cache'].backends.default;
        
        // Build the array of pools, deduplicate, return in order of appearance (demoting backups)
        var mem_pool = [];
        _.each(mem_config.pools, function(a,b,c) { if(b % 2 !== 0) { mem_pool = _.union(mem_pool, a); } });
        
        // Bail if there are no servers listed (or there is some misconfiguration)
        if(mem_pool.length === 0) { throw new Error('No Memcached servers found for the pool'); }
        
        // Otherwise, light it up
        var mem_options = { hosts: mem_pool, prefix: mem_config.key_prefix };
        var cookie_parser = express.cookieParser('CatOnTheKeyboard')
            , session_store = new MemcachedStore(mem_options)
            , SessionSockets = require('session.socket.io')
            , sessionSockets = new SessionSockets(io, session_store, cookie_parser);
        
        var redis_client = redis.createClient(app_config.redis.port,app_config.redis.host);
        
        app.set('port', process.env.PORT || app_config.socket.port);
        app.engine('hbs', hbs.__express);
        app.set('view engine', 'hbs');
        app.set('public_dir', path.join(__dirname,'../../../server/public'));
        app.set('upload_dir', path.join(__dirname, '../../../uploads')); // TODO Should this be moved off to a config?
        app.set('views', path.join(__dirname,'../../../server/views'));
        app.set('controllers_dir', path.join(__dirname,'../../../server/controllers'));
        app.set('models_dir', path.join(__dirname,'../../../server/models'));
        app.set('db_str', '[schema, postgres?]://[user]@[host]:[port]/[database]');
        app.set('server', server);
        app.set('io', io); 
        app.set('session_store', session_store);
        app.set('session_sockets', sessionSockets);
        app.set('session_secret', app_config.session_secret);
        app.set('session_key', 'express.sid');
        app.set('redis_client', redis_client);
        app.set('rest_client', rest_client);
        app.set('use_rest', app_config.use_rest);
        app.set('use_fixtures', app_config.use_fixtures);
        app.set('rest_backend', app_config.rest.host + ':' + app_config.rest.port);
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.set('verbose_startup', app_config.verbose_startup);

        // session support
        app.use(express.cookieParser(app.get('session_secret')));
        app.use(express.session({ secret: app.get('session_secret'), store: session_store }));

        // parse request bodies (req.body)
        app.use(express.bodyParser());

        // support _method (PUT in forms etc)
        app.use(express.methodOverride());

        app.use(app.router);
        app.use(require('less-middleware')({ 
            dest: path.join(app.get('public_dir'))
            , src: app.get('public_dir')
            , compress: true
            , debug: debug
        }));
        app.use(express.static(app.get('public_dir')));

        // session memcached client setup
        var session_manager = options['session_manager'];
        var session_pool = [];
        _.each(session_manager.pools, function(a,b,c) {
            if(b % 2 !== 0) { session_pool = _.union(session_pool, a); } });

        if (session_pool.length === 0) {
            throw new Error('No session memcached servers found for the pool');
        }

        var memcached = require('memcached');
        var sess_mem_client = new memcached( session_pool );
        app.set('sess_mem_client', sess_mem_client);
        app.set('sess_mem_key_prefix', session_manager.key_prefix);
        
    });

    app.use(function(req, res, next) {

        var cookies = req.cookies;
        //console.log(cookies);
        if(typeof cookies === 'object') {
            if( Object.keys(cookies).length === 0 ) console.log('no cookies for you...');
        }
        next();
    });

    // expose the "messages" local variable when views are rendered
    app.use(function(req, res, next){
        var msgs = req.session.messages || [];

        // expose "messages" local variable
        res.locals.messages = msgs;

        // expose "hasMessages"
        res.locals.hasMessages = !! msgs.length;

        /* This is equivalent:
        res.locals({
            messages: msgs,
            hasMessages: !! msgs.length
        });
        */

        // empty or "flush" the messages so they
        // don't build up
        req.session.messages = [];
        next();
    });

    // load controllers and io
    // NOTE: Just requiring boot inits everything (controllers, model, io) synchronously
    //  ... and needs to happen after app has been configured
    require('./boot');

    app.configure('development', function(){
        app.use(express.errorHandler());
    });

    server.listen(app.get('port'), function(){
        if(debug) console.log("Express server listening on port " + app.get('port'));
    });
    
}

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Server;
    }
}


// Handle browser case
if ( typeof(window) != "undefined" )
{
    window.Server = Server;
}

// Properly exit node... Is this really necessary?
process.on('SIGINT', function() {
    console.log("Received SIGINT\n");
    process.exit(0);
});