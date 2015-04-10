"use strict";

var isIphone = (window.orientation !== undefined),
  isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
String.prototype.splice = function( idx, rem, s ) {
  return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};


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
          var __mask, __config, __spacer = ' ',
            __stopRender = false,
            __isBack = false,
            __modelValue, __viewValue;

          function updateMask (val) {
            __mask = val;
            __config = $mask.get (__mask);
            textWrap.text(__config.template);
            init ();
          }
          attrs.$observe ('mask', updateMask);

          function init () {
            __modelValue = ngModel.$modelValue || null;
            __viewValue = $mask.placeToTheNext(__modelValue, __mask);
            renderValue();
          }
          ngModel.$parsers.push(function (val) {
            return $mask.clear(val, __mask);
          });
          ngModel.$formatters.push(function (val) {
            __viewValue = $mask.placeToTheNext(val, __mask);
            return __viewValue;
          });
          // поиск следующего места для вставки
          function searchNextPos (pos) {
            var len = __config.schema.length;
            var i = 0;
            for (var l = __config.schema.length; i < l && pos >= __config.schema[i].pos; i++) {}
            return __config.schema[i] ? __config.schema[i].pos : null;
          }
          // поиск предыдущего места для вставки
          function searchPrevPos (pos) {
            var len = __config.schema.length;
            var i = __config.schema.length-1;
            for (; i > 0 && pos <= __config.schema[i].pos; i--) {}
            return __config.schema[i] ? __config.schema[i].pos : __config.schema[0].pos;
          }

          function clearSelection (begin, end) {
            __viewValue = ngModel.$viewValue.slice(0,begin) + ngModel.$viewValue.slice(end);
          }
          function renderValue () {
            ngModel.$setViewValue(__viewValue);
            ngModel.$render();
          }
          inputEl.bind('keydown', function (e) {
            var k = e.which;
            console.log('keydown', k);
            if (k == 8 || k == 46 || (isIphone && k == 127)) { // удаление
              var pos = $maskCaret.range(inputEl),
                begin = pos.begin,
                end = pos.end;
              if (end-begin === 0) {
                // поиск range для удаления из буфера
                begin = k!=46 ? searchPrevPos(begin) : (end=searchNextPos(begin-1));
                end = k==46 ? searchNextPos(end) : end
              }
              clearSelection(begin, end);
              // расставить значения по новым позициям
              __viewValue = $mask.placeToTheNext(__viewValue.replace(/\s/g,''), __mask);

              renderValue();


              // set position to the new position
              var p = searchPrevPos(begin);
              $maskCaret.set(inputEl[0], begin);

              e.preventDefault();
              return true;
            } else if (k == 27) {//escape
              // двигаем каретку в конец и дефокус элемента
              $maskCaret.set(inputEl[0], __mask.length);
              inputEl.trigger('blur');
              e.preventDefault();
              return false;
            }

            //e.preventDefault();
          });
          inputEl.bind('keypress', function (e) {
            var k = e.which,
                pos = $maskCaret.range(inputEl);
            // игнорируем все нажатия с ctrl, alt и мета ключи
            if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
              console.log('prevent reacting');
              e.preventDefault();
              return;
            } else if (k) { // это символы для вставки

              if (pos.end - pos.begin !== 0) { // была выделена область
                // удаляем выделение
                clearSelection(pos.begin, pos.end);
                // сдвинуть значение с правой стороны на удаленный range
                //shiftLeft (pos.begin, pos.end-1);
              } else if (ngModel.$modelValue.length == __config.schema.length) { // not selected and full filled mask
                // not insert
                e.preventDefault();
                return;
              }
              // вставляем в начало выделения новый символ
              var c = String.fromCharCode(k); // получение символа по коду
              // поиск места для вставки
              var p = searchNextPos(pos.begin - 1);
              // тестируем символ по паттерну
              var clearPosition = $mask.clearPosition(p, __mask);
              if (!__config.schema[clearPosition] || !__config.schema[clearPosition].pattern || !__config.schema[clearPosition].pattern.test(c)) {
                e.preventDefault();
                return;
              }
              if (p !== null) { //null усли следующего места для вставке не существует

                // вставлем значение в нужно место со сдвигом вправо
                __viewValue  = __viewValue.splice(p,0, c); // insert new value
                // очищаем от символа-запонителя и расставляем все по новым местам
                __viewValue = $mask.placeToTheNext(__viewValue.replace(/\s/g,''), __mask);

                // отображаем новое значение
                renderValue();
                // перемещаем каретку на новое место
                var next = searchNextPos(p);
                if (next) $maskCaret.set(inputEl[0], next);
              }

              e.preventDefault();
              return;
            }
          });


        }
      }
    }
  };
});
