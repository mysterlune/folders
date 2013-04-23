var object = require('object')
    , express = require('express')
    , _ = require('underscore')
    , fs = require('fs')
    , path = require('path');
    
(function() {
    
    if(typeof app === 'undefined') {
        app = express();
    }
    
    var verbose = app && app.get('verbose_startup') || false;
    
    var clearName = function clearName(name) {
        if(/\.js/.test(name)) {
            var name_regex = /([\w\d]+)\.js/;
            var stripped = name.match(name_regex);
            if(stripped.length && stripped.length > 1) { name = stripped[1]; }
        }
        return name;
    }
    
    if(typeof app.get('models_dir') === 'undefined') {
        // FIXME Probably running tests if we're in this block... 
        //  Need a better way to configure an app for testing...
        app.set('models_dir', path.join(__dirname,'db'));
    }
    
    var models = {}
        , sources = {}
        , adapters = {};

    fs.readdirSync(path.join(app.get('models_dir'),'result_source')).forEach(function(name){
        
        // This is totally dumb...
        // TODO Look into https://npmjs.org/package/glob
        if (name == '.svn') return;
        
        var obj = require(path.join(app.get('models_dir'), 'result_source', name))
        ,   name = obj.name || clearName(name);
        sources[name] = obj;
    });
    
    fs.readdirSync(path.join(app.get('models_dir'),'adapters')).forEach(function(name){
        
        // This is totally dumb...
        // TODO Look into https://npmjs.org/package/glob
        if (name == '.svn') return;
        
        var obj = require(path.join(app.get('models_dir'), 'adapters', name))
        ,   name = obj.name || clearName(name);
        adapters[name] = obj;
    });
    
    _.each(sources, function(a,b,c) {
        if(adapters[b]) {

            var adapter = adapters[b].extend(a);
            var model = adapter.create();
            models[b] = model;
            
        } else {
            console.log('Did not find adapter for ' + b);
        }
        
    }, this);

    app.set('models', models);

})(this);

module.exports = function(type) {
    var models = app.get('models');
    if(models.hasOwnProperty(type)) {
        return models[type];
    } else {
        throw new Error('Could not find model ' + type + ' in the set of models');
        return false;
    }
}