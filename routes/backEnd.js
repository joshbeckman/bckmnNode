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
    , sm = require('sitemap')
    , awsKey = process.env.AWS_KEY
    , awsSec = process.env.AWS_SEC
    , s3 = require('s3')
    , client = s3.createClient({
        maxAsyncS3: 20,     // this is the default
        s3RetryCount: 3,    // this is the default
        s3RetryDelay: 1000, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
          accessKeyId: awsKey,
          secretAccessKey: awsSec,
        }
      });
module.exports = function (app, io, ensureAuth) {

  app.get('/w', function(req,res){
    Post.getUnpublishedPosts(function(err, postList){
      Post.findOne({_id: req.query.edit}).lean().exec(function(err,post){
        res.render('writer', {
          title: 'Write',
          post: post,
          postList: postList,
          marked: marked,
          noTracking: true,
          message: req.flash('message'),
          error: req.flash('error'),
          req: req
        });
      });
    });
  });

  app.post('/api/create', function(req,res){
    if(req.body.key && req.body.key == process.env.BLOG_KEY) {
      var newPost = new Post;
      newPost.markdown = req.body.markdown;
      newPost.title = req.body.title;
      if (req.files.image){
        uploadImage(req.files.image, function(err, data, filePath){
          newPost.image = filePath;
          newPost.slug = Post.slugify(req.body.title);
          newPost.html = marked(req.body.markdown);
          newPost.lede = marked(req.body.markdown.split('\n\n').slice(0,3).join('\n\n'));
          if (req.body.link)
            newPost.link = req.body.link;
          newPost.published = req.body.published ? true : false;
          newPost.searchableTime = moment(new Date).format('dddd MMMM Do YYYY h:mm:ss A');
          newPost.save(function(err,result){
            if (err){
              res.status(500).jsonp(err);
            } else{
              res.status(201).jsonp(result);
            }
          });
        });
      } else {
        newPost.slug = Post.slugify(req.body.title);
        newPost.html = marked(req.body.markdown);
        newPost.lede = marked(req.body.markdown.split('\n\n').slice(0,3).join('\n\n'));
        if (req.body.link)
          newPost.link = req.body.link;
        newPost.published = req.body.published ? true : false;
        newPost.searchableTime = moment(new Date).format('dddd MMMM Do YYYY h:mm:ss A');
        newPost.save(function(err,result){
          if (err){
            res.status(500).jsonp(err);
          } else{
            res.status(201).jsonp(result);
          }
        });
      }
    } else {
      res.status(403).jsonp(req.body);
    }
  });

  app.post('/api/edit/:id', function(req,res){
    if(req.body.key && req.body.key == process.env.BLOG_KEY) {
      Post.findOne({_id: req.params.id}).exec(function(err, newPost){
        newPost.markdown = req.body.markdown;
        newPost.title = req.body.title;
        if (req.files.image){
          uploadImage(req.files.image, function(err, data, filePath){
            newPost.image = filePath;
            newPost.slug = Post.slugify(req.body.title);
            newPost.html = marked(req.body.markdown);
            newPost.lede = marked(req.body.markdown.split('\n\n').slice(0,3).join('\n\n'));
            if (req.body.link)
              newPost.link = req.body.link;
            newPost.published = req.body.published ? true : false;
            newPost.searchableTime = moment(new Date).format('dddd MMMM Do YYYY h:mm:ss A');
            newPost.save(function(err,result){
              if (err){
                res.status(500).jsonp(err);
              } else{
                res.status(201).jsonp(result);
              }
            });
          });
        } else {
          newPost.slug = Post.slugify(req.body.title);
          newPost.html = marked(req.body.markdown);
          newPost.lede = marked(req.body.markdown.split('\n\n').slice(0,3).join('\n\n'));
          if (req.body.link)
            newPost.link = req.body.link;
          newPost.published = req.body.published ? true : false;
          newPost.searchableTime = moment(new Date).format('dddd MMMM Do YYYY h:mm:ss A');
          newPost.save(function(err,result){
            if (err){
              res.status(500).jsonp(err);
            } else{
              res.status(201).jsonp(result);
            }
          });
        }
      });
    } else {
      res.status(403).jsonp(req.body);
    }
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
    if ('words' == req.subdomains.join('')){
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
    } else if ('www' == req.subdomains.join('')){
      urls.push({url: '/soundcloud-animations', changefreq: 'weekly', priority: 0.8});
      urls.push({url: '/css-tricked-out', changefreq: 'weekly', priority: 0.8});
      urls.push({url: '/polarpageviews', changefreq: 'weekly', priority: 0.8});
      urls.push({url: '/penrose-triangle-animation', changefreq: 'weekly', priority: 0.8});
      var sitemap = sm.createSitemap ({
                    hostname: 'http://' + req.host,
                    cacheTime: 600000,        // 600 sec - cache purge period
                    urls: urls
                  });
      sitemap.toXML( function (xml) {
          res.header('Content-Type', 'application/xml');
          res.send( xml );
      });
    } else {
      var sitemap = sm.createSitemap ({
                    hostname: 'http://' + req.host,
                    cacheTime: 600000,        // 600 sec - cache purge period
                    urls: urls
                  });
      sitemap.toXML( function (xml) {
          res.header('Content-Type', 'application/xml');
          res.send( xml );
      });
    }
  });

  app.get('/rss.xml', function(req, res){
    Post.find({published: true}).limit(20).sort('-modified').lean().exec(function(err,posts){
      var feed = new RSS({
          title: 'Words & Josh Beckman',
          description: 'Josh Beckman (@jbckmn), a developer, designer, data scientist and photographer in Chicago, IL.',
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
            description: posts[i].image ? '<img src="' + posts[i].image + '"/>' + posts[i].html : posts[i].html,
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

function uploadImage(formImage, cb){
  var remote = (new Date).toISOString().substring(0,10) + '/' + formImage.name;
  s3Thing(formImage.path, remote, 'andjosh', cb);
}

function s3Thing(local, remote, bucket, cb){
  var params = {
      localFile: local,
      s3Params: {
        Bucket: bucket,
        Key: remote,
      }
    },
    uploader = client.uploadFile(params);
  uploader.on('error', function(err) {
    console.error("unable to upload file to s3:", err.stack);
    cb(err, null, null);
  });
  uploader.on('end', function(data) {
    console.log("done uploading file to s3");
    cb(null, data, ('https://s3.amazonaws.com/' + bucket + '/' + remote));
  });
}