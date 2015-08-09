var σ = require('highland');
var fs = require('fs');
var throughWritable = require('@quarterto/through-writable');
var flatTap = require('@quarterto/flat-tap');
var branch = require('@quarterto/highland-branch');
var path = require('path');
var defaults = require('defaults');
var mkdirp = σ.wrapCallback(require('mkdirp'));
var ttfName = require('ttfinfo/tableName');

var defaultOptions = {
	fontDir: 'fonts',
	cssDir: 'css'
};

function crayBuffer(buf) {
	if(buf.buffer) {
		return new Buffer(buf.buffer);
	}
	return buf;
}

function getPath(base, dir, ext) {
	return path.join(dir, base + '.' + ext);
}

function fontPipeline(ext, convert, options) {
	return σ.pipeline(
		σ.map(convert),
		σ.map(crayBuffer),
		throughWritable(function() {
			return fs.createWriteStream(getPath(options.base, options.fontDir, ext))
		})
	);
}

var bufferCollect = σ.compose(σ.map(Buffer.concat), σ.collect);

function testThings(things) {
	return function(string) {
		for(var thing in things) {
			if(thing !== 'else' && new RegExp(thing, 'i').test(string)) {
				return things[thing];
			}
		}
		return things.else;
	}
}

var inferStyle = testThings({
	'italic': 'italic',

	else: 'normal'
});

var inferWeight = testThings({
	'regular': 'normal',
	'book': 'normal',
	'bold': 'bold',
	'black': 700,
	'heavy': 900,
	'light': 300,
	'thin': 100,
	'hairline': 100,

	else: 'normal'
});

function cssTemplate(o) {
	return [
		'@font-face {',
		'font-family: "' + o.fontFamily + '";',
		'font-weight: "' + o.fontStyle + '";',
		'font-style: "' + o.fontStyle + '";',
		'src: url("' + getPath(o.options.base, o.options.fontDir, 'eot') + '");',
		'src: url("' + getPath(o.options.base, o.options.fontDir, 'eot') + '?#iefix") format("embedded-opentype"),',
		'url("' + getPath(o.options.base, o.options.fontDir, 'woff') + '") format("woff"),',
		'url("' + getPath(o.options.base, o.options.fontDir, 'svg') + '#' + o.id + '") format("svg");',
		'}'
	].join('\n');
}

module.exports = function(file, opts) {
	var options = defaults(opts, defaultOptions);
	options.base = path.basename(file, '.ttf');

	return σ.pipeline(
		flatTap(function() {
			return mkdirp(options.fontDir, {});
		}),
		flatTap(function() {
			return mkdirp(options.cssDir, {});
		}),
		bufferCollect,
		branch([
			fontPipeline('eot',  require('ttf2eot'),  options),
			fontPipeline('svg',  require('ttf2svg'),  options),
			fontPipeline('woff', require('ttf2woff'), options),
			σ.pipeline(
				σ.map(ttfName),
				σ.map(function(nameTable) {
					return {
						fontFamily: nameTable['1'],
						fontWeight: inferWeight(nameTable['2']),
						fontStyle:  inferStyle(nameTable['2']),
						options: options,
						id: nameTable['6']
					}
				}),
				σ.map(cssTemplate),
				throughWritable(function() {
					return fs.createWriteStream(getPath(options.base, options.cssDir, 'css'))
				})
			)
		])
		σ.map(getPath(options.base, options.cssDir, 'css'))
	);
};
