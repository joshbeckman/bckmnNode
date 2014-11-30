require('newrelic');
var express = require('express')
  , load = require('express-load')
  , mongoose = require('mongoose')
  , http = require('http')
  , path = require('path')
  , app = express()
  , server = http.createServer(app)
  , flash = require('connect-flash')
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , bodyParser = require('body-parser')
  , multer = require('multer')
  , config = JSON.parse(fs.readFileSync('./config.json'))
  , mongoUri = process.env.MONGOLAB_URI
            || process.env.MONGOHQ_URL
            || config.mongo.url;

// For Heroku sockets to work
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

mongoose.connect(mongoUri);

app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(express.methodOverride());
app.use(flash());
app.use(express.cookieParser('You know you wanna'));
app.use(express.cookieSession({ secret: 'Oh come on mama', cookie: { maxAge: 1000*60*60*24*30 } }));
app.use(express.compress());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);
app.use(function(req, res, next){
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { 
      req: req, 
      message: [],
      error: [],
      title: '404 & Josh' 
    });
    return;
  }
  if (req.accepts('json')) {
    res.send(404, config.status['404']);
    return;
  }
  res.type('txt').send('404: Not found');
});
function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}
function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(500, config.status['500']);
  } else {
    next(err);
  }
}
function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}
function ensureAuth(req, res, next) {
  if(req.query.key && req.query.key == process.env.BLOG_KEY) {return next();}
  req.flash('error', "Not allowed. You can't always get what you want.");
  res.redirect('/');
}

// Setup routes
require('./routes/frontEnd')(app, io, ensureAuth);
require('./routes/backEnd')(app, io, ensureAuth);
require('./routes/io')(app, io);

server.listen(app.get('port'), function(){
  console.log("Josh listening on port %d in %s mode", app.get('port'), app.settings.env);
});