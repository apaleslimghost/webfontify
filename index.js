var filterTransform = require('filter-transform');
var σ = require('highland');
var transform = require('./transform');
var resolve = σ.wrapCallback(require('browser-resolve'));
var path = require('path');

module.exports = filterTransform(function(f) {
	return f.match(/\.ttf$/);
}, function(file, opts) {
	return σ.pipeline(
		transform(file, opts),
		σ.flatMap(function(cssPath) {
			return resolve(path.resolve(cssPath), {filename: file}).map(function(path) {
				return 'module.exports = require("' + path + '");'
			});
		})
	);
});
