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

module.exports = function(file, opts) {
	var base = path.basename(file, '.ttf');
	var options = defaults(opts, defaultOptions);

	return σ.pipeline(
		σ.map(ttf2eot),
		σ.map(crayBuffer),
		σ.flatMap(function(s) {
			return mkdirp(options.fontDir, {}).map(s);
		}),
		throughWritable(function() {
			return fs.createWriteStream(path.join(options.fontDir, base + '.eot'))
		})
	);
};
