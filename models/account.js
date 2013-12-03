/**
  * Account: A person, owning data
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    troop = require('mongoose-troop'),
    passportLocalMongoose = require('passport-local-mongoose'),
    Mailgun = require('mailgun').Mailgun,
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync('./config.json')),
    MailComposer = require("mailcomposer").MailComposer;
var mg = new Mailgun(config.mailgun.key),
    mailcomposer = new MailComposer();

var Account = new Schema({
  username: {type: String, default: ''},
  email: {type: String, required: true},
  fullAccess: { type: Boolean, default: false },
  key: { type: String, default: ( Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) ) },
});

Account.plugin(passportLocalMongoose, {usernameField: 'email'});
Account.plugin(troop.timestamp);

Account.statics.generateRandomToken = function () {
  var user = this,
      chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      token = new Date().getTime() + '_';
  for ( var x = 0; x < 16; x++ ) {
    var i = Math.floor( Math.random() * 62 );
    token += chars.charAt( i );
  }
  return token;
};
Account.methods.welcomeEmail = function(){
  var account = this,
      admin = 'jsh@bckmn.com';
  var plainBody = 'Hello '+this.username+'! Welcome to Atomist.co. You can start adding thoughts and links by logging in, and you can always update your account settings at http://atomist.co/account. Welcome to remembering more! - Your friends at Atomist.co',
      htmlBody = '<h3>Hello '+this.username+'!</h3><p>Welcome to <a href="http://atomist.co">Atomist.co</a>.</p><p>You can start adding thoughts and links by logging in, and you can always update your account settings at <a href="http://atomist.co/account">atomist.co/account</a>.</p><p>Welcome to remembering more!</p><p>- Your friends at <a href="http://atomist.co"><img src="http://atomist.co/images/favicon.png" width="20" height="20" alt="Atomist" style="vertical-align:middle;"/> Atomist.co</a></p>';
  mailcomposer.setMessageOption({
    from: 'welcome@atomist.co',
    to: this.email,
    subject: 'Welcome to Atomist, '+this.username,
    body: plainBody,
    html: htmlBody
  });
  mailcomposer.buildMessage(function(err, messageSource){
    mg.sendRaw('postmaster@atomist.mailgun.org',
      [this.email,admin],
      messageSource,
      'atomist.mailgun.org',
      function(err) {
        if (err) {console.log('Oh noes: ' + err);}
        else     {console.log('Successful welcome email ');}
      }
    );
  });
}

module.exports = mongoose.model('Account', Account);
