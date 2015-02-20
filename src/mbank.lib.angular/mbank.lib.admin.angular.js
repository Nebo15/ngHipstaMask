// Config
angular.module('mbank.admin.lib.angular.config', [])
    .value('mbank.admin.lib.angular.config', {
        debug: true
    });
// Modules
var Mbank = angular.module('mbank.admin.lib.angular',
    [
        'mbank.admin.lib.angular.config'
    ]);

Mbank.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
}]);
