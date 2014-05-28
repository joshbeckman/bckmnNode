module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      general: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
          mangle: {
            except: ['siteBeat', 'd3', 'gapi']
          }
        },
        files: {
          'public/javascripts/the.min.js': ['public/javascripts/vendor/lodash.js', 'public/javascripts/lodash-ext.js', 'public/javascripts/vendor/classie.js', 'public/javascripts/vendor/gatrack.js', 'public/javascripts/script.js']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'public/javascripts/script.js', 'public/javascripts/lodash-ext.js'],
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
          'public/stylesheets/the.min.css': ['public/stylesheets/pure-min.css', 'public/stylesheets/prism.css', 'public/stylesheets/icons.css', 'public/stylesheets/style.css']
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
