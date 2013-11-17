/*
 * grunt-injector
 * https://github.com/klei-dev/grunt-injector
 *
 * Copyright (c) 2013 Joakim Bengtson
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path'),
    fs = require('fs');

module.exports = function(grunt) {

  grunt.registerMultiTask('injector', 'Inject references to files into other files (think scripts and stylesheets into an html file)', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      min: false,
      template: null,
      starttag: '<!-- injector:{{ext}} -->',
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
      filepath = makeMinifiedIfNeeded(options.min, filepath);
      if (basedir) {
        filepath = removeBasePath(basedir, filepath);
      }
      filepath = addRootSlash(filepath);
      tag.sources.push(options.transform(filepath));
    }

    function getTag (tagkey) {
      var key = options.starttag.replace('{{ext}}', tagkey);
      if (!tags[key]) {
        tags[key] = {
          key: tagkey,
          starttag: key,
          endtag: options.endtag.replace('{{ext}}', tagkey),
          sources: []
        };
      }
      return tags[key];
    }


    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      var template = options.template || f.dest,
          destination = options.destFile || f.dest;

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
          // Load bower dependencies with `wiredep`:
          if (!grunt.file.exists(destination)) {
            grunt.file.write(destination, templateContent);
          }
          require('wiredep')({
            directory: path.join(path.dirname(filepath), 'bower_components'),
            bowerJson: grunt.file.readJSON(filepath),
            ignorePath: options.ignorePath || path.dirname(filepath),
            htmlFile: destination,
            cssPattern: transformerToPattern('css', options.transform),
            jsPattern: transformerToPattern('js', options.transform)
          });
          grunt.log.writeln('Injecting ' + 'bower'.green + ' dependencies');
          templateContent = grunt.file.read(destination);
        } else {
          addFile(options.ignorePath, filepath);
        }
      });

      Object.keys(tags).forEach(function (key) {
        var tag = tags[key];
        var re = new RegExp('([\t ]*)(' + escapeForRegExp(tag.starttag) + ')(\\n|\\r|.)*?(' + escapeForRegExp(tag.endtag) + ')', 'gi');
        templateContent = templateContent.replace(re, function (match, indent, starttag, content, endtag) {
          grunt.log.writeln('Injecting ' + tag.key.green + ' files ' + ('(' + tag.sources.length + ' files)').grey);
          return indent + starttag  + [''].concat(tag.sources).concat(['']).join('\n' + indent) + endtag;
        });
      });

      // Write the destination file.
      grunt.file.write(destination, templateContent);

    });
  });

};

function makeMinifiedIfNeeded (doMinify, filepath) {
  if (!doMinify) {
    return filepath;
  }
  var ext = path.extname(filepath);
  var minFile = filepath.slice(0, -ext.length) + '.min' + ext;
  if (fs.existsSync(minFile)) {
    return minFile;
  }
  return filepath;
}

function transformerToPattern (ext, transformer) {
  if (!transformer) {
    return null;
  }
  return transformer('{{filePath}}.' + ext).replace(new RegExp('({{filePath}}).' + ext, 'g'), '{{filePath}}');
}

function toArray (arr) {
  if (!Array.isArray(arr)) {
    return [arr];
  }
  return arr;
}

function addRootSlash (filepath) {
  return filepath.replace(/^\/*([^\/])/, '/$1');
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

function escapeForRegExp (str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

