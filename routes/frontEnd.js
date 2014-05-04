/*
 * Front End routes
 */
var moment = require('moment')
    , passport = require('passport')
    , fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , api_key = process.env.STRIPE_SECRET_KEY,
    stripe = require('stripe')(api_key),
    api_public = process.env.STRIPE_PUBLIC_KEY,
    Post = require('../models/post'),
    Thought = require('../models/thought'),
    Account = require('../models/account'),
    moment = require('moment'),
    getHTML = require('../lib/getHTML').getHTML,
    request = require('request'),
    zlib = require('zlib');

module.exports = function (app, io, ensureAuth) {
  app.get('/', function(req, res) {
    Thought.getLatest(15, function(err, thoughts) {
      res.render('index', { title: 'Joshua Beckman || jbckmn',
                        user: req.user,
                        images: config.front.images,
                        imageSrc: config.front.src,
                        message: req.flash('message'),
                        error: req.flash('error'),
                        req: req,
                        vampire: true,
                        isHome: true,
                        latestThought: thoughts[0],
                        thoughts: thoughts });
    });
  });
  app.get('/blog/:slug', function(req,res){
    Post.findOne({slug: req.params.slug}).lean().exec(function(err,post){
      console.log(post);
      if (err || !post) {
        res.redirect('/search?q='+req.params.slug);
      } else {
        Post.getOneExcept(post.slug, function(err, relatedPost){
          res.render('blogPost', {title: post.title+' | Joshua Beckman',
                                user: req.user,
                                post: post,
                                description: post.markdown.slice(0,150),
                                relatedPost: relatedPost,
                                moment: moment,
                                images: config.front.images,
                                imageSrc: config.front.src,
                                message: req.flash('message'),
                                error: req.flash('error'),
                                req: req})
        });
      }
    });
  });
  app.get('/blog', function(req,res){
    Post.getLatestPosts(15, function(err, posts){
      res.render('blog', { title: 'Blog by Joshua Beckman || jbckmn',
                          user: req.user,
                          posts: posts,
                          moment: moment,
                          images: config.front.images,
                          imageSrc: config.front.src,
                          message: req.flash('message'),
                          error: req.flash('error'),
                          req: req });
    });
  });
  app.get('/blog/:slug/edit', ensureAuth, function(req,res){
    Post.findOne({slug: req.params.slug}).lean().exec(function(err,post){
      res.redirect('/w?key='+req.query.key+'&edit='+post._id)
    });
  });
  app.get('/search', function (req, res) {
    Post.find({published: true, keywords: { $all: Post.extractKeywords(req.query.q) } }, null, {sort:{modified: -1}}).lean().exec(function(err, posts) {
      res.render('index', { title: 'Results for: '+req.query.q,
                          user: req.user,
                          posts: posts,
                          queryString: req.query.q,
                          images: config.front.images,
                          imageSrc: config.front.src,
                          message: req.flash('message'),
                          error: req.flash('error'),
                          req: req });
    });
  })

  app.get('/pay', function(req, res) {
      res.render('pay', { title: 'Joshua Beckman accepts credit cards!',
                            description: "You can pay Joshua Beckman via secure credit card transaction on this super-simple form!",
                            publicKey: api_public,
                            amount: req.query.amount,
                            email: req.query.email,
                            text: req.query.message,
                            images: config.front.images,
                            imageSrc: config.front.src,
                            message: req.flash('message'),
                            error: req.flash('error'),
                            req: req });
  });

  app.post('/pay/thanks', function(req, res) {
    stripe.charges.create(
      {
        amount: parseInt(parseFloat(req.body.amount)*100),
        currency: "usd",
        card: req.body.stripeToken,
        description: req.body.email+' '+req.body.message
      },
      function(err, charge) {
        if (err) {
           console.log(err.message);
           req.flash('error', err.message);
           res.redirect('/pay/error');
        }
        if (!err) {
          console.log("charge id", charge.id);
          req.flash('message', 'Success!');
          res.render('payThanks', {  title: 'Thank you!',
                                  name: process.env.PAYEE_NAME,
                                  charge: charge,
                                  paidAmount: req.body.amount,
                                  paidMessage: req.body.message,
                                  images: config.front.images,
                                  imageSrc: config.front.src,
                                  message: req.flash('message'),
                                  error: req.flash('error'),
                                  req: req });
        }
      }
    );
  });
  app.post('/login', passport.authenticate('local', { failureRedirect: '/', failureFlash: 'Invalid email or password.' }), function(req, res) {
    res.redirect('/');
  });
  app.get('/logout', function(req, res) {
    req.logout();
    req.flash('message', 'You have been signed out.');
    res.redirect('/');
  });
  app.get('/register', function(req, res) {
    res.render('register', { title: 'Register with bckmn.com', user: req.user, message: req.flash('message'), error: req.flash('error') });
  });
  app.post('/register', function(req,res) {
    if (req.body.password != req.body.password_conf) {
      req.flash('error', 'Password and password confirmation must match.')
      res.redirect('/');
    }
    Account.register(new Account({ email : req.body.email, username: req.body.email.match(/^[^@]*/) }), req.body.password, function(err, account) {
      if (err) {
        req.flash('error', 'That email is already in use.')
        return res.redirect('/register');
      }
      passport.authenticate('local')(req, res, function () {
        //account.welcomeEmail();
        req.flash('message', 'Thank you, '+account.username+'!')
        stripe.charges.create(
          {
            amount: parseInt(parseFloat(req.body.amount)*100),
            currency: "usd",
            card: req.body.stripeToken,
            description: req.body.email+' '+req.body.message
          },
          function(err, charge) {
            if (err) {
              console.log(err.message);
              req.flash('error', 'Your account was created, but: ' + err.message);
              res.redirect('/pay/error');
            }
            if (!err) {
              console.log("charge id", charge.id);
              res.render('payThanks', {  title: 'Thank you!',
                                       name: process.env.PAYEE_NAME,
                                       charge: charge,
                                       paidAmount: req.body.amount,
                                       paidMessage: req.body.message,
                                       images: config.front.images,
                                       imageSrc: config.front.src,
                                       message: req.flash('message'),
                                       error: req.flash('error'),
                                       req: req });
            }
          }
        );
      })
    });
  });
  app.get('/pay/error', function(req, res) {
    res.render('payError', { title: 'Oh Noes!',
                          message: req.flash('message'),
                          error: req.flash('error'),
                          images: config.front.images,
                          imageSrc: config.front.src,
                          req: req });
  });
  app.get('/polarpageviews', function(req, res) {
    res.render('polarPageviews', { title: 'Polar Pageviews',
                          description: "View data from your Google Analytics properties by day, week & month from the previous 365 days.",
                          images: config.front.images,
                          imageSrc: config.front.src,
                          message: req.flash('message'),
                          error: req.flash('error'),
                          req: req });
  });
  app.get('/naked-wordpress', function(req,res){
    res.redirect('http://naked-wordpress.bckmn.com');
  });
  app.get('/stark-lines', function(req,res){
    res.redirect('http://starklin.es');
  });
  app.get('/loading-soundcloud', function(req,res){
    res.render('soundcloud', { title: 'SoundCloud Loading Animations',
                          description: "Experimenting with loading or music playback animations for SoundCloud",
                          images: config.front.images,
                          imageSrc: config.front.src,
                          message: req.flash('message'),
                          error: req.flash('error'),
                          req: req });
  });
  app.get('/css-tricked-out', function(req,res){
    var headers = {
      "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
      "accept-language" : "en-US,en;q=0.8",
      "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
      "accept-encoding" : "gzip,deflate",
    };
     
    var options = {
      url: "http://css-tricks.com",
      headers: headers
    };
    var requestWithEncoding = function(options, callback) {
      var req = request.get(options);
     
      req.on('response', function(res) {
        var chunks = [];
        res.on('data', function(chunk) {
          chunks.push(chunk);
        });
     
        res.on('end', function() {
          var buffer = Buffer.concat(chunks);
          var encoding = res.headers['content-encoding'];
          if (encoding == 'gzip') {
            zlib.gunzip(buffer, function(err, decoded) {
              callback(err, decoded && decoded.toString());
            });
          } else if (encoding == 'deflate') {
            zlib.inflate(buffer, function(err, decoded) {
              callback(err, decoded && decoded.toString());
            })
          } else {
            callback(null, buffer.toString());
          }
        });
      });
     
      req.on('error', function(err) {
        callback(err);
      });
    }

    requestWithEncoding(options, function(err, body) {
      body = body.split('</head>');
      console.log(body.length);
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
}
