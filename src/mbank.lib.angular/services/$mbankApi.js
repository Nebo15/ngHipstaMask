
Mbank.service('$mbankApi', [
	'$http',
	'$log',
function ($http, $log) {

    var baseUrl = 'http://0.0.0.0:1234/api.mbank.nebo15.me/v1/';
    var requests = {
        'wallet': {
            url: 'wallet',
            auth: false
        },
        'walletActivate': {
            url: 'wallet/activate',
            auth: false
        },
        'walletResendCode': {
            url: 'wallet/resend_code',
            auth: false
        }
    };

    var service = function () {};
    var credentials = '';
    service.prototype.setCredentials = function (username, password) {
        credentials = atob(username + ':' + password);
    };
    service.prototype.$$request = function (url, data, auth) {
        auth = auth || false;
        if (auth) $http.defaults.headers.common['Authorization'] = 'Basic ' + credentials;

        $log.debug("$$request", url, data, auth, arguments);
		return $http({
            method: 'post',
            url: baseUrl+url,
            data: data
        });
	};

    for (var req in requests) {
        if (!requests.hasOwnProperty(req)) continue;
        service.prototype[req] = (function (requestInfo) {
            var url = requestInfo.url,
                auth = requestInfo.auth;
            return function (data) {
                $log.debug(req, "::", data);
                return this.$$request.apply(this, [url, data, auth]);
            };
        })(requests[req]);
    }

    return new service();

}]);
