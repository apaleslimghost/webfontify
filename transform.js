var σ = require('highland');
var ttf2eot = require('ttf2eot');
var fs = require('fs');

function writeThrough(w) {
	return function(s) {
		var o = σ('finish', w).otherwise([undefined]);
		s.pipe(w);
		return o;
	}
}

module.exports = function(file, opts) {
	return σ.pipeline(
		σ.map(function(ttf) {
			return new Uint8Array(ttf);
		}),
		σ.map(function(buf) {
			return new Buffer(ttf2eot(buf).buffer);
		}),
		writeThrough(fs.createWriteStream('foo.eot'))
	);
};
