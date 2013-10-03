/*
 * API Routes
 */
var moment = require('moment'),
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync('./config.json')),
    error404 = {"status":{"code":404,"message":"Nothing found by that identifier. Life is hard.","html_url":"http://bckmn.com"}},
    error400 = {"status":{"code":400,"message":"Josh doesn't understand what you mean. Speak slowly.","html_url":"http://bckmn.com"}},
    updated204 = {"status":{"code":204,"message":"Success! Life is good.","html_url":"http://bckmn.com"}};

module.exports = function (app, io) {
  app.get('/api', function(req, res) {
    var person = {},
        identifiers = {},
        externals = config.externals,
        fullResponse = {};
    identifiers.icon = config.icon_path;
    identifiers.image = config.image_path;
    identifiers.home_url = "http://bckmn.com";
    identifiers.blog_url = "http://bckmn.com/blog";
    person.first_name = config.first_name;
    person.last_name = config.last_name;
    person.birthdate = config.birthdate;
    person.birthplace = config.birthplace;
    person.age = {
      "years":moment().diff(config.birthdate, 'years'),
      "months":moment().diff(config.birthdate, 'months'),
      "weeks":moment().diff(config.birthdate, 'weeks'),
      "days": moment().diff(config.birthdate, 'days'),
      "hours": moment().diff(config.birthdate, 'hours'),
      "minutes": moment().diff(config.birthdate, 'minutes'),
      "seconds": moment().diff(config.birthdate, 'seconds'),
      "milliseconds": moment().diff(config.birthdate, 'milliseconds')
    };
    person.location = config.location;
    person.languages = config.languages;
    identifiers.externals = externals;
    fullResponse.person = person;
    fullResponse.identifiers = identifiers;
    res.jsonp(fullResponse);
  });
}
