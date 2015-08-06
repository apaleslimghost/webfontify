var σ = require('highland');

module.exports = function(file, opts) {
	return σ().flatMap(function(ttf) {
		console.log(new Uint8Array(ttf));
	})
};
