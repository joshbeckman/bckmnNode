
/*
 * socket.io routing
 */

var fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , passport = require('passport')
    , moment = require('moment')
    , Post = require('../models/post')
    , postHelpers = require('../lib/postHelpers');

module.exports = function (app, io) {

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

};