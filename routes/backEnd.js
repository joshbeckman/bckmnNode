/*
 * Back End routes
 */
var moment = require('moment')
    , fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , Post = require('../models/post')
    , marked = require('marked')
    , moment = require('moment')
    , sm = require('sitemap')
    , urls = [
        {url: '/', changefreq: 'daily', priority: 1},
        {url: '/api', changefreq: 'daily', priority: 0.9},
        {url: '/pay', changefreq: 'monthly', priority: 0.7},
      ];
Post.find({published: false}).lean().exec(function(err,posts){
  for(i=0;i<posts.length;i++){
    urls.push({url: '/blog/'+posts[i].slug, changefreq: 'daily', lastmod: moment(posts[i].modified).format('YYYY-MM-DD'), priority: 0.8});
  };
});
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
        });  
      });
    });
  });
  
  app.get('/sitemap.xml', function(req,res){
    var sitemap = sm.createSitemap ({
                    hostname: 'http://www.bckmn.com',
                    cacheTime: 600000,        // 600 sec - cache purge period
                    urls: urls
                  });
    sitemap.toXML( function (xml) {
        res.header('Content-Type', 'application/xml');
        res.send( xml );
    });
  });
}
