/*
 * Front End routes
 */
var moment = require('moment')
    , fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , api_key = process.env.STRIPE_SECRET_KEY,
    stripe = require('stripe')(api_key),
    api_public = process.env.STRIPE_PUBLIC_KEY;

module.exports = function (app) {
  app.get('/', function(req, res) {
    res.render('index', { title: 'Joshua Beckman', 
                          user: req.user, 
                          images: config.front.images, 
                          imageSrc: config.front.src, 
                          message: req.flash('message'), 
                          error: req.flash('error'), 
                          req: req,
                          thoughts: config.thoughts });
  });
  app.get('/pay', function(req, res) {
      res.render('pay', { title: 'Joshua Beckman accepts credit cards!',
                            description: "You can pay Joshua Beckman via secure credit card transaction on this super-simple form!",
                            publicKey: api_public,
                            amount: req.query.amount,
                            email: req.query.email,
                            text: req.query.message,
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
                          req: req });
  });
  app.get('/polarpageviews', function(req, res) {
    res.render('polarPageviews', { title: 'Polar Pageviews',
                          description: "View data from your Google Analytics properties by day, week & month from the previous 365 days.",
                          message: req.flash('message'),
                          error: req.flash('error'), 
                          req: req });
  });
}
