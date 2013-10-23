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
    slug: {type: String, required: true},
    link: {type: String},
    published: {type: Boolean, default: false, required: true},
    markdown: {type: String, required: true},
    image: {type: String},
    searchableTime: {type: String},
    searchableUrl: {type: String},
    keywordBin: {type: String}
});

Post.plugin(troop.timestamp);
Post.plugin(troop.keywords, {
  source: ['markdown', 'keywordBin', 'searchableUrl', 'searchableTime', 'title'],
  naturalize: true
})
Post.statics.createPost = function(data, io){
  var newPost = new this;
  newPost.markdown = data.markdown;
  newPost.title = data.title;
  newPost.slug = this.slugify(data.title);
  newPost.html = marked(data.markdown);
  newPost.link = data.link;
  newPost.published = data.published;
  newPost.keywordBin = data.keywordBin;
  newPost.searchableTime = moment(data.time).format('dddd MMMM Do YYYY h:mm:ss A');
  newPost.searchableUrl = data.searchableUrl;
  newPost.save(function(err,result){
    if(err){
      console.log(err);
      io.sockets.emit('error', {details: err});
      return null;
    }
    if(result){
      console.log(result);
      return result;
    }
  });
};
Post.statics.updatePost = function(data, io){
  this.findOne({_id: data._id}).lean().exec(function(err, post){
    post.markdown = data.markdown;
    post.title = data.title;
    post.slug = this.slugify(data.title);
    post.html = marked(data.markdown);
    post.link = data.link;
    post.published = data.published;
    post.keywordBin += data.keywordBin;
    post.searchableTime = moment(data.time).format('dddd MMMM Do YYYY h:mm:ss A');
    post.searchableUrl = data.searchableUrl;
    post.save(function(err,result){
      if(err){
        console.log(err);
        io.sockets.emit('error', {details: err});
        return null;
      }
      if(result){
        return result;
      }
    });
  })
};

Post.statics.markMyWords = function(string){
  return marked(string);
};

Post.statics.slugify = function(string){
  return string.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
};

Post.statics.getLatestPosts = function(callback){
  this.find().sort('modified').limit(15).find({}, callback);
};
Post.statics.getUnpublishedPosts = function(callback){
  this.find({published: false}).sort('modified').lean().exec(callback);
}

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
