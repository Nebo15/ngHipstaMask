'use strict';

Mask.directive ('mask', function ($mask, $maskCaret, $log) {

  return {
    restrict: 'A',
    require: '^ngModel',
    compile: function (el, attrs) {

      return {
        post: function (scope, inputEl, attrs, ngModel) {
          // compiling element
          var overallWrap = angular.element ('<div></div>').addClass ('mask-wrap'),
            textWrap = angular.element ('<div></div>').addClass ('mask-text'),
            inputWrap = angular.element ('<div></div>').addClass ('mask-input');

          overallWrap.append (textWrap).append (inputWrap);
          overallWrap.insertBefore (el);
          inputWrap.append(inputEl);

          // updating mask info
          var __mask, __config, __spacer = ' ', __stopRender = false, __isBack = false;
          function updateMask (val) {
            __mask = val;
            __config = $mask.get (__mask);
            textWrap.text (__config.template);
            ngModel.$render ();
          }
          attrs.$observe ('mask', updateMask);
          updateMask (attrs['mask']);

          // Model behaviour
          function clearValue (val) {
            return (val || '').replace (/[\s\*]/g, '').substr (0, __config.schema.length);
          }
          function renderValue() {

            var value = ngModel.$viewValue || ngModel.$modelValue;
            var cleared = clearValue (value);
            var placed = (__isBack  ? $mask.place : $mask.placeToTheNext)(cleared, __mask, __spacer, !__isBack );
            inputEl.val (placed);
          }

          ngModel.$render = function () {
            if (__stopRender) {
              __stopRender = false;
              return;
            }
            renderValue();
          };
          ngModel.$parsers.push (function (val) {
            ngModel.$render ();
            return clearValue (val);
          });
          // store information about last used key
          inputEl.bind('keydown', function (e) {
            __isBack = [8,37].indexOf(e.keyCode) > -1;
            if (!inputEl.val()) renderValue(); // autocomplete at start
            if (ngModel.$viewValue.length < __config.template.length) {
              console.log('keydown render', ngModel);
              ngModel.$render();
              __stopRender = true;
            }
          });

          //
          /**
          * Caret
          */
          //var fnRenderOld = ngModel.$render,
          //    __caret;
          //
          //var __prevValue, __newValue;
          //inputEl.bind('keydown', function (e) {
          //  __caret = $maskCaret.get(inputEl[0]); // position of input symbol
          //});
          //inputEl.bind('keyup', function (e) {
          //  __prevValue = __newValue;
          //  __newValue = ngModel.$viewValue;
          //  if (__prevValue === __newValue) {
          //    console.log('the same after move');
          //    if ($mask.isAccessoryCharByIdx(__caret, __mask)) {
          //      console.log('last symbol after accessory', __caret, ngModel.$viewValue.length);
          //      recalcCaret();
          //    }
          //  }
          //});
          //function calculateNextCaretPosition (caret) {
          //  console.log ('calculateNextCaretPosition::', caret);
          //  var pos = caret;
          //  if ($mask.isAccessoryCharByIdx(caret, __mask)) { // next symbol is accessory
          //    console.log('caret is before accessory symbol', caret);
          //    pos = $mask.dirtyPosition($mask.clearPosition(caret, __mask, !__isBack), __mask) ;
          //    if (__isBack) {
          //      pos ++;
          //      console.log('should move to the nearest left char: right side');
          //    } else {
          //
          //      console.log('should move to the nearest right char: left side');
          //    }
          //  }
          //  return pos;
          //}
          //
          //function recalcCaret () {
          //  $maskCaret.set(inputEl[0], calculateNextCaretPosition (__caret));
          //}
          //
          //inputEl.bind('keyup', function (e) {
          //  //__caret = $maskCaret.get(inputEl[0]); // position of input symbol

          //});

          //function renderCaret () {
          //  $log.info('render caret', ngModel);
          //  __caret = $maskCaret.get(inputEl[0]); // position of input symbol
          //
          //  fnRenderOld();
          //  var value = ngModel.$viewValue || ngModel.$modelValue;
          //  var cleared = clearValue (value);
          //  //var placed = $mask.placeFull(cleared, __mask, __spacer);
          //  //inputEl.val (placed);
          //
          //  // cursor is at the end of view value
          //  if (__caret < value.length) {
          //    console.log('recalc', __caret, value.length);
          //    recalcCaret();
          //  }
          //}
          //
          //ngModel.$render = renderCaret;
        }
      }
    }
  };
});
