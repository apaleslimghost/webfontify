#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const σ = require('highland');
const fs = require('fs');

const transform = require('./transform');

σ(argv._)
	.flatMap(
		f => σ(fs.createReadStream(f))
			.through(transform(f, argv))
			.map(f)
	)
	.each(console.log.bind(console, 'Processed'));
