/*
 * Front End routes
 */
var moment = require('moment')
    , fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , api_key = process.env.STRIPE_SECRET_KEY,
    stripe = require('stripe')(api_key),
    api_public = process.env.STRIPE_PUBLIC_KEY,
    Post = require('../models/post'),
    moment = require('moment');

module.exports = function (app, io, ensureAuth) {
  app.get('/', function(req, res) {
    Post.getLatestPosts(15, function(err, posts){
      res.render('index', { title: 'Joshua Beckman is a web developer and photographer in downtown Chicago', 
                          user: req.user, 
                          posts: posts,
                          images: config.front.images, 
                          imageSrc: config.front.src, 
                          message: req.flash('message'), 
                          error: req.flash('error'), 
                          req: req,
                          thoughts: config.thoughts });
    });
  });
  app.get('/blog/:slug', function(req,res){
    Post.find({published: true}).limit(10).lean().exec(function(err,related){
      relatedPost = related[Math.floor(Math.random() * related.length)];
      Post.findOne({slug: req.params.slug}).lean().exec(function(err,post){
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
                                req: req,
                                thoughts: config.thoughts})
      });
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
                          req: req,
                          thoughts: config.thoughts });
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
           res.redirect('/error');
        }
        if (!err) {
          console.log("charge id", charge.id);
          req.flash('info', 'Success!');
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
                          message: req.flash('message'),
                          error: req.flash('error'), 
                          req: req });
  });
  app.get('/naked-wordpress', function(req,res){
    res.redirect('http://naked-wordpress.bckmn.com');
  });
  app.get('/stark-lines', function(req,res){
    res.render('realtime', { title: 'Realtime Sparkline',
                          description: "",
                          message: req.flash('message'),
                          error: req.flash('error'), 
                          req: req });
  });
}
