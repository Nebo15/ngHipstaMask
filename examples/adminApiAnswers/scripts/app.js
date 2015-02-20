'use strict';


var App = angular.module('app', ['mbank.admin.lib.angular','ui.router','ui.mask']);
App.config(function ($stateProvider, $urlRouterProvider, $mbankAdminApiProvider) {
    $mbankAdminApiProvider.set('url', 'http://api.mbank.dev/adm2/');
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
        .state('services', {
            url: '/services',
            parent: 'main',
            abstract: true,
            views: {
                'content@layout': {
                    templateUrl: 'templates/services/services.html',
                    controller: 'ServicesController'
                }
            }
        })
        .state('services.get', {
            url: '/',
            views: {
                '': {
                    templateUrl: 'templates/services/get.html'
                }
            }
        })
        .state('services.create', {
            url: '/'
        });
    $urlRouterProvider.otherwise('/services/');
});
App.run(function ($log, $mbankAdminApi) {
    $log.debug("example app run", $mbankAdminApi, $mbankAdminApi.wallet);
});

App.controller('MenuController', [
    '$scope',
    '$log',
function ($scope, $log) {

}]);

App.controller('ServicesController', [
    '$scope',
    '$mbankAdminApi',
    '$log',
    '$state',

function ($scope, $mbankAdminApi, $log, $state) {
    $log.debug('Services controller run');
    $mbankAdminApi.setCredentials('samorai', 'iAWD872e');
    $scope.response = {};
    $scope.get = function () {
        $mbankAdminApi.services().then(function (resp) {
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