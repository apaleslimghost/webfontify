const σ = require('highland');
const fs = require('fs');
const throughWritable = require('@quarterto/through-writable');
const flatTap = require('@quarterto/flat-tap');
const branch = require('@quarterto/highland-branch');
const path = require('path');
const defaults = require('defaults');
const mkdirp = σ.wrapCallback(require('mkdirp'));
const ttfName = require('ttfinfo/tableName');

const defaultOptions = {
	fontDir: 'fonts',
	cssDir: 'css',
};

function crayBuffer(buf) {
	if(buf.buffer) {
		return new Buffer(buf.buffer);
	}
	return buf;
}

function getPath(base, dir, ext) {
	return path.join(dir, `${base}.${ext}`);
}

function fontPipeline(ext, convert, options) {
	return σ.pipeline(
		σ.map(convert),
		σ.map(crayBuffer),
		throughWritable(() => fs.createWriteStream(getPath(options.base, options.fontDir, ext)))
	);
}

const bufferCollect = σ.compose(σ.map(Buffer.concat), σ.collect);

const testThings = things => (string) => {
	for(const thing in things) {
		if(thing !== 'else' && new RegExp(thing, 'i').test(string)) {
			return things[thing];
		}
	}
	return things.else;
};

const inferStyle = testThings({
	italic: 'italic',

	else: 'normal',
});

const inferWeight = testThings({
	regular: 'normal',
	book: 'normal',
	bold: 'bold',
	black: 700,
	heavy: 900,
	light: 300,
	thin: 100,
	hairline: 100,

	else: 'normal',
});

const cssTemplate = o => `@font-face {
	font-family: "${o.fontFamily}";
	font-weight: "${o.fontStyle}";
	font-style: "${o.fontStyle}";
	src: url("${getPath(o.options.base, o.options.fontDir, 'eot')}");
	src: url("${getPath(o.options.base, o.options.fontDir, 'eot')}?#iefix") format("embedded-opentype"),
	url("${getPath(o.options.base, o.options.fontDir, 'woff')}") format("woff"),
	url("${getPath(o.options.base, o.options.fontDir, 'svg')}#${o.id}") format("svg");
}`;

module.exports = (file, opts) => {
	const options = defaults(opts, defaultOptions);
	options.base = path.basename(file, '.ttf');

	return σ.pipeline(
		flatTap(() => options.fontDir ? mkdirp(options.fontDir, {}) : σ([])),
		flatTap(() => options.cssDir ? mkdirp(options.cssDir, {}) : σ([])),
		bufferCollect,
		branch([
			fontPipeline('eot', require('ttf2eot'), options),
			fontPipeline('svg', require('ttf2svg'), options),
			fontPipeline('woff', require('ttf2woff'), options),
			σ.pipeline(
				σ.map(ttfName),
				σ.map(nameTable => ({
					fontFamily: nameTable['1'],
					fontWeight: inferWeight(nameTable['2']),
					fontStyle: inferStyle(nameTable['2']),
					id: nameTable['6'],
					options,
				})),
				σ.map(cssTemplate),
				throughWritable(() => fs.createWriteStream(getPath(options.base, options.cssDir, 'css')))
			),
		]),
		σ.map(() => options.cssDir && getPath(options.base, options.cssDir, 'css'))
	);
};
