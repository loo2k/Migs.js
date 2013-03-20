seajs.config({
    //base: 
    alias: {
        'tooltip': 'lib/bootstrap-tooltip.js',
        'tab': 'lib/bootstrap-tab.js'
    },
    // Enable plugins
    plugins: ['shim'],

    // Configure shim for non-CMD modules
    shim: {
        'jquery': {
            src: 'lib/jquery-1.9.1.min.js',
            exports: 'jQuery'
        }
    }
});