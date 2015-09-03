var browserify = require('browserify');
var webfontify = require('./');
var σ = require('highland');
var fs = require('fs');

function exists(file) {
	return σ(function(push, next) {
		fs.exists(file, function(x) {
			push(null, x);
			push(null, σ.nil);
		});
	});
}

describe('Webfontify', function() {
	describe('transform', function() {
		it('should not garble fonts', function(done) {
			var b = browserify(σ(['require("./test/lato.ttf")']));
			b.transform(webfontify);
			b.transform('cssify');

			σ(b.bundle())
				.collect()
				.map(Buffer.concat)
				.stopOnError(done)
				.done(function() {
					σ([
						'css/lato.css',
						'fonts/lato.eot',
						'fonts/lato.woff',
						'fonts/lato.svg'
					])
						.flatMap(exists)
						.toArray(function(xs) {
							xs.forEach(console.assert);
							done();
						})
				});
		});

		afterEach(function(done) {
			σ([
				'css/lato.css',
				'fonts/lato.eot',
				'fonts/lato.woff',
				'fonts/lato.svg'
			])
				.flatMap(σ.wrapCallback(fs.unlink))
				.stopOnError(done)
				.done(done);
		});
	});
});
