'use strict';

Mask.service('maskUtils', function () {
  function getCaretPosition (ctrl) {
    var CaretPos = 0;	// IE Support
    if (document.selection) {
      ctrl.focus ();
      var Sel = document.selection.createRange ();
      Sel.moveStart ('character', -ctrl.value.length);
      CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl.selectionStart || ctrl.selectionStart == '0')
      CaretPos = ctrl.selectionStart;
    return (CaretPos);
  }
  function setCaretPosition(ctrl, pos){
    if(ctrl.setSelectionRange)
    {
      ctrl.focus();
      ctrl.setSelectionRange(pos,pos);
    }
    else if (ctrl.createTextRange) {
      var range = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

  return {
    carret: {
      get: getCaretPosition,
      set: setCaretPosition
    }
  }
});

Mask.directive('mask', function ($mask, maskUtils) {
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

          //overallWrap.bind('click', function () {
          //  inputEl.focus(); //to focus input by clicking on text mask
          //});
          // masking
          var mask, config, minLength;
          var disableRender = false,
              carretPosition = 0;

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
            if (!disableRender) {
              inputEl.val($mask.place(clearValue(ngModel.$viewValue), mask));
            }
          };
          ngModel.$parsers.push(function (val) {
            ngModel.$render();
            return clearValue(val);
          });

          inputEl.bind('keydown', function (e) {
            console.log($mask.clearPosition(maskUtils.carret.get(inputEl[0])));
            //disableRender = true;
            e.preventDefault();
          })
        }
      }
    }
  };
});
