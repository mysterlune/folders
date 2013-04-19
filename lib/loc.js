var object = require('object')
    , express = require('express')
    , _ = require('underscore')
    fs = require('fs')
    path = require('path');
    
(function() {
    
    var clearName = function clearName(name) {
        if(/\.js/.test(name)) {
            var name_regex = /([\w\d]+)\.js/;
            var stripped = name.match(name_regex);
            if(stripped.length && stripped.length > 1) { name = stripped[1]; }
        }
        return name;
    }
    
    // If we got here first for some crazy reason, define the global app
    if(typeof app === 'undefined') {
        app = express();
    }
    
    var loc = function(str) {
        
        return str;
        
    }
    
    app.set('loc', loc);

})(this);
