module.exports = function(grunt) {

  var Post = require('./models/post'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync('./config.json')),
    getJSON = require('./lib/getJSON').getJSON;
  // Define what/which mongo to yell at
  var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || config.mongo.url;

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      starkLines: {
        options: {
          banner: '/*! Stark Lines v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
          mangle: {
            except: ['siteBeat', 'd3', 'gapi']
          }
        },
        files: {
          'public/javascripts/starkLines.min.js': ['public/javascripts/starkLines/*.js', 'public/javascripts/gapi.js']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'public/javascripts/starkLines/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('crush', ['uglify']);

  grunt.registerTask('default', ['jshint', 'uglify']);
};