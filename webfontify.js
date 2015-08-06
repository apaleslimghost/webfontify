#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var σ = require('highland');
var fs = require('fs');

var transform = require('./transform');

σ(argv._).flatMap(function(f) {
	return fs.createReadStream(f).pipe(transform(f, argv)).collect().map(f);
}).each(function(f) {
	console.log('Processed', f);
});
