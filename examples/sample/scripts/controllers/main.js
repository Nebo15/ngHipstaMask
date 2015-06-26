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
    $scope.options = {};
    $scope.inn = '7809018702';
    $scope.testTemplate = '\\+### (##) ###-####';
    $scope.card = '1234123412341234';
    $scope.caret = 0;
    $scope.car = $maskCaret;
    // $scope.testTemplateValue = '+380932685446';
    $scope.$watch('testTemplate', function (val) {
      $scope.testTemplateParsed = $mask.parse(val);
    });
  });
