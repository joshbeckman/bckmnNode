var Post = require('../models/post'),
    moment = require('moment'),
    marked = require('marked');

exports.createPost = function(data, io, callback){
  var newPost = new Post;
  newPost.markdown = data.markdown;
  newPost.title = data.title;
  newPost.slug = Post.slugify(data.title);
  newPost.html = marked(data.markdown);
  newPost.lede = marked(data.markdown.split('\n\n').slice(0,3).join('\n\n'));
  newPost.link = data.link;
  newPost.published = data.published;
  newPost.keywordBin = data.keywordBin;
  newPost.searchableTime = moment(data.time).format('dddd MMMM Do YYYY h:mm:ss A');
  newPost.searchableUrl = data.searchableUrl;
  newPost.save(function(err,result){
    callback(err, result);
  });
};
exports.updatePost = function(data, io, callback){
  Post.findOne({_id: data._id}).exec(function(err, post){
    post.markdown = data.markdown;
    post.title = data.title;
    post.slug = Post.slugify(data.title);
    post.html = marked(data.markdown);
    post.lede = marked(data.markdown.split('\n\n').slice(0,3).join('\n\n'));
    post.link = data.link;
    post.published = data.published;
    post.keywordBin += data.keywordBin;
    post.searchableTime = moment(data.time).format('dddd MMMM Do YYYY h:mm:ss A');
    post.searchableUrl = data.searchableUrl;
    post.save(function(err,result){
      callback(err, result);
    });
  })
};