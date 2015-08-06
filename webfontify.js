#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var σ = require('highland');
var fs = require('fs');

var transform = require('./transform');

σ(argv._).flatMap(function(f) {
	return σ(fs.createReadStream(f))
		.through(transform(f, argv))
		.map(f);
}).each(console.log.bind(console, 'Processed'));
