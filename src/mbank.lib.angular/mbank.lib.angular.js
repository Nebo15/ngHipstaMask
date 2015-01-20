// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Gulp

// Config
angular.module('mbank.lib.angular.config', [])
	.value('mbank.lib.angular.config', {
	    debug: true
	});

// Modules
var Mbank = angular.module('mbank.lib.angular',
    [
        'mbank.lib.angular.config'
    ]);

Mbank.config(['$httpProvider','$mbankApiProvider', function($httpProvider, $mbankApiProvider) {
//    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    console.log('$mbankApiProvider', $mbankApiProvider);
    $mbankApiProvider.set('url', 'http://0.0.0.0:1234/api.mbank.nebo15.me/v1/');
}]);
