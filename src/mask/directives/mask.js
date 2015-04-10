"use strict"; // jshint ;_;

var isIphone = (window.orientation !== undefined),
  isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;

/* INPUTMASK PUBLIC CLASS DEFINITION
* ================================= */

var Inputmask = function (element, options) {
  if (isAndroid) return;// No support because caret positioning doesn't work on Android

  var defaults = {
    mask: "",
    placeholder: "_",
    definitions: {
      '9': "[0-9]",
      'a': "[A-Za-z]",
      '?': "[A-Za-z0-9]",
      '*': "."
    }
  };

  this.$element = angular.element(element);
  this.options = angular.extend({}, defaults, options);
  this.mask = String(options.mask);

  this.init();
  this.listen();

  this.checkVal(); //Perform initial check for existing values
};

Inputmask.prototype = {

  init: function () {
    var defs = this.options.definitions;
    var len = this.mask.length;

    this.tests = [];
    this.partialPosition = this.mask.length;
    this.firstNonMaskPos = null;

    angular.forEach(this.mask.split(""), function (c, i) {
      if (c == '?') {
        len--;
        this.partialPosition = i
      } else if (defs[c]) {
        console.log('found', c, ' in defs');
        this.tests.push(new RegExp(defs[c]));
        if (this.firstNonMaskPos === null)
          this.firstNonMaskPos = this.tests.length - 1
      } else {
        this.tests.push(null)
      }
    }, this);

    this.buffer = this.mask.split("").map((function (c, i) {
      if (c != '?') return defs[c] ? this.options.placeholder : c
    }).bind(this));
    this.focusText = this.$element.val();
    //this.$element.data("rawMaskFn", (function () {
    //  return this.buffer.map((function (c, i) {
    //    return this.tests[i] && c != this.options.placeholder ? c : null
    //  }).bind(this)).join('');
    //}).bind(this));
  },

  listen: function () {
    if (this.$element.attr("readonly")) return;
    var pasteEventName = (navigator.userAgent.match(/msie/i) ? 'paste' : 'input') + ".mask";
    this.$element
      .bind("unmask", this.unmask.bind(this))
      .bind("focus", this.focusEvent.bind(this))
      .bind("blur", this.blurEvent.bind(this))
      .bind("keydown", this.keydownEvent.bind(this))
      .bind("keypress", this.keypressEvent.bind(this))
      .bind(pasteEventName, this.pasteEvent.bind(this));
  },

  //Helper Function for Caret positioning
  caret: function (begin, end) {
    if (this.$element.length === 0) return;
    if (typeof begin == 'number') {
      end = (typeof end == 'number') ? end : begin;
      return this.$element.each(function () {
        if (this.setSelectionRange) {
          this.setSelectionRange(begin, end);
        } else if (this.createTextRange) {
          var range = this.createTextRange();
          range.collapse(true);
          range.moveEnd('character', end);
          range.moveStart('character', begin);
          range.select();
        }
      })
    } else {
      if (this.$element[0].setSelectionRange) {
        begin = this.$element[0].selectionStart;
        end = this.$element[0].selectionEnd;
      } else if (document.selection && document.selection.createRange) {
        var range = document.selection.createRange();
        begin = 0 - range.duplicate().moveStart('character', -100000);
        end = begin + range.text.length;
      }
      return {
        begin: begin,
        end: end
      }
    }
  },

  // поиск следующего места для вставки
  seekNext: function (pos) {
    var len = this.mask.length;
    while (++pos <= len && !this.tests[pos]);

    return pos
  },

  // поиск предыдущего места для вставки
  seekPrev: function (pos) {
    while (--pos >= 0 && !this.tests[pos]);

    return pos
  },

  shiftL: function (begin, end) {
    var len = this.mask.length;

    if (begin < 0) return;

    for (var i = begin, j = this.seekNext(end); i < len; i++) {
      if (this.tests[i]) {
        if (j < len && this.tests[i].test(this.buffer[j])) {
          this.buffer[i] = this.buffer[j];
          this.buffer[j] = this.options.placeholder
        } else
          break;
        j = this.seekNext(j);
      }
    }
    this.writeBuffer();
    this.caret(Math.max(this.firstNonMaskPos, begin));
  },

  // заполнение маски placeholder-ом
  shiftR: function (pos) {
    var len = this.mask.length;

    for (var i = pos, c = this.options.placeholder; i < len; i++) {
      if (this.tests[i]) {
        var j = this.seekNext(i);
        var t = this.buffer[i];
        this.buffer[i] = c;
        if (j < len && this.tests[j].test(t))
          c = t;
        else
          break
      }
    }
  },

  unmask: function () {
    this.$element
      .unbind(".mask")
      .removeData("inputmask");
  },

  focusEvent: function () {
    this.focusText = this.$element.val();
    var len = this.mask.length;
    var pos = this.checkVal();
    this.writeBuffer();

    var that = this;
    var moveCaret = function () {
      if (pos == len)
        that.caret(0, pos);
      else
        that.caret(pos)
    };

    if ($.browser && $.browser.msie)
      moveCaret();
    else
      setTimeout(moveCaret, 0)
  },

  blurEvent: function () {
    this.checkVal();
    if (this.$element.val() != this.focusText)
      this.$element.trigger('change');
  },

  keydownEvent: function (e) {
    var k = e.which;

    //backspace, delete, and escape get special treatment
    if (k == 8 || k == 46 || (isIphone && k == 127)) { // удаление
      var pos = this.caret(),
        begin = pos.begin,
        end = pos.end;

      if (end - begin === 0) {
        begin = k != 46 ? this.seekPrev(begin) : (end = this.seekNext(begin - 1));
        end = k == 46 ? this.seekNext(end) : end;
      }
      this.clearBuffer(begin, end);
      this.shiftL(begin, end - 1);

      e.preventDefault();
    } else if (k == 27) {//escape
      this.$element.val(this.focusText);
      this.caret(0, this.checkVal());
      e.preventDefault();
    }
  },

  keypressEvent: function (e) {
    var len = this.mask.length;

    var k = e.which,
      pos = this.caret();

    // игнорируем все нажатия с ctrl, alt и мета ключи
    if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
      e.preventDefault();
    } else if (k) { // это символы для вставки
      if (pos.end - pos.begin !== 0) {
        this.clearBuffer(pos.begin, pos.end);
        this.shiftL(pos.begin, pos.end - 1);
      }

      var p = this.seekNext(pos.begin - 1); // поиск места для вставки
      if (p < len) {
        var c = String.fromCharCode(k); // получение символа по коду
        console.log(c);
        if (this.tests[p].test(c)) { // тестирование символа
          this.shiftR(p); // заполнения значения placeholder со сдвигом
          this.buffer[p] = c; // запись нового значения
          this.writeBuffer(); // запись в модель
          var next = this.seekNext(p); // поиск след места каретки
          this.caret(next); // перемещение каретки на след место
        }
      }
      e.preventDefault();
    }


  },

  pasteEvent: function () {
    var that = this;

    setTimeout(function () {
      that.caret(that.checkVal(true));
    }, 0)
  },

  clearBuffer: function (start, end) {
    var len = this.mask.length;

    for (var i = start; i < end && i < len; i++) {
      if (this.tests[i]) {
        if (this.tests[i] instanceof RegExp) // null for accessory symbols
          this.buffer[i] = this.options.placeholder;
        else {
          this.buffer[i] = this.tests[i];
        }
      }
    }
  },

  writeBuffer: function () {
    return this.$element.val(this.buffer.join('')).val()
  },

  checkVal: function (allow) {
    var len = this.mask.length;
    //try to place characters where they belong
    var test = this.$element.val();
    var lastMatch = -1;

    for (var i = 0, pos = 0; i < len; i++) {
      if (this.tests[i]) {
        //this.buffer[i] = this.options.placeholder;
        while (pos++ < test.length) {
          var c = test.charAt(pos - 1);
          if (this.tests[i].test(c)) {
            this.buffer[i] = c;
            lastMatch = i;
            break
          }
        }
        if (pos > test.length)
          break
      } else if (this.buffer[i] == test.charAt(pos) && i != this.partialPosition) {
        pos++;
        lastMatch = i;

      }
    }
    if (!allow && lastMatch + 1 < this.partialPosition) {
      this.$element.val("");
      this.clearBuffer(0, len);
    } else if (allow || lastMatch + 1 >= this.partialPosition) {
      this.writeBuffer();
      if (!allow) this.$element.val(this.$element.val().substring(0, lastMatch + 1));
    }
    return (this.partialPosition ? i : this.firstNonMaskPos);
  }
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
            textWrap.text(__mask);
            init ();
          }
          attrs.$observe ('mask', updateMask);
          //updateMask (attrs['mask']);

          function init () {
            console.log('init', __mask, ngModel);
            __modelValue = ngModel.$modelValue || null;
            __viewValue = $mask.placeToTheNext(__modelValue, __mask);
            renderValue();
            console.log('__viewValue', ngModel);
          }
          ngModel.$parsers.push(function (val) {
            console.log('parser');
            return $mask.clear(val, __mask);
          });
          ngModel.$formatters.push(function (val) {
            console.log('formatter');
            return $mask.placeToTheNext(val, __mask);
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

          function shiftLeft (begin, end) {
            console.log('shiftLeft', begin, end);

          }
          function shiftRight (pos) {
            var len = __mask.length;
            __viewValue = ngModel.$viewValue;
            var clearedValue = $mask.clear(ngModel.$viewValue, __mask);
            var clearedPos = $mask.clearPosition(pos, __mask, true);
          }

          function clearSelection (begin, end) {
            __viewValue = ngModel.$viewValue.slice(0,begin) + ngModel.$viewValue.slice(end);
          }
          function renderValue () {
            ngModel.$setViewValue(__viewValue);
            ngModel.$render();
          }
          inputEl.bind('keydown', function (e) {
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
              // сдвинуть значение с правой стороны на удаленный range

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
            var k = e.which;
            console.log('keydown', k);
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
                shiftLeft (pos.begin, pos.end-1);
              } else if (ngModel.$modelValue.length == __config.schema.length) { // not selected and full filled mask
                // not insert
                e.preventDefault();
                return;
              }
              // вставляем в начало выделения новый символ
              var c = String.fromCharCode(k); // получение символа по коду
              console.log('insert new char', c);

              // тестируем символ по паттерну
              // записываем символ в буфер
              var p = searchNextPos(pos.begin - 1);
              if (p !== null) { //null усли следующего места для вставке не существует
                shiftRight (p); //сдвинуть значения с [p, end] вправо на 1 позицию вставки

                var newValue = __viewValue.split('');
                newValue[p] = c;
                __viewValue = newValue.join('');
                var cleared = $mask.clear(__viewValue, __mask);
                __viewValue = $mask.placeToTheNext(cleared, __mask);

                renderValue();
                // перемещаем каретку на новое доступное место
                var next = searchNextPos(p);
                if (next) {
                  $maskCaret.set(inputEl[0], next);
                }
              }

              console.log('user typed');
              e.preventDefault();
              return;
            }
          });


        }
      }
    }
  };
});
