
/**
  * bckmn
  *
  * @author Joshua Beckman <@jbckmn> || <jsh@bckmn.com>
  * @license The MIT license. 2013
  *
  */

var express = require('express')
  , load = require('express-load')
  , mongoose = require('mongoose')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash')
  , io = require('socket.io')
  , Post = require('./models/post')
  , postHelpers = require('./lib/postHelpers')
  , fs = require('fs')
  , config = JSON.parse(fs.readFileSync('./config.json'));

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// For Heroku sockets to work
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

// Define what/which mongo to yell at
var mongoUri = process.env.MONGOLAB_URI
                || process.env.MONGOHQ_URL
                || config.mongo.url;

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    app.set('port', process.env.PORT || 5000);
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(flash());
    app.use(express.cookieParser('your secret here'));
    app.use(express.cookieSession({ secret: 'marybeth and the fox fighting bant', cookie: { maxAge: 1000*60*60*24*30 } })); // CHANGE THIS SECRET!
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});
app.configure('development', function(){
    app.use(express.errorHandler({ showStack: true }));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});

mongoose.connect(mongoUri);
server.listen(app.get('port'));
// Let's see what's going on
console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);

function ensureAuth(req, res, next) {
  if(req.query.key && req.query.key == process.env.BLOG_KEY) {return next();}
  req.flash('error', "Not allowed. You can't always get what you want.");
  res.redirect('/');
}

// Setup routes
require('./routes/frontEnd')(app, io, ensureAuth);
require('./routes/backEnd')(app, io, ensureAuth);
require('./routes/api')(app, io, ensureAuth);
io.sockets.on('connection', function (socket) {
  socket.on('markMyWords', function(data){
    socket.emit('markedWords', {markedWords: Post.markMyWords(data.string)});
  });
  socket.on('updatePost', function(data){
    postHelpers.updatePost(data, io, function(err, result){
      socket.emit('savedPost', {post: result});
    })
  });
  socket.on('createPost', function(data){
    postHelpers.createPost(data, io, function(err, result){
      socket.emit('savedPost', {post: result});
    })
  });
});

app.configure('development', function(){
  var repl = require('repl').start('liverepl> ');
  repl.context.io = io;
  repl.context.Post = Post;
})
