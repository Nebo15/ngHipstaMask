'use strict';

Mask.directive('mask', function ($mask) {
  return {
    restrict: 'A',
    require: '^ngModel',
    compile: function (inputElement, attrs, ngModel) {
      return {
        pre: function (scope, el, attrs) {},
        post: function (scope, inputEl, attrs, ngModel) {
          // compiling element
          var overallWrap = angular.element('<div />').addClass('mask-wrap'),
            textWrap = angular.element('<div />').addClass('mask-text').appendTo(overallWrap),
            inputWrap = angular.element('<div />').addClass('mask-input').appendTo(overallWrap);

          overallWrap.insertBefore(inputEl);
          inputEl.appendTo(inputWrap);

          overallWrap.bind('click', function () {
            inputEl.focus(); //to focus input by clicking on text mask
          });
          // masking
          var mask, config, minLength;
          function updateMask (val) {
            mask = val;
            config = $mask.get(mask);
            textWrap.text(config.template);
            minLength = config.schema[0].pos;
            ngModel.$render();
          }
          attrs.$observe('mask', updateMask);
          updateMask (attrs['mask']);

          function clearValue (val) {
            return val.replace(/\s/g, '').substr(0, config.schema.length);
          }
          ngModel.$render = function () {
            inputEl.val($mask.place(clearValue(ngModel.$viewValue), mask));
          };
          ngModel.$parsers.push(function (val) {
            ngModel.$render();
            return clearValue(val);
          });
        }
      }
    }
  };
});
