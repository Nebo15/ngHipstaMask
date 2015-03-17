// Config
angular.module('mask.config', [])
	.value('mask.config', {
	    debug: true
	});

// Modules
var Mask = angular.module('ngMask', ['mask.config']);
