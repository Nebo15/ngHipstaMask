'use strict';

Mask.directive('phoneMask', function ($maskPhone) {
  return {
    restrict: 'A',
    require: '^ngModel',
    scope: {
      phoneOptions: '='
    },
    link: function (scope, el, attrs, ngModel) {
      scope.phoneOptions = $maskPhone.search('');
      ngModel.$viewChangeListeners.push(function (val) {
        scope.phoneOptions = $maskPhone.search(ngModel.$modelValue);
      });
    }
  }
});
