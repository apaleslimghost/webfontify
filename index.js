var globTransform = require('glob-transform');
var σ = require('highland');
var transform = require('./transform');

module.exports = globTransform('*.ttf', function(file, opts) {
	return σ.pipeline(
		transform(file, opts)
		σ.map(function(cssPath) {
			return 'module.exports = require("' + cssPath + '");'
		})
	);
});
