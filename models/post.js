/**
  * Post: A string of words, with metadata
  *
  */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    troop = require('mongoose-troop'),
    moment = require('moment'),
    marked = require('marked');

var Post = new Schema({
    html: {type: String, required: true},
    title: {type: String, required: true},
    lede: {type: String, required: true},
    slug: {type: String, required: true},
    link: {type: String},
    published: {type: Boolean, default: false, required: true},
    markdown: {type: String, required: true},
    image: {type: String},
    colors: [{ hex: String, red: Number, green: Number, blue: Number }],
    searchableTime: {type: String},
    searchableUrl: {type: String},
    keywordBin: {type: String}
});

Post.plugin(troop.timestamp);
Post.plugin(troop.keywords, {
  source: ['markdown', 'keywordBin', 'searchableUrl', 'searchableTime', 'title'],
  naturalize: true
})

Post.statics.markMyWords = function(string){
  return marked(string);
};

Post.statics.slugify = function(string){
  return string.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
};

Post.statics.getLatestPosts = function(count, offset, callback){
  this.find({published: true}).sort('-modified').skip(offset).limit(count).exec(callback);
};
Post.statics.getUnpublishedPosts = function(callback){
  this.find({published: false}).sort('-modified').lean().exec(callback);
};
Post.statics.getPublishedPosts = function(callback){
  this.find({published: true}).sort('-modified').lean().exec(callback);
};
Post.statics.getOneExcept = function(sluggy, callback){
  this.find({published: true}).where('slug').ne(sluggy).sort('-modified').lean().exec(function(err, posts){
    var post = posts[Math.floor(Math.random() * posts.length)];
    callback(err, post);
  });
};

Post.statics.searchQuery = function(data, io){
  this.find({ keywords: { $all: this.extractKeywords(data.query) } }, '-__v', {sort:{modified: -1}}).lean().exec(function(err, posts) {
    if(err){
      console.log(err);
      io.sockets.emit('error', {details: err});
    }
    if(posts){
      io.sockets.emit('searchResult', { results: posts, searchText: data.query });
    };
  });
};

module.exports = mongoose.model('Post', Post);
