'use strict';

/**
 * @ngdoc function
 * @name projectsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the projectsApp
 */
angular.module('projectsApp')
  .controller('MainCtrl', function ($scope, $mask, $maskCaret) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.testTemplate = '###-##-## ###';
    $scope.caret = 0;
    $scope.car = $maskCaret;
    $scope.testTemplateValue = '123123';
    $scope.$watch('testTemplate', function (val) {
      $scope.testTemplateParsed = $mask.parse(val);
    });
  });
