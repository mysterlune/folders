var express = require('express')
,   fs = require('fs')
,   _ = require('underscore')
,   path = require('path');

(function() {
    
    var verbose = app && app.get('verbose_startup') || false;
    var controllers = {};
    
    verbose && console.log('\nSetting up io controllers\n  name:\n    METHOD /path/to/action');

    fs.readdirSync(app.get('controllers_dir')).forEach(function(name){

        // This is totally dumb...
        // TODO Look into https://npmjs.org/package/glob
        if (name == '.svn') return;

        verbose && console.log('\n   %s:', name);

        var obj = require(path.join(app.get('controllers_dir'), name))
        ,   name = obj.name || name
        ,   plural = obj.plural || name+'s'
        ,   prefix = obj.prefix || ''
        ,   child_app = express()
        ,   method
        ,   handler;
        
        controllers[name] = obj;
        
        // allow specifying the view engine
        if (obj.engine) child_app.set('view engine', obj.engine);

        child_app.set('views', app.get('views'));

        // before middleware support
        if (obj.before) {
            handler = '/' + plural;
            child_app.all(handler, obj.before);
            verbose && console.log('     ALL %s -> before', handler);
            handler = '/' + plural + '/:' + name + '_id';
            child_app.all(handler, obj.before);
            verbose && console.log('     ALL %s -> before', handler);
            handler = '/' + plural + '/:' + name + '_id/*';
            child_app.all(handler, obj.before);
            verbose && console.log('     ALL %s -> before', handler);
        }

        // generate routes based
        // on the exported methods
        for (var key in obj) {
            // "reserved" exports
            //if (~['name', 'prefix', 'engine', 'before', 'io', 'plural'].indexOf(key)) continue;
            // whitelisted routes
            if (!~['index', 'find', 'findAll', 'create', 'update', 'delete'].indexOf(key)) continue;
            // route exports
            switch (key) {
                case 'find':
                    method = 'get';
                    handler = '/' + plural + '/:' + name + '_id';
                break;
                case 'findAll':
                    method = 'get';
                    handler = '/' + plural;
                break;
                case 'edit':
                    method = 'get';
                    handler = '/' + plural + '/:' + name + '_id/edit';
                break;
                case 'update':
                    method = 'put';
                    handler = '/' + plural + '/:' + name + '_id';
                break;
                case 'create':
                    method = 'post';
                    handler = '/' + plural;
                break;
                case 'index':
                    method = 'get';
                    handler = '/';
                break;
                default:
                    // using whitelist, shouldn't ever get here...
                    throw new Error('unrecognized route: ' + name + '.' + key);
            }

            handler = prefix + handler;
            child_app[method](handler, obj[key]);
            verbose && console.log('     %s %s -> %s', method.toUpperCase(), handler, key);

        }

        // mount the child_app
        app.use(child_app);
    });
    
    app.set('controllers', controllers);
    
})(this);


module.exports = function(type) {
    var controllers = app.get('controllers');
    if(controllers.hasOwnProperty(type)) {
        return controllers[type];
    } else {
        throw new Error('Could not find controller ' + type + ' in the set of controllers');
        return false;
    }
}