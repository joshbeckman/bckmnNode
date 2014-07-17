/*
 * Back End routes
 */
var moment = require('moment')
    , fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , Post = require('../models/post')
    , Thought = require('../models/thought')
    , marked = require('marked')
    , moment = require('moment')
    , RSS = require('rss')
    , sm = require('sitemap');
module.exports = function (app, io, ensureAuth) {

  app.get('/w', ensureAuth, function(req,res){
    Post.findOne({_id: req.query.edit}).lean().exec(function(err,post){
      res.render('write', {
        title: 'Write',
        post: post,
        marked: marked,
        noTracking: true,
        socket: true,
        message: req.flash('message'),
        error: req.flash('error'),
        req: req
      });
    });
  });

  app.get('/t', ensureAuth, function(req,res){
    Thought.createThought({text: req.query.text, color: req.query.color}, function(err, result){
      if (err){
        res.jsonp(err);
      } else{
        res.jsonp(result);
      }
    });
  });
  
  app.get('/tt', function(req,res){
    res.render('think', {
      title: 'Think',
      noTracking: true,
      message: req.flash('message'),
      error: req.flash('error'),
      req: req
    });
  });

  app.get('/sitemap.xml', function(req,res){
    var urls = [
        {url: '/', changefreq: 'daily', priority: 1}
      ];
    Post.find({published: true}).sort('-modified').lean().exec(function(err,posts){
      for(i=0;i<posts.length;i++){
        urls.push({url: '/post/'+posts[i].slug, changefreq: 'daily', lastmod: moment(posts[i].modified).format('YYYY-MM-DD'), priority: 0.8});
      }
      var sitemap = sm.createSitemap ({
                    hostname: 'http://words.andjosh.com',
                    cacheTime: 600000,        // 600 sec - cache purge period
                    urls: urls
                  });
      sitemap.toXML( function (xml) {
          res.header('Content-Type', 'application/xml');
          res.send( xml );
      });
    });
  });

  app.get('/rss.xml', function(req, res){
    Post.find({published: true}).sort('-modified').lean().exec(function(err,posts){
      var feed = new RSS({
          title: 'Words & Josh',
          description: 'Joshua Beckman is in downtown Chicago',
          feed_url: 'http://words.andjosh.com/rss.xml',
          site_url: 'http://words.andjosh.com',
          image_url: config.image_path,
          author: 'Joshua Beckman',
          language: 'en',
          pubDate: (new Date),
          ttl: '60'
      });
      for(i=0;i<posts.length;i++){
        feed.item({
            title:  posts[i].title,
            description: posts[i].html,
            url: 'http://words.andjosh.com/post/'+posts[i].slug + '?utm_medium=rss',
            date: posts[i].modified,
            lat: config.location.latitude,
            long: config.location.longitude
        })
      };
      res.header('Content-Type', 'application/xml');
      res.send( feed.xml() );
    });
  });
}
