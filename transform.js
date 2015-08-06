var σ = require('highland');
var ttf2eot = require('ttf2eot');
var fs = require('fs');
var throughWritable = require('@quarterto/through-writable');

module.exports = function(file, opts) {
	return σ.pipeline(
		σ.map(function(ttf) {
			return new Uint8Array(ttf);
		}),
		σ.map(function(buf) {
			return new Buffer(ttf2eot(buf).buffer);
		}),
		throughWritable(fs.createWriteStream('foo.eot'))
	);
};
