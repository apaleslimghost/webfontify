var σ = require('highland');
var fs = require('fs');
var throughWritable = require('@quarterto/through-writable');
var flatTap = require('@quarterto/flat-tap');
var path = require('path');
var defaults = require('defaults');
var mkdirp = σ.wrapCallback(require('mkdirp'));

var defaultOptions = {
	fontDir: 'fonts'
};

function crayBuffer(buf) {
	if(buf.buffer) {
		return new Buffer(buf.buffer);
	}
	return buf;
}

function fontPath(base, dir, ext) {
	return path.join(dir, base + '.' + ext);
}

function fontPipeline(ext, convert, options) {
	return σ.pipeline(
		σ.map(convert),
		σ.map(crayBuffer),
		throughWritable(function() {
			return fs.createWriteStream(fontPath(options.base, options.fontDir, ext))
		})
	);
}

function branch(streams) {
	return function(input) {
		return σ(streams.map(function(thru) {
			return input.fork().through(thru);
		})).sequence().collect();
	};
}

module.exports = function(file, opts) {
	var options = defaults(opts, defaultOptions);
	options.base = path.basename(file, '.ttf');

	return σ.pipeline(
		flatTap(function() {
			return mkdirp(options.fontDir, {});
		}),
		σ.collect,
		σ.map(Buffer.concat),
		branch([
			fontPipeline('eot', require('ttf2eot'), options),
			fontPipeline('svg', require('ttf2svg'), options)
		])
	);
};
