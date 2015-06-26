'use strict';

Mask.directive('phoneMask', function ($maskPhone) {
  return {
    restrict: 'A',
    require: '^ngModel',
    scope: {
      phoneOptions: '='
    },
    link: function (scope, el, attrs, ngModel) {
      function clearVal () {
        return (ngModel.$modelValue || ngModel.$viewValue || '');
      }
      var clr;
      function updateOptions () {
        clr = clearVal ();
        scope.phoneOptions = $maskPhone.search (clr);
      }
      updateOptions();
      ngModel.$formatters.push (function (val) {
        updateOptions();
      });
      ngModel.$viewChangeListeners.unshift(function (val) {
        updateOptions();
      });
    }
  }
});
