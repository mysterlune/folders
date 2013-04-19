/*
server
    # Configures and runs and instance of Express given a set of configuration options
    # Concerned with loading Express and delegating functionality to loaders (like io, db)
    # TODO: Determine if options should be runtime configuration (mode), or parameter passed in
boot
    # Loads server dependencies: controller, model, view
    # Concerned with loading dependencies in particular order, unconcerned with type of things being loaded
db
    # Describe fixtures
    # Stub for future db-ification of the app
    # Concerned with interfaces to data, sets of data, anything orm-like in nature (as well as fixtures)
io
    # Loads socket listeners targeting payload handlers (defined in controller)
lib
    # Warehouse of controllers, models, views
    controllers
        # Static definitions of properties methods for servicing client requests
        # Concerned with brokering requests to remote/local sources and defers response until results are aggregated
        # This is where app.get('/thing', ... ) kinds of handlers are
        # This is where socket payload handlers are
    models
        # Concerned with defining data types, objects, and properties thereof
        # Not concerned with the actual data source; describes data objects and relations
    views
        # Warehouse for layout/templates the app serves
        # Concerned with pages a browser would consume
        # Not concerned with data service responses (the controller handles those directly)
        # TODO Should the view be concerned with the formatting and serving of JSON, etc?

app
    public
        # Warehouse for dependencies/assets the browser would consume
        # Output directory for grunt tasks that compile/minify/etc. the client code
*/

module.exports = require('./lib/server');