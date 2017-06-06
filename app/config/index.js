'use strict';
const config = require('./config.json');

var init = function() {
	if (process.env.NODE_ENV === 'production') {

	} else {
		return config;
	}
}

module.exports = init();