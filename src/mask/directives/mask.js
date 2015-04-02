'use strict';

Mask.directive ('mask', function ($mask, $maskCaret) {
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
          overallWrap.insertBefore (inputEl);
          inputWrap.append(inputEl);

          var mask, config, minLength;

          function updateMask (val) {
            mask = val;
            config = $mask.get (mask);
            textWrap.text (config.template);
            minLength = config.schema[0].pos;
            ngModel.$render ();
          }

          attrs.$observe ('mask', updateMask);
          updateMask (attrs['mask']);

          function clearValue (val) {
            return (val || '').replace (/[\s\*]/g, '').substr (0, config.schema.length);
          }

          var event = {},
            clearedValue,
            nextCarretPosition;

          var spacer = ' ';

          var carretPosition = null;

          function onCarretUpdate (val) {
            // verify if cursor can be placed where
            var idx = val - 1, // symbol idx
              nextIdx;
            if (val < config.schema[0].pos) return;

            var back = [8, 37].indexOf (event.keyCode) > -1;
            if (back) {//backspace. carret should be placed at right side from next deleting symbol.
              nextIdx = $mask.nextPosition (idx, mask, false) + 1;
              nextIdx = nextIdx || minLength;
            } else { //looking for position of the next character and place carret at left side
              nextIdx = $mask.nextPosition ($mask.nextPosition (idx, mask, true), mask);
              nextIdx = nextIdx || mask.length; // on finish symbol stay at the end
            }
            nextCarretPosition = nextIdx;
          }

          function updateCarretPosition () {
            carretPosition = $maskCaret.get (inputEl[0]);
            onCarretUpdate (carretPosition);
          }

          updateCarretPosition ();

          ngModel.$render = function () {

            var value = ngModel.$viewValue || ngModel.$modelValue;
            if (event.keyCode == 8 && ngModel.$modelValue == clearValue (value)) //deleted space char
            {
              value = value.split ('');
              var toDelete = $mask.nextPosition (carretPosition - 1, mask, false);
              if (toDelete) value[toDelete] = spacer;
              value = value.join ('');
            }

            var fnPlace = event.keyCode !== 8 ? $mask.placeToTheNext : $mask.place;
            var cleared = clearValue (value);
            var placed = fnPlace (cleared, mask, spacer);

            inputEl.val (placed);
            $maskCaret.set (inputEl[0], nextCarretPosition);
          };
          ngModel.$parsers.push (function (val) {
            ngModel.$render ();
            return clearValue (val);
          });

          inputEl.bind ('keydown', function (e) {
            event = e;
            // preventing filling on fulled template
            var currentPost = $maskCaret.get (inputEl[0]);
            if ([8, 9, 13, 16, 17, 18, 46, 37, 39].indexOf (e.keyCode) < 0 && (ngModel.$modelValue || '').toString ().length >= config.schema.length) {
              e.preventDefault ();
            } else if (currentPost <= minLength && [8, 37].indexOf (e.keyCode) > -1) { //min mask length
              e.preventDefault ()
            } else updateCarretPosition ();
          });

          function isAccessory (idx) {
            var i, l;
            for (i = 0, l = config.schema.length; i < l; i++) {
              if (config.schema[i].pos < idx) continue;
              if (config.schema[i].pos == idx) {
                i = true;
                break;
              }
            }
            return i !== true;
          }

          inputEl.bind ('mouseup', function (e) {
            event = e;

            var currentPost = $maskCaret.get (inputEl[0]);
            if (!ngModel.$viewValue && !ngModel.$modelValue || !!ngModel.$modelValue && ngModel.$modelValue.toString ().length == 0) {
              $maskCaret.set (inputEl[0], minLength);
            }
            else if (currentPost <= minLength) $maskCaret.set (inputEl[0], minLength);
            else if (isAccessory (currentPost)) {
              var next = $mask.nextPosition (currentPost, mask, true) || mask.length;
              $maskCaret.set (inputEl[0], next);
            }
            else updateCarretPosition ();
          });
        }
      }
    }
  };
});
