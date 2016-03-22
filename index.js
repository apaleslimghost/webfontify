const filterTransform = require('filter-transform');
const σ = require('highland');
const transform = require('./transform');
const resolve = σ.wrapCallback(require('browser-resolve'));
const path = require('path');

module.exports = filterTransform(
	f => f.match(/\.ttf$/),
	(file, opts) => σ.pipeline(
		transform(file, opts),
		σ.flatMap(cssPath => resolve(path.resolve(cssPath), {filename: file}).map(
				p => `module.exports = require("${p}");`
			)
		)
	)
);
