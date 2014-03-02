/**
  * Thought: A string of words, minutae
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    troop = require('mongoose-troop'),
    moment = require('moment');

var Thought = new Schema({
    text: {type: String, required: true},
    color: String,
});

Thought.plugin(troop.timestamp);
Thought.plugin(troop.keywords, {
  source: ['text'],
  naturalize: true
})

Thought.statics.createThought = function(data, callback){
  var newThought = new this;
  newThought.text = data.text;
  newThought.color = data.color;
  newThought.save(function(err,result){
    callback(err, result);
  });
};
Thought.statics.getLatest = function(count, callback){
  this.find().sort('-modified').limit(count).exec(callback);
};
Thought.statics.getOneExcept = function(text, callback){
  this.find().where('text').ne(text).sort('-modified').lean().exec(function(err, thoughts){
    var thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    callback(err, thought);
  });
};

Thought.statics.searchQuery = function(data, io){
  this.find({ keywords: { $all: this.extractKeywords(data.query) } }, '-__v', {sort:{modified: -1}}).lean().exec(function(err, thoughts) {
    if(err){
      console.log(err);
      io.sockets.emit('error', {details: err});
    }
    if(thoughts){
      io.sockets.emit('searchResult', { results: thoughts, searchText: data.query });
    };
  });
};

module.exports = mongoose.model('Thought', Thought);
