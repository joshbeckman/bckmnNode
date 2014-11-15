/*
 * Front End routes
 */
var passport = require('passport'),
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync('./config.json')),
    api_key = process.env.STRIPE_SECRET_KEY,
    stripe = require('stripe')(api_key),
    api_public = process.env.STRIPE_PUBLIC_KEY,
    Post = require('../models/post'),
    moment = require('moment'),
    request = require('request'),
    impersonate = require('../lib/getHTML').impersonate;

module.exports = function (app, io, ensureAuth) {
  app.get('/', function(req, res) {
    var sub = req.subdomains.join(''),
      subnet = sub == '' ? 'www' : req.subdomains.join('-'),
      subname = sub == '' ? 'www & Josh' : req.subdomains.join(', ') + ' & Josh';
    if (config.members[subnet]){
      if (config.members[subnet].redirect){
        res.redirect(config.members[subnet].redirect);
      } else if (blocks[subnet]) {
        blocks[subnet](req, res, subnet, subname);
      } else {
        res.render(subnet, { title: subname + ' Beckman',
                            description: config.members[subnet].description,
                            req: req,
                            subnet: subnet,
                            query: req.query,
                            stripeKey: api_public,
                            message: req.flash('message'), 
                            error: req.flash('error') });
      }
    } else {
      res.redirect('http://you.andjosh.com?sub=' + sub);
    }
  });
  app.get('/test-moi', function(req,res){
    blocks['words'](req, res, 'words', 'words');
    // res.render('you', { title: 'you',
    //                         description: 'config.members[subnet].description',
    //                         req: req,
    //                         subnet: 'about',
    //                         query: req.query,
    //                         stripeKey: api_public,
    //                         message: req.flash('message'), 
    //                         error: req.flash('error') });
  });
  app.get('/post/:slug', function(req,res){
    checkSubdomain(req, res, 'words', function(){
      Post.findOne({slug: req.params.slug}).lean().exec(function(err,post){
        if (err || !post) {
          res.redirect('/search?q='+req.params.slug);
        } else {
          Post.getPrePost(post.modified, function(err, np){
            res.render('blogPost',  {
                                      title: post.title+' | & Joshua Beckman',
                                      post: post,
                                      subnet: 'words',
                                      description: post.html.replace(/(<([^>]+)>)/ig,"").slice(0,140) + '...',
                                      nextPost: np.next,
                                      prevPost: np.prev,
                                      moment: moment,
                                      message: req.flash('message'),
                                      error: req.flash('error'),
                                      req: req
                                    });
          });
        }
      });
    });
  });
  app.get('/post/:slug/edit', ensureAuth, function(req,res){
    checkSubdomain(req, res, 'words', function(){
      Post.findOne({slug: req.params.slug}).lean().exec(function(err,post){
        res.redirect('/w?key='+req.query.key+'&edit='+post._id)
      });
    });
  });
  app.post('/post/:id/comment', function(req, res){
    checkSubdomain(req, res, 'words', function(){
      Post.findOne({_id: req.params.id}).exec(function(err, post){
                
        if (req.body.a == '5' && req.body.author != '' && req.body.comment != ''){
          post.comments.push({
            author: req.body.author,
            body:req.body.comment,
            date: (new Date)
          });
          post.save(function(err,result){
            if(err) console.log('err commenting post:', err);
          }); 
          req.flash('message', 'Successfully commented!');
        } else {
          req.flash('error', 'Error commenting!');
        }
        res.redirect('/post/'+post.slug);
      });
    });
  });
  app.get('/search', function (req, res) {
    checkSubdomain(req, res, 'words', function(){
      Post.find({published: true, keywords: { $all: Post.extractKeywords(req.query.q) } }, null, {sort:{modified: -1}}).lean().exec(function(err, posts) {
        res.render('words', { title: 'Results for: '+req.query.q,
                            posts: posts,
                            subnet: 'words',
                            moment: moment,
                            queryString: req.query.q,
                            message: req.flash('message'),
                            error: req.flash('error'),
                            req: req });
      });
    });
  });

  app.post('/payment-thanks-400', function(req, res) {
    console.log(req.body);
    checkSubdomain(req, res, 'payments', function(){
      stripe.charges.create(
        {
          amount: parseInt(400,10),
          currency: "usd",
          card: req.body.stripeToken,
          description: req.body.stripeEmail
        },
        function(err, charge) {
          if (err) {
            console.log(err.message);
            req.flash('error', err.message);
            res.redirect('/payment-error');
          }
          if (!err) {
            console.log("charge id", charge.id);
            req.flash('message', 'Success!');
            res.render('payThanks', {  title: 'Thank you!',
                                      name: 'Joshua Beckman',
                                      charge: charge,
                                      subnet: 'Thanks',
                                      paidAmount: 4.00,
                                      paidMessage: req.body.message,
                                      message: req.flash('message'),
                                      error: req.flash('error'),
                                      req: req });
          }
        }
      );
    });
  });
  app.get('/payment-error', function(req, res) {
    checkSubdomain(req, res, 'payments', function(){
      res.render('payError', { title: 'Oh Noes!',
                              message: req.flash('message'),
                              subnet: 'Errors',
                              error: req.flash('error'),
                              req: req });
    });
  });
  app.get('/penrose-triangle-animation', function(req,res){
    checkSubdomain(req, res, 'www', function(){
      res.render('penroseSteps', { title: 'Building A Penrose Triangle Animation',
                              description: 'Watch an animation in pure Javascript (JS) and CSS (CSS3) of an impossible Penrose Triangle by Joshua Beckman',
                              req: req,
                              subnet: 'www & Josh',
                              query: req.query,
                              stripeKey: api_public,
                              message: req.flash('message'), 
                              error: req.flash('error') });
    });
  });
  app.get('/polarpageviews', function(req, res) {
    checkSubdomain(req, res, 'www', function(){
      res.render('polarPageviews', { title: 'Polar Pageviews',
                                    description: "View data from your Google Analytics properties by day, week & month from the previous 365 days.",
                                    images: config.front.images,
                                    imageSrc: config.front.src,
                                    message: req.flash('message'),
                                    error: req.flash('error'),
                                    req: req });
    });
  });
  app.get('/css-tricked-out', function(req,res){
    checkSubdomain(req, res, 'www', function(){
      impersonate("http://css-tricks.com", function(err, body) {
        body = body.split('</head>');
        var foo = body[1].split('</body>');
        body = [body[0], '</head>', foo[0], '</body>', foo[1]];
        res.render('cssTrickedOut', {
          body: body,
          message: req.flash('message'),
          error: req.flash('error'),
          req: req
        });
      });
    });
  });
  app.get('/naked-wordpress', function(req,res){
    res.redirect(301, 'http://naked-wordpress.bckmn.com');
  });
  app.get('/stark-lines', function(req,res){
    res.redirect(301, 'http://starklin.es');
  });
  app.get('/loading-soundcloud', function(req,res){
    res.redirect(301, 'http://www.andjosh.com/soundcloud-animations');
  });
  app.get('/blog/:slug', function(req,res){
    res.redirect(301, 'http://words.andjosh.com/post/' + req.params.slug);
  });
  app.get('/blog', function(req,res){
    res.redirect(301, 'http://words.andjosh.com/');
  });
  app.get('/api', function(req,res){
    res.redirect(301, 'http://api.andjosh.com/');
  });
  app.get('/pay', function(req,res){
    res.redirect(301, 'http://payments.andjosh.com/');
  });
  app.get('/about', function(req,res){
    res.redirect(301, 'http://www.andjosh.com/');
  });
  app.get('/feed', function(req,res){
    res.redirect(301, 'http://words.andjosh.com/rss.xml');
  });
  app.get('/rss', function(req,res){
    res.redirect(301, 'http://words.andjosh.com/rss.xml');
  });

  var checkSubdomain = function(req, res, sub, cb){
      if (sub == req.subdomains.join('') || 'localhost' == req.host){
        cb();
      } else {
        res.redirect(req.protocol + '://' + sub + '.andjosh.com' + req.originalUrl);
      }
    },
    blocks = {
      api: function(req, res, subnet, subname){
        Post.getLatestPosts(1, 0, function(err, posts){
          var person = {},
            identifiers = {},
            externals = config.externals,
            fullResponse = {};
          identifiers.icon = config.icon_path;
          identifiers.image = config.image_path;
          identifiers.home_url = "http://www.bckmn.com";
          identifiers.first_name = config.first_name;
          identifiers.last_name = config.last_name;
          var years = moment().diff(config.birthdate, 'years'),
              months = moment(config.birthdate)
                      .add('years', years),
              weeks = moment(config.birthdate)
                      .add('years', years)
                      .add('months', moment().diff(months, 'months')),
              days = moment(config.birthdate)
                      .add('years', years)
                      .add('months', moment().diff(months, 'months'))
                      .add('weeks',moment().diff(weeks,'weeks')),
              hours = moment(config.birthdate)
                      .add('years', years)
                      .add('months', moment().diff(months, 'months'))
                      .add('weeks',moment().diff(weeks,'weeks'))
                      .add('days',moment().diff(days,'days')),
              minutes = moment(config.birthdate)
                      .add('years', years)
                      .add('months', moment().diff(months, 'months'))
                      .add('weeks',moment().diff(weeks,'weeks'))
                      .add('days',moment().diff(days,'days'))
                      .add('hours',moment().diff(hours,'hours')),
              seconds = moment(config.birthdate)
                      .add('years', years)
                      .add('months', moment().diff(months, 'months'))
                      .add('weeks',moment().diff(weeks,'weeks'))
                      .add('days',moment().diff(days,'days'))
                      .add('hours',moment().diff(hours,'hours'))
                      .add('minutes',moment().diff(minutes,'minutes')),
              milliseconds = moment(config.birthdate)
                      .add('years', years)
                      .add('months', moment().diff(months, 'months'))
                      .add('weeks',moment().diff(weeks,'weeks'))
                      .add('days',moment().diff(days,'days'))
                      .add('hours',moment().diff(hours,'hours'))
                      .add('minutes',moment().diff(minutes,'minutes'))
                      .add('seconds',moment().diff(seconds,'seconds'));
          person.age = {
            "years":years,
            "months":moment().diff(months, 'months'),
            "weeks":moment().diff(weeks, 'weeks'),
            "days": moment().diff(days, 'days'),
            "hours": moment().diff(hours, 'hours'),
            "minutes": moment().diff(minutes, 'minutes'),
            "seconds": moment().diff(seconds, 'seconds'),
            "milliseconds": moment().diff(milliseconds, 'milliseconds')
          };
          person.location = config.location;
          person.languages = config.languages;
          identifiers.externals = externals;
          fullResponse.person = person;
          fullResponse.identifiers = identifiers;
          if (posts && posts.length > 0) {
            fullResponse.blog = {
              rss: "http://words.andjosh.com/rss.xml",
              latest: [
                {
                  title: posts[0].title,
                  url: 'http://words.andjosh.com/post/'+posts[0].slug,
                  date: posts[0].modified
                }
              ]
            };
          }
          fullResponse._links = {
            self: {
              href: "/"
            }
          };
          res.jsonp(fullResponse);
        });
        request('http://www.google-analytics.com/collect?v=1&tid=UA-51342011-1&cid=555&t=pageview&dp=%2F&dh=api.andjosh.com&dt=API', function (err, resp, body){
          if (err){
            console.log(err);
          }
        });
      },
      words: function(req, res, subnet, subname){
        Post.getLatestPosts(10, (req.query.offset ? parseInt(req.query.offset, 10) : 0), function(err, posts){
          res.render(subnet, { title: subname + ' Beckman',
                              description: config.members[subnet].description,
                              req: req,
                              subnet: subnet,
                              query: req.query.sub,
                              posts: posts,
                              moment: moment,
                              message: req.flash('message'), 
                              error: req.flash('error') });
        });
      },
      www: function(req, res, subnet, subname){
        Post.getLatestPosts(1, 0, function(err, posts){
          res.render(subnet, { title: 'Josh Beckman',
                              description: config.members[subnet].description,
                              req: req,
                              subnet: subnet,
                              query: req.query.sub,
                              posts: posts,
                              moment: moment,
                              message: req.flash('message'), 
                              error: req.flash('error') });
        });
      }
    };
}
