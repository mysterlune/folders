/**

This routine is an auto-run builder for the global app object.
The global application is simply: app
Code within the required modules here do things like:
    app.get([setting]);
    app.set('key', 'value');
    
@see controller.js
@see db.js
@see io.js

**/
(function() {
        
    // Load models (stores app.set('models', models))
    //  Not exactly a "DB", but rather an interface to the data store.  Currently,
    //  the db routine loads adapters for remote resources so requests to the payload
    //  handlers (and/or controller REST endpoints, if implemented) can relay those
    //  requests to the appropriate backend (i.e. the REST API).
    require('./db');
    
    // Load controllers (stores app.set('controllers', controllers))
    //  This section of the boot routine establishes Express app.get('/endpoint' ... )
    //  kinds of routes.  This is useful if the application needs to respond to
    //  typical HTTP/s requests.
    require('./controller');
    
    // Load socket payload handlers
    //  This section of the boot routine wires up the controller objects with
    //  websocket payload handlers.  These are essentially the websocket counterpart
    //  to the HTTP routes loaded in the controller.
    require('./io');
    
})(this);
