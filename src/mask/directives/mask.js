"use strict";

var isIphone = (window.orientation !== undefined),
  isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
String.prototype.splice = function( idx, rem, s ) {
  return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};
angular.element.prototype.insertBefore = function (el) {
  el[0].parentNode.insertBefore(this[0], el[0].nextSibling);
};



Array.prototype.getUnique = function(){
  var u = {}, a = [];
  for(var i = 0, l = this.length; i < l; ++i){
    if(u.hasOwnProperty(this[i])) {
      continue;
    }
    a.push(this[i]);
    u[this[i]] = 1;
  }
  return a;
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
          overallWrap.insertBefore (inputEl);
          inputWrap.append(inputEl);

          // updating mask info
          var __mask, __config, __modelValue, __viewValue,

            // config
            __spacer = ' ', __spacerRegexp = /\s/g,
            __autocomplete = true; // autocomplete static values to model

          function clearValue (val) {
            val = val || '';
            return val.replace(__spacerRegexp, '');
          }
          function updateMask (val) {
            console.log('mask update mask', val);
            __mask = val;
            __config = $mask.get (__mask);
            textWrap.text(__config.template);
            init ();
          }
          // scope.$watch('mask', updateMask)
          attrs.$observe ('mask', updateMask);
          attrs.$observe ('maskAutocomplete', function (val) {
            __autocomplete = val == true;
          });

        

          function init () {
            console.log('mask init');
            __modelValue = ngModel.$modelValue || null;
          
            if (__modelValue) {
              __viewValue = $mask.placeToTheNext(__modelValue, __mask, __spacer, __autocomplete);
              renderValue();
            }
            console.log('mask init', __modelValue, __viewValue,  __mask);
            
          }
          ngModel.$parsers.push(function (val) {
            if (isPastEvent) {
                val = clearValue(val);
                __viewValue = $mask.placeToTheNext(val, __mask, __spacer, __autocomplete);
                val = __viewValue;
                renderValue();
            } else if (isCutEvent) {
              console.log('cutEvent');
              val = clearValue(val);
              var pos = $maskCaret.range(inputEl);
              var p = searchNextPos(pos.begin);
              __viewValue = $mask.placeToTheNext(val, __mask, __spacer, __autocomplete);
              val = __viewValue;
              renderValue();
              $maskCaret.set(inputEl[0], pos.begin);
            }

            val = $mask.clear(val, __mask);
            console.log('parsers', val);
            return val;
          });
          ngModel.$formatters.push(function (val) {
            console.log('mask formatters', val);
            return $mask.placeToTheNext(val, __mask, __spacer, __autocomplete);
          });
          // поиск следующего места для вставки
          function searchNextPos (pos) {
            var i = 0;
            for (var l = __config.schema.length; i < l && pos >= __config.schema[i].pos || __config.schema[i] && __config.schema[i].static; i++) {}
            return __config.schema[i] ? __config.schema[i].pos : null;
          }
          // поиск предыдущего места для вставки
          function searchPrevPos (pos) {
            var i = __config.schema.length-1;
            for (; i > 0 && pos <= __config.schema[i].pos || __config.schema[i] && __config.schema[i].static; i--) {
            }
            return __config.schema[i] ? __config.schema[i].pos : __config.schema[0].pos;
          }

          function deleteStatics (begin, end) {
            __viewValue = __viewValue.split('');
            for (var i = begin; i < end; i++) {
              if ($mask.isStaticCharByIdx(i, __mask)) {
                __viewValue[i] = '';
              }
            }
            __viewValue = __viewValue.join('');
          }
          function clearSelection (begin, end, isDeleteStatics) {

            // delete static symbols from model before delete after end symbol
            __viewValue = ngModel.$viewValue;
            deleteStatics (end, __viewValue.length);
            __viewValue = __viewValue.slice(0,begin) + __viewValue.slice(end);

            // расставить значения по новым позициям
            __modelValue = clearValue(__viewValue);
            __viewValue = $mask.placeToTheNext(__modelValue, __mask, __spacer, __autocomplete);
          }
          function renderValue () {
            console.log('render value');
            ngModel.$setViewValue(__viewValue);
            ngModel.$render();
          }
          function isCut (e) {
            return (e.metaKey || e.ctrlKey) && (e.which === 88);
          }
          function isCopy (e) {
            return (e.metaKey || e.ctrlKey) && (e.which === 67);
          }
          function isPast (e) {
            return (e.metaKey || e.ctrlKey) && (e.which === 86); 
          }
          var isPastEvent = false,
              isCutEvent = false;
          inputEl.bind('keydown', function (e) {
            var k = e.which;

            console.log('keydown');
            isPastEvent = isPast (e);
            isCutEvent = isCut (e);

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
        
          
            console.log('keypress')
            __viewValue = __viewValue || '';
            // игнорируем все нажатия с ctrl, alt и мета ключи
            if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
              //e.preventDefault();
              return;
            } else if (k) { // это символы для вставки
              console.log(k, pos.begin, pos.end);
              if (pos.end - pos.begin !== 0) { // была выделена область
                // удаляем выделение
                // clearEnd = ngModel.$modelValue.length - 1;
                clearSelection(pos.begin, pos.end);
                // сдвинуть значение с правой стороны на удаленный range
                //shiftLeft (pos.begin, pos.end-1);
              } else if (ngModel.$modelValue && ngModel.$modelValue.length == __config.schema.length) { // not selected and full filled mask
                // not insert
                e.preventDefault();
                return;
              }
              // вставляем в начало выделения новый символ
              var c = String.fromCharCode(k); // получение символа по коду
              // поиск места для вставки
              var p = searchNextPos(pos.begin - 1);
              deleteStatics(p, __viewValue.length);
              // тестируем символ по паттерну
              var clearPosition = $mask.clearPosition(p, __mask);
              var notStatic = $mask.notStatic(__config.schema);
              if (!notStatic[clearPosition] || !notStatic[clearPosition].pattern || !notStatic[clearPosition].pattern.test(c)) {
                e.preventDefault();
                return;
              }
              if (p !== null) { //null усли следующего места для вставке не существует

                // вставлем значение в нужно место со сдвигом вправо
                __viewValue  = __viewValue.splice(p,0, c); // insert new value
                // очищаем от символа-запонителя и расставляем все по новым местам
                __viewValue = $mask.placeToTheNext(clearValue(__viewValue), __mask, __spacer, __autocomplete);
                // отображаем новое значение
                renderValue();
                // перемещаем каретку на новое место
                var next = searchNextPos(p);
                if (next) $maskCaret.set(inputEl[0], next);
                e.preventDefault();
              }
              return;
            }
          });
        }
      }
    }
  };
});
