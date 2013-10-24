/*
 * Back End routes
 */
var moment = require('moment')
    , fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , Post = require('../models/post')
    , marked = require('marked');

module.exports = function (app, io, ensureAuth) {
  app.get('/w', ensureAuth, function(req,res){
    Post.findOne({_id: req.query.edit}).lean().exec(function(err,post){
      Post.getUnpublishedPosts(function(err, unpublishedPosts){
        res.render('write', {
          title: 'Write', 
          post: post,
          marked: marked,
          unpublishedPosts: unpublishedPosts,
          message: req.flash('message'), 
          error: req.flash('error'), 
          req: req
        })  
      })
    })
  })
}
