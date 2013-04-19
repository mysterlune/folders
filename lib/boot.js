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
    
    /**
    
        Please note, for some reason the boot routine occasionally causes app.set('','') calls
        to get squashed.  If you are trying to apply a value to the global app somewhere in 
        this routine, and are NOT seeing that value available in the app.get() call elsewhere
        in the application, try placing your middleware toward the top of the list.
    
    **/
    
    // Load the localization middleware
    //  This portion of the boot routine adds a "loc" key on the the global app, which
    //  is a handle to the return of a function defined in ./loc
    //  FIXME Currently, the return of app.get('loc') is just a function that returns
    //  any string you pass it, e.g.:
    //      var loc = app.get('loc');
    //      var str = loc('Foo Schnickens');
    //      console.log(str); // outputs 'Foo Schnickens'
    require('./loc');
    
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
