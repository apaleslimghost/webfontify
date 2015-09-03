<h1 align="center">
	<img src="https://raw.githubusercontent.com/quarterto/webfontify/master/logo.png" width="400" alt="Webfontify"><br>

	<a href="http://badge.fury.io/js/webfontify"><img src="https://badge.fury.io/js/webfontify.svg" alt="npm version" height="18"></a>
	<a href="https://travis-ci.org/quarterto/webfontify"><img src="https://travis-ci.org/quarterto/webfontify.svg?branch=develop" alt="Build Status"></a>
</h1>

Easily convert TTF to webfonts and output CSS

Usage
-----

### As a command

Install webfontify globally (or locally, and run from `node_modules/.bin`, then it's `webfontify path/to/font.ttf`. By default, it outputs fonts to `fonts/$fontname.{eot,woff,svg}` and CSS to `css/$fontname.css`.

### As a transform

Install locally alongside Browserify and [something](https://www.npmjs.com/package/cssify) to [bundle](https://www.npmjs.com/package/xcss) your CSS and run `browserify -t webfontify -t $css_importer index.js`, and any `require` statments pointing to `.ttf`s will convert the TTF and replace it with a `require` statement for generated CSS.

### As a module

```js
var webfontify = require('webfontify/transform');

fs.createReadStream('path/to/font.ttf).pipe(
	webfontify('path/to/font.ttf', options)
);
```

Options
-------

Just `cssDir`/`--css-dir` and `fontDir`/`--font-dir` for now. They do what you expect.

Licence
------

MIT
