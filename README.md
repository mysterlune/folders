# Folders

This module handles initialization of an MVC application built on Express incorporating WebSockets (Socket.io).
There is no application-specific logic concerning this module; it's entire responsibility is to export a
module from (./lib/server) that may be passed a set of configurations for its runtime.  It is the consuming
application's responsibility to provide the configurations and invoke the `server([options])` function.