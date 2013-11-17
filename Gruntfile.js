/*
 * grunt-injector
 * https://github.com/klei-dev/grunt-injector
 *
 * Copyright (c) 2013 Joakim Bengtson
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    injector: {
      options: {
        template: 'test/fixtures/index.html'
      },
      defaults: {
        files: {
          'tmp/defaults.html': ['test/fixtures/*.js', 'test/fixtures/*.css', 'test/fixtures/component.html', '!test/fixtures/*.min.*']
        }
      },
      ignorePath: {
        options: {
          ignorePath: 'test/fixtures'
        },
        files: {
          'tmp/ignorePath.html': ['test/fixtures/*.js', 'test/fixtures/*.css', 'test/fixtures/component.html', '!test/fixtures/*.min.*'],
        }
      },
      expandFiles: {
        options: {
          ignorePath: 'test/fixtures',
          destFile: 'tmp/expanded.html'
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: ['*.js', '*.css', 'component.html', '!*.min.*']
        }]
      },
      minFiles: {
        options: {
          ignorePath: 'test/fixtures',
          destFile: 'tmp/min.html',
          min: true
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures',
          src: ['*.js', '*.css', 'component.html', '!*.min.*']
        }]
      },
      bowerFiles: {
        src: 'test/fixtures/bower.json',
        dest: 'tmp/bower.html'
      },
      bowerWithIgnore: {
        options: {
          ignorePath: 'bower_components'
        },
        src: 'test/fixtures/bower.json',
        dest: 'tmp/bowerWithIgnore.html'
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'injector', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
