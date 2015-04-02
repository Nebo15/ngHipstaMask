'use strict';

/**
 * @ngdoc function
 * @name projectsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the projectsApp
 */
angular.module('projectsApp')
  .controller('MainCtrl', function ($scope, $mask) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.testTemplate = '\\+###\\(##\\)###-##-##';
    $scope.testTemplateValue = '+380(93)2685446';
    $scope.$watch('testTemplate', function (val) {
      $scope.testTemplateParsed = $mask.parse(val);
    });
  });
