
var Server = function(options) {
    
    var app_config = options.tiir_config;
    
    var use_rest = false;
    var express = require('express')
        , http = require('http')
        , hbs = require('hbs')
        , io = require('socket.io')
        , path = require('path')
        , rest_agent = require('superagent')
        , debug = app_config.debug
    
    /* global app */
    app = express();

    var server = http.createServer(app)
        , io = io.listen(server, {log: debug});

    app.configure(function(){
        app.set('port', process.env.PORT || app_config.socket.port);
        app.engine('hbs', hbs.__express);
        app.set('view engine', 'hbs');
        app.set('public_dir', path.join(__dirname,'../../../server/public'));
        app.set('views', path.join(__dirname,'../../../server/views'));
        app.set('controllers_dir', path.join(__dirname,'../../../server/controllers'));
        app.set('models_dir', path.join(__dirname,'../../../server/models'));
        app.set('db_str', '[schema, postgres?]://[user]@[host]:[port]/[database]');
        app.set('server', server);
        app.set('io', io);    
        app.set('rest_agent', rest_agent);
        app.set('use_rest', app_config.use_rest);
        app.set('use_fixtures', app_config.use_fixtures);
        app.set('rest_backend', app_config.rest.host + ':' + app_config.rest.port);
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.set('verbose_startup', app_config.verbose_startup);

        // session support
        app.use(express.cookieParser('some secret here'));
        app.use(express.session());

        // parse request bodies (req.body)
        app.use(express.bodyParser());

        // support _method (PUT in forms etc)
        app.use(express.methodOverride());

        app.use(app.router);
        
        app.use(require('less-middleware')({ src: app.get('public_dir') }));
        app.use(express.static(app.get('public_dir')));
    });

    app.use(function(req, res, next) {

        console.log(req.cookies);
        var cookies = req.cookies;
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