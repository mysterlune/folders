var express = require('express')
,   fs = require('fs')
,   _ = require('underscore')
,   path = require('path');

function ucfirst(string) {
    return string.charAt(0).toUpperCase()+string.slice(1);
}

(function() {
    
    var verbose = app && app.get('verbose_startup') || false;
    var controllers = {};
    
    verbose && console.log('\nSetting up io controllers\n  name:\n    METHOD /path/to/action');

    fs.readdirSync(app.get('controllers_dir')).forEach(function(name){

        // This is totally dumb...
        // TODO Look into https://npmjs.org/package/glob
        if (name == '.svn') return;

        // skip .swp files
        if (name.substring(name.length-4, name.length) == '.swp') return;

        // skip emacs temp files '#foo'
        if (name.substring(0, 1) == '#') return;

        // skip foo.js~ files
        if (name.substring(name.length-1, name.length) == '1') return;

        verbose && console.log('\n   %s:', name);

        var obj = require(path.join(app.get('controllers_dir'), name))
        ,   name = obj.name || name
        ,   plural = obj.plural || name+'s'
        ,   prefix = obj.prefix || ''
        ,   child_app = express()
        ,   method
        ,   handler
        ,   before_handler
        ,   before_key
        ,   before_action_key;
        
        controllers[name] = obj;
        
        // // allow specifying the view engine
        // if (obj.engine) child_app.set('view engine', obj.engine);

        child_app.set('views', app.get('views'));

        // Special case, "Before" middleware support
        if(name === 'index') {
            
            // Should detect (before_action_key -> beforeFindAll) and route (before_key -> beforeControllerFindAll)
            before_action_key = 'before'+ucfirst(name);
            before_key = 'before'+ucfirst(name);
            
            if(obj[before_action_key]) {
                // do something preparatory
                before_handler = '/';
                child_app.all(before_handler, obj[before_action_key]);
                verbose && console.log('     ALL %s -> %s', before_handler, before_key);
            }
            
            handler = '/';
            child_app.get(handler, obj.index);
            verbose && console.log('     GET %s -> %s', handler, 'index');

        }


        // generate routes based
        // on the exported methods
        for (var key in obj) {
            // "reserved" exports
            //if (~['name', 'prefix', 'engine', 'before', 'io', 'plural'].indexOf(key)) continue;
            // whitelisted routes
            if (!~['find', 'findAll', 'create', 'update', 'delete'].indexOf(key)) continue;
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
                    handler = app.get('index_root') ? '/' + app.get('index_root') : '/';
                break;
                default:
                    // using whitelist, shouldn't ever get here...
                    throw new Error('unrecognized route: ' + name + '.' + key);
            }
            
            before_action_key = 'before'+ucfirst(key);
            before_key = 'before'+ucfirst(plural)+ucfirst(key);

            if (obj[before_action_key]) {
                before_handler = '/' + plural;
                child_app.all(before_handler, obj[before_action_key]);
                verbose && console.log('     ALL %s -> %s', before_handler, before_key);
                before_handler = '/' + plural + '/:' + name + '_id';
                child_app.all(before_handler, obj[before_action_key]);
                verbose && console.log('     ALL %s -> %s', before_handler, before_key);
                before_handler = '/' + plural + '/:' + name + '_id/*';
                child_app.all(before_handler, obj[before_action_key]);
                verbose && console.log('     ALL %s -> %s', before_handler, before_key);
            }
            
            handler = prefix + handler;
            child_app[method](handler, obj[key]);
            verbose && console.log('     %s %s -> %s', method.toUpperCase(), handler, key);
            
        }
        
        // 404 middleware support
        if(obj.fourOhFour) {
            child_app.use(obj.fourOhFour);
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
