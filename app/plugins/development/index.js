'use strict';

var fs = require('fs');

function svg(path, alt, fileType) {
	if (! path) {
		throw new Error('Missing path for svg')
	}

	var fileExt = 'png';
	if (fileType) {
		fileExt = fileType;
	}

	var fallback = path.replace('.svg', '.' + fileExt);
	return '<img class="svg" src="' + path + '" onerror="this.removeAttribute(\'onerror\'); this.src=\'' + fallback + '\'" />';
}

function onPreResponse(request, reply) {
	// Filter out any non-view rendering requests
	if (! request.response.source ||
			! request.response.source.hasOwnProperty('context')) {
		return reply();
	}

	if (! request.response.source.context) {
		request.response.source.context = {};
	}

	// Attach any helper functions to local variables for jade
	request.response.source.context.svg = svg;

	return reply();
}

exports.register = function (plugin, options, next) {
	plugin.ext('onPreResponse', onPreResponse);

	return next();
};
