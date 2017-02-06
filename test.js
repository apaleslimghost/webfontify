/* eslint-env node, mocha */

const browserify = require('browserify');
const webfontify = require('./');
const transform = require('./transform');
const σ = require('highland');
const fs = require('fs');

function exists(file) {
	return σ(push => {
		fs.exists(file, x => {
			push(null, x);
			push(null, σ.nil);
		});
	});
}

describe('Webfontify', () => {
	describe('transform', () => {
		it('should not garble fonts', done => {
			const b = browserify(σ(['require("./test/lato.ttf")']));
			b.transform(webfontify);
			b.transform('cssify');

			σ(b.bundle())
				.collect()
				.map(Buffer.concat)
				.stopOnError(done)
				.done(() => {
					σ([
						'css/lato.css',
						'fonts/lato.eot',
						'fonts/lato.woff',
						'fonts/lato.svg',
					])
						.flatMap(exists)
						.toArray(xs => {
							xs.forEach(console.assert);
							done();
						});
				});
		});

		afterEach(done => {
			σ([
				'css/lato.css',
				'fonts/lato.eot',
				'fonts/lato.woff',
				'fonts/lato.svg',
			])
				.flatMap(σ.wrapCallback(fs.unlink))
				.stopOnError(done)
				.done(done);
		});
	});

	describe('options', () => {
		it('shouldn\'t create directories if they\'re falsy', done => {
			σ([]).pipe(
				transform('./test/lato.ttf', {fontDir: false, cssDir: false})
			)
				.stopOnError(done)
				.done(() => {
					σ(['css', 'fonts']).flatMap(exists).toArray(xs => {
						xs.forEach(console.assert);
						done();
					});
				});
		});

		it('should create streams to write to', done => {
			done();
		});
	});
});
