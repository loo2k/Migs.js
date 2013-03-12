
/**
 * Module dependencies.
 */

var express = require('express'),
    expressValidator = require('express-validator'),
    partials         = require('express-partials'),
    routes           = require('./routes'),
    http             = require('http'), 
    path             = require('path'),
    fs               = require('fs'),
    config           = require('./config').config;

// ensure upload dir exists
fs.exists(config.upload_dir, function(exists) {
    if( !exists ) {
        fs.mkdir(config.upload_dir, function(err) {
            if(err) {
                return err;
            }
        });
    }
});

var app = express();

app.configure(function() {
    app.set('port', config.port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.engine('.html', require('ejs').__express);
    app.use(partials());
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(expressValidator);
    app.use(express.cookieParser());
    app.use(express.session({secret: config.session_secret}));
    app.use(require('./controllers/user').authLogin);
    app.use(function(req, res, next) {
        res.locals.config = config;
        next();
    });
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, config.static_dir)));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// routes
routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
