# grunt-injector

> Inject references to files into other files (think scripts and stylesheets into an html file)

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-injector --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-injector');
```

## The "injector" task

### Overview
In your project's Gruntfile, add a section named `injector` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  injector: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.template
Type: `String`
Defaulting to `dest` property of file group

The source template where you have your injection tags.
If not provided, the given `dest` file must exist and will be used as source template as well, and therefor will be modified on injection.

#### options.ignorePath
Type: `String`
Default value: `NULL`

A path that should be removed from each injected file path.

#### options.destFile
Type: `String`
Default value: `NULL`

Used to override the `dest` property of file groups, which is necessary when using [dynamically built files objects](http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically).

#### options.min
Type: `Boolean`
Default value: `false`

If set to `true` each injected file will be switched to its minified counterpart (i.e. *.min.<ext> files), if it exists that is otherwise the original file is used as usual.

#### options.starttag
Type: `String`
Default value: `<!-- injector:{{ext}} -->`

Set the start tag that the injector is looking for. `{{ext}}` is replaced with file extension name, e.g. "css", "js" or "html".

#### options.endtag
Type: `String`
Default value: `<!-- endinjector -->`

Set the end tag that the injector is looking for. `{{ext}}` is replaced with file extension name, e.g. "css", "js" or "html".

#### options.transform
Type: `Function`
Params: `filepath`
Default value: a function that returns:

* For css files: `<link rel="stylesheet" href="<filename>.css">`
* For js files: `<script src="<filename>.js"></script>`
* For html files: `<link rel="import" href="<filename>.html">`

Used to generate the content to inject for each file.

### Usage Examples

#### Injecting into html file with default options

index.html:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
  <!-- injector:css -->
  <!-- endinjector -->
</head>
<body>

  <!-- injector:js -->
  <!-- endinjector -->
</body>
</html>
```
Gruntfile.js:

```js
grunt.initConfig({
  injector: {
    options: {},
    files: {
      'index.html': ['**/*.js', '**/*.css'],
    },
  },
})
```

**After injection**

index.html:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
  <!-- injector:css -->
  <link rel="stylesheet" href="file1.css">
  <link rel="stylesheet" href="file2.css">
  <!-- endinjector -->
</head>
<body>

  <!-- injector:js -->
  <script src="file1.js"></script>
  <script src="file2.js"></script>
  <!-- endinjector -->
</body>
</html>
```

#### Bower dependency injection

The `grunt-injector` can be used to inject your installed Bower Components as well.
To do this the module [wiredep](https://github.com/stephenplusplus/wiredep) is used, and here's how the configuration can look like in that case:

Gruntfile.js:

```js
grunt.initConfig({
  injector: {
    options: {},
    files: {
      'index.html': ['bower.json'],
    },
  },
})
```

index.html:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
  <!-- injector:bower:css -->
  <!-- endinjector -->
</head>
<body>

  <!-- injector:bower:js -->
  <!-- endinjector -->
</body>
</html>
```

#### Other configurations
For more advanced task configurations se the `Gruntfile.js` in this repository and have a look at the tests in `test/injector_test.js`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

**0.2.0** - 2013-11-20 - Don't write to destination file if it hasn't been changed by the injector (useful to not trigger any unnecessary watch tasks if applicable)

**0.1.2** - 2013-11-17 - Making it possible to only provide destFile and not template

**0.1.1** - 2013-11-17 - ignorePath now only removes from start of path

**0.1.0** - 2013-11-17 - First release
