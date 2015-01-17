'use strict';


var App = angular.module('app', ['mbank.lib.angular','ui.router','ui.mask']);
App.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('layout', {
            abstract: true,
            templateUrl: 'templates/layout/layout.html'
        })
        .state('main', {
            abstract: true,
            parent: 'layout',
            views: {
                'sidebar': {
                    templateUrl: 'templates/layout/side-menu.html',
                    controller: 'MenuController'
                }
            }
        })
        .state('signIn', {
            url: '/signIn',
            parent: 'main',
            abstract: true,
            views: {
                'content@layout': {
                    templateUrl: 'templates/sign-in.html',
                    controller: 'SignInController'
                }
            }
        })
        .state('signIn.create', {
            url: '/',
            views: {
                '': {
                    templateUrl: 'templates/wallet-create.html'
                }
            }
        })
        .state('signIn.activate', {
            url: '/activate',
            views: {
                '': {
                    templateUrl: 'templates/wallet-activate.html'
                }
            }
        })
        .state('signIn.success', {
            url: '/success',
            views: {
                '': {
                    templateUrl: 'templates/wallet-sucess.html'
                }
            }
        });
    $urlRouterProvider.otherwise('/signIn/');
});
App.run(function ($log, $mbankApi) {
    $log.debug("example app run", $mbankApi, $mbankApi.wallet);
});

App.controller('MenuController', [
    '$scope',
    '$log',
function ($scope, $log) {

}]);

App.controller('SignInController', [
    '$scope',
    '$mbankApi',
    '$log',
    '$state',

function ($scope, $mbankApi, $log, $state) {
    $log.debug('signIn controller run');
    $scope.cred = {
        phn: 380632022522,
        pwd: 1234567890
    };
    $scope.response = {};
    $scope.createWallet = function (cred, valid) {
        if (!valid) return alert("No valid input");
        $mbankApi.wallet({
            phone: '+'+cred.phn,
            password: ''+cred.pwd
        }).then(function (resp) {
            $log.debug("catched success response", resp);
            // show activation code
            $state.go('^.activate');
            $scope.response = resp.data;
        }).catch(function (err) {
            $log.warn("catched ERROR", err);
        });
    };

    $scope.activateWallet = function (cred, valid) {
        if (!valid) return alert("No valid input");
        $mbankApi.walletActivate({
            phone: '+'+cred.phn,
            code: ''+cred.code
        }).then(function (resp) {
            $log.debug("catched success response", resp);
            $scope.response = resp.data;

        }).catch(function (err) {
            $log.warn("catched ERROR", err);
        });
    };
    $scope.resendCode = function () {
        $mbankApi.walletResendCode({
            phone: '+'+$scope.cred.phn
        }).then(function (resp) {
            $log.debug("catched success response", resp);
            $scope.response = resp.data;
        }).catch(function (err) {
            $log.warn("catched ERROR", err);
        });
    };
}]);
App.directive('nbMenu', function () {
    return {
        restrict: 'E',
        link: function (scope, el, attrs, ctrl) {
            el.addClass('list-group');
        }
    }
});
App.directive('nbItem', function ($state) {
    return {
        restrict: 'E',
        link: function (scope, el, attrs, ctrl) {
            el.addClass('list-group-item');
            if (attrs.uiSref && typeof $state.includes(attrs.uiSref) !== 'undefined') {
                scope.$watch (function () {
                    return $state.includes(attrs.uiSref);
                }, function (active) {
                    active ? el.addClass('active') : el.removeClass('active');
                })
            }
        }
    }
});