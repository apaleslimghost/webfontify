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

module.exports = function(file, opts) {
	var base = path.basename(file, '.ttf');
	var options = defaults(opts, defaultOptions);

	return σ.pipeline(
		σ.map(ttf2eot),
		σ.map(crayBuffer),
		flatTap(function() {
			return mkdirp(options.fontDir, {});
		}),
		throughWritable(function() {
			return fs.createWriteStream(fontPath(base, options.fontDir, 'eot'))
		})
	);
};
