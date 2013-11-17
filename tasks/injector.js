/*
 * grunt-injector
 * https://github.com/klei-dev/grunt-injector
 *
 * Copyright (c) 2013 Joakim Bengtson
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('injector', 'Inject references to files into other files (think scripts and stylesheets into an html file)', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      min: false,
      template: null,
      starttag: '<!-- injector:{{key}} -->',
      endtag: '<!-- endinjector -->',
      transform: function (filepath) {
        var ext = path.extname(filepath).slice(1);
        if (ext === 'css') {
          return '<link rel="stylesheet" href="' + filepath + '">';
        } else if (ext === 'js') {
          return '<script src="' + filepath + '"></script>';
        } else if (ext === 'html') {
          return '<link rel="import" href="' + filepath + '">';
        }
      }
    });

    if (!options.template) {
      grunt.log.warn('Missing option `template`, using `dest` as template instead');
    }

    var tags = {};

    function addFile (basedir, filepath, tagkeyPrefix) {
      var ext = path.extname(filepath).slice(1),
          tagkey = (tagkeyPrefix || '') + ext,
          tag = getTag(tagkey);
      filepath = filepath.replace(/\\/g, '/');
      filepath = makeMinifiedIfNeeded(filepath);
      if (basedir) {
        filepath = removeBasePath(basedir, filepath);
      }
      filepath = addRootSlash(filepath);
      tag.sources.push(options.transform(filepath));
    }

    function getTag (tagkey) {
      if (!tags[tagkey]) {
        tags[tagkey] = {
          starttag: options.starttag.replace('{{key}}', tagkey),
          endtag: options.endtag.replace('{{key}}', tagkey),
          sources: []
        };
      }
      return tags[tagkey];
    }

    function makeMinifiedIfNeeded (filepath) {
      if (!options.min) {
        return filepath;
      }
      var ext = path.extname(filepath);
      var minFile = filepath.slice(0, -ext.length) + '.min' + ext;
      if (grunt.file.exists(minFile)) {
        return minFile;
      }
      return filepath;
    }

    function removeBasePath (basedir, filepath) {
      return toArray(basedir).reduce(function (path, remove) {
        if (remove) {
          return path.replace(remove, '');
        } else {
          return path;
        }
      }, filepath);
    }

    function addRootSlash (filepath) {
      return filepath.replace(/^\/*([^\/])/, '/$1');
    }

    function toArray (arr) {
      if (!Array.isArray(arr)) {
        return [arr];
      }
      return arr;
    }

    function getFilesFromBower (bowerFile) {
      var bower = grunt.file.readJSON(bowerFile),
          componentsDir = path.join(path.dirname(bowerFile), 'bower_components'),
          files = [];
      Object.keys(bower.dependencies || {}).forEach(function (component) {
        var componentBowerFile = path.join(componentsDir, component, 'bower.json');
        var componentBower = grunt.file.readJSON(componentBowerFile);
        if (componentBower.main) {
          toArray(componentBower.main).forEach(function (filepath) {
            filepath = path.join(componentsDir, component, filepath);
            if (!grunt.file.exists(filepath)) {
              grunt.log.warn('Source file "' + filepath + '" in bower component "' + component + '" does not exist!');
              return;
            }
            files.push(filepath);
          });
        }
      });
      return files;
    }

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      var template = options.template || f.dest;
      if (!grunt.file.exists(template)) {
        grunt.log.error('Could not find template "' + template + '". Injection not possible');
        return false;
      }

      var templateContent = grunt.file.read(template);

      f.src.forEach(function(filepath) {
        // Warn on and remove invalid source files.
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return;
        }

        if (path.basename(filepath) === 'bower.json') {
          console.log('yep bower');
          getFilesFromBower(filepath).forEach(function (file) {
            console.log('bower files', file);
            addFile([path.dirname(filepath), options.ignorePath], file, 'bower:');
          });
        } else {
          addFile(options.ignorePath, filepath);
        }
      });

      Object.keys(tags).forEach(function (key) {
        var tag = tags[key];
        var re = new RegExp('([\t ]*)(' + tag.starttag + ')(\\n|\\r|.)*?(' + tag.endtag + ')', 'gi');
        templateContent = templateContent.replace(re, function (match, indent, starttag, content, endtag) {
          return indent + starttag  + [''].concat(tag.sources).concat(['']).join('\n' + indent) + endtag;
        });
      });

      // Write the destination file.
      grunt.file.write(options.destFile || f.dest, templateContent);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
