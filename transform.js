var σ = require('highland');
var ttf2eot = require('ttf2eot');
var fs = require('fs');
var throughWritable = require('@quarterto/through-writable');
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

function flatTap(fn) {
	return function(s) {
		return s.flatMap(function(x) {
			return fn(x).map(x);
		});
	}
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
			return fs.createWriteStream(path.join(options.fontDir, base + '.eot'))
		})
	);
};
