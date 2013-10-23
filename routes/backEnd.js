/*
 * Back End routes
 */
var moment = require('moment')
    , fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , Post = require('../models/post');

module.exports = function (app, io, ensureAuth) {
  app.get('/w', ensureAuth, function(req,res){
    Post.getUnpublishedPosts(function(err, unpublishedPosts){
      res.render('write', {
        title: 'Write', 
        unpublishedPosts: unpublishedPosts,
        message: req.flash('message'), 
        error: req.flash('error'), 
        req: req
      })  
    })
  })
}
