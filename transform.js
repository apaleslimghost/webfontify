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

module.exports = function(file, opts) {
	var base = path.basename(file, '.ttf');
	var options = defaults(opts, defaultOptions);

	return σ.pipeline(
		σ.map(function(ttf) {
			return new Uint8Array(ttf);
		}),
		σ.map(function(buf) {
			return new Buffer(ttf2eot(buf).buffer);
		}),
		σ.flatMap(function(s) {
			return mkdirp(options.fontDir, {}).map(s);
		}),
		throughWritable(function() {
			return fs.createWriteStream(path.join(options.fontDir, base + '.eot'))
		})
	);
};
