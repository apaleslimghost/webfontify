var σ = require('highland');
var ttf2eot = require('ttf2eot');
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

module.exports = function(file, opts) {
	var options = defaults(opts, defaultOptions);
	options.base = path.basename(file, '.ttf');

	return σ.pipeline(
		flatTap(function() {
			return mkdirp(options.fontDir, {});
		}),
		fontPipeline('eot', ttf2eot, options)
	);
};
