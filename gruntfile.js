
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
          'public/javascripts/starkLines.min.js': ['public/javascripts/starkLines/*.js', 'public/javascripts/vendor/gapi.js']
        }
      },
      general: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
          mangle: {
            except: ['siteBeat', 'd3', 'gapi']
          }
        },
        files: {
          'public/javascripts/bckmn.min.js': ['public/javascripts/vendor/classie.js', 'public/javascripts/vendor/vh-buggyfill.js', 'public/javascripts/vendor/gatrack.js', 'public/javascripts/bckmn.js']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'public/javascripts/starkLines/*.js', 'public/javascripts/bckmn.js'],
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
    cssmin: {
      add_banner: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        files: {
          'public/stylesheets/bckmn.min.css': ['public/stylesheets/pure-min.css', 'public/stylesheets/default.css', 'public/stylesheets/style.css']
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'uglify']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('crush', ['uglify', 'cssmin']);

  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
};
