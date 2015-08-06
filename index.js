var globTransform = require('glob-transform');
var σ = require('highland');

/*
 * 1. Convert ttf to different formats, output to fonts dir
 * 2. Generate css file, output to css dir
 * 3. Output require statement for css file
 */

module.exports = globTransform('*.ttf', function(file, opts) {
	return transform(file, opts).map(function() {
		return 'module.exports = require("' + cssFilename(file, opts) + '");'
	});
});
