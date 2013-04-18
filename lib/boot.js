/*
parent The express application loading this module
    The global application is simply: app
    ... so you could just do app.get([setting])...
    Passing the parent was introduced early on when using a global "app"
    did not seem to be the best idea.  It turns out that it's common
    to use a global "app" in express projects
options Hash of key/value pairs for configuring
*/
(function() {
    
    var verbose = app.get('verbose_startup');
    
    // load models (stores app.set('models', models))
    require('./db');
    
    // load controllers (stores app.set('controllers', controllers))
    require('./controller');
    
    // load socket payload handlers
    require('./io');
    
})(this);
