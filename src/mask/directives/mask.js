'use strict';

Mask.service('maskUtils', function () {
  function getPos(element) {
    if ('selectionStart' in element) {
      return element.selectionStart;
    } else if (document.selection) {
      element.focus();
      var sel = document.selection.createRange();
      var selLen = document.selection.createRange().text.length;
      sel.moveStart('character', -element.value.length);
      return sel.text.length - selLen;
    }
  }

  function setPos(element, caretPos) {
    if (element.createTextRange) {
      var range = element.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      element.focus();
      if (element.selectionStart !== undefined) {
        element.setSelectionRange(caretPos, caretPos);
      }
    }
  }
  return {
    carret: {
      get: getPos,
      set: setPos
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
          var mask, config, minLength, carretPos = 0;
          var disableRender = false;


          function updateMask (val) {
            mask = val;
            config = $mask.get(mask);
            textWrap.text(config.template);
            minLength = config.schema[0].pos;
            carretPos = minLength;
            ngModel.$render();
          }
          attrs.$observe('mask', updateMask);
          updateMask (attrs['mask']);

          function clearValue (val) {
            return val.replace(/\s/g, '').substr(0, config.schema.length);
          }


          var isCustomCarret = false, event;

          ngModel.$render = function () {
            carretPos = maskUtils.carret.get(inputEl[0]);
            console.log(carretPos, minLength);

            carretPos = carretPos < minLength ? minLength : carretPos;
            inputEl.val($mask.place(clearValue(ngModel.$viewValue), mask));
            maskUtils.carret.set(inputEl[0], carretPos);

          };
          ngModel.$parsers.push(function (val) {
            ngModel.$render();
            return clearValue(val);
          });

          inputEl.bind('keydown', function (e) {
            event = e;
            console.log(e.keyCode);
            // backspace, delete, left , right
            if ([8, 46, 37, 39].indexOf(e.keyCode) < 0 && ngModel.$modelValue.toString().length >= config.schema.length) e.preventDefault();
            else ngModel.$render();
          });
          ////
          ////  //if (e.keyCode == 8) isCustomCarret = (idx + 1) !== ngModel.$modelValue.toString().length;
          ////  //else {
          ////  //
          ////  //}
          ////
          ////  //switch (e.keyCode) {
          ////  //  case 8: //backspace
          ////  //    carretPos--;
          ////  //    break;
          ////  //  case 49: //delete. stay in position
          ////  //      break;
          ////  //  default:
          ////  //    carretPos++;
          ////  //    break;
          ////  //}
          ////  //carretPos = maskUtils.carret.get(inputEl[0]);
          ////
          ////  //disableRender = true;
          //  //e.preventDefault();
          //})
        }
      }
    }
  };
});
