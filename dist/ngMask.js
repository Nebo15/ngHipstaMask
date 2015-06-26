(function() {


// Config
angular.module('mask.config', [])
	.value('mask.config', {
	    debug: true
	});

// Modules
var Mask = angular.module('ngMask', ['mask.config']);

// 'use strict';

// Mask.service('$checkdigit', [
// function () {

//   function calculateSNILS (number) {
//     number = number.toString() || '';
//     if (number.length < 9) return false;
//     var checkDigit = 0,
//         l = number.length;
//     angular.forEach(number, function (char, index) {
//       checkDigit += char * (l - index);
//     });
//     while (checkDigit > 101) checkDigit %= 101;
//     checkDigit = checkDigit < 100 ? checkDigit : '00';
//     return checkDigit;
//   }

//   function clearNumber (number) {
//     return number.toString().replace(/(\D)/g,'');
//   }
//   function checkSNILS (string) {
//     string = clearNumber (string);
//     if (string.length !== 11) return false;

//     return calculateSNILS(string.substring(0, 9)) === parseInt(string.substring(9), 10);
//   }

//   function calculateTIN (number) {
//     number = number.toString();
//     var n1, n2, valid = true;
//     if (number.length < 10) return null;

//     function calculateN1 (number) {
//       var sum = 0,
//           k = [3,7,2,4,10,3,5,9,4,6,8],
//           offset = number.length === 10 ? 2 : 0;

//       number = number.toString().substring(0,number.length-1);

//       angular.forEach(number, function (char, index) {
//         sum += parseInt(char)*k[index + offset];
//       });
//       sum = sum % 11;
//       return sum === 10 ? 0 : sum;
//     }

//     function calculateN2 (number) {
//       number = number.toString().substring(0,10);
//       var sum = 0,
//           k = [7,2,4,10,3,5,9,4,6,8];

//       angular.forEach(number, function (char, index) {
//         sum += parseInt(char)*k[index];
//       });

//       sum = sum % 11;
//       return sum === 10 ? 0 : sum;
//     }


//     if (number.length === 12) { //calculate 2nd check digit
//       n2 = calculateN2(number);
//       valid = number[number.length - 2] === n2.toString();
//     }
//     if (!valid) return false;

//     n1 = calculateN1(number);
//     valid = number[number.length - 1] === n1.toString();

//     return valid;

//   }
//   function checkTIN (string) {
//     string = clearNumber (string);
//     return calculateTIN (string);
//   }

//   return {
//     checkSNILS: checkSNILS,
//     checkTIN: checkTIN
//   };
// }
// ]);


// Mask.directive ('innSsnMask', function ($checkdigit, $timeout) {
//   return {
//     restrict: 'A',
//     require: '^ngModel',
//     scope: {
//       innSsnOptions: '='
//     },
//     link: function (scope, el, attrs, ngModel) {
//       function clearVal () {
//         return (ngModel.$modelValue || ngModel.$viewValue || '');
//       }
//       function mask (val) {
//         val = val || '';
//         val = val.toString();
//         var res = null,
//             type = '',
//             label = '',
//             len = val.length || 1;

//         ngModel.$setValidity('snils', null);
//         ngModel.$setValidity('tin', null);
//         ngModel.$setValidity('', false);

//         if ($checkdigit.checkSNILS(val)) {
//           type = 'snils';
//           label = 'СНИЛС';
//           res = '###-###-### ##';
//           ngModel.$setValidity('snils', true);
//           ngModel.$setValidity('', true);
//         } 
        
//         if ($checkdigit.checkTIN(val)) {
//           type = 'tin';
//           label = 'ИНН';
//           ngModel.$setValidity('tin', true);
//           ngModel.$setValidity('', true);
//         }

//         if (!res) res = Array(len+2).join ('*');

//         return {
//           mask: res,
//           type: type ,
//           label: label
//         }

//       }

//       // scope.innSsnOptions = mask (clearVal());
//       var __val = null,
//           oldMask = null,
//           newMask = null;

//       function updateOptions (val) {
//         val = val || '';
//         oldMask = (scope.innSsnOptions || {}).mask;
//         newMask = mask (val); // updating mask  
//         if (newMask !== oldMask) {
//           console.log('update mask for', newMask);
//           __val = val;
//           scope.innSsnOptions =  newMask;
//           $timeout(function () {
//             console.log('render', __val);

//             // ngModel.$setViewValue(__val);
//             // ngModel.$render();
//             __val = null;
//           }, 100);
//         }
//       }
//       ngModel.$parsers.unshift(function (val) {
//         updateOptions(val);
//         return val;
//       });
//       ngModel.$formatters.push(function (val) {
//         updateOptions(val);
//         return val;
//       })
//     }
//   }
// });

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

'use strict';

Mask.filter('cleared', function ($mask) {
  return function (val, mask) {
    return $mask.clear(val, mask);
  }
});

'use strict';

Mask.filter('masked', function ($mask) {
  return function (val, mask) {
    return $mask.fill(val, mask, true);
  }
});

'use strict';

/**
 * Return value with spaces in accessory chars.
 * For examples:
 * + 380 (##) ### ## ## for 098123
 * will return '      098  123'
 */
Mask.filter('placed', function ($mask) {
  return function (val, mask, spacer) {
    return $mask.place(val, mask, spacer);
  }
});

'use strict';

Mask.filter('template', function ($mask) {
  return function (val) {
    return $mask.template(val);
  }
});

'use strict';

Mask.provider('$mask', function () {

  return {
    patterns: {
      '#': /\d/,
      '*': /\w/,
      "\\\\": null
    },
    spacer: '_',
    $get: MaskService
  };

});

function MaskService () {

  var __cache = {},
      patterns = this.patterns,
      _spacer = this.spacer;

  function hasMask (mask) {
    return !!__cache[mask];
  }
  function parse (mask) {
    if (!hasMask(mask)) { // to avoid reparsing cached mask
      __cache[mask] = parseMask (mask);
    }
    return __cache[mask];
  }
  function notStatic (schemas) {
    return schemas.filter(function (item) {
      return !item.static;
    });
  }
  function onlyStatic (schemas) {
    return schemas.filter(function (item) {
      return item.static === true;
    });
  }

  /**
   * Parsing mask for templating, clearing, etc.
   * @param mask
   * @returns {{schema: Array, template: string}}
   */
  function parseMask (mask) {
    //analyse inserting position
    var matches = [],
      template;

    mask = mask || '';
    mask = mask.replace(/\s/g,'\u00a0');
    var reg = new RegExp('['+Object.keys(patterns).join('')+']', 'g');

    var res, ret, pattern, isStatic, statics = 0;
    template = mask.replace(reg, function (val, index) {

      ret = _spacer;
      pattern = patterns[val];
      isStatic = false;

      if (val == '\\') {
        index++;
        statics++;
        ret = '';
        isStatic = true;
        pattern = new RegExp('\\'+mask[index]);
      }
      res = { // save position of masked symbol and verification pattern to config
        pos: index-statics, // offset to the left for count of the escaping symbols '\'
        pattern: pattern
      };
      if (isStatic) res.static = isStatic;
      matches.push(res);
      return ret; // mask symbol to placeholder char
    });
    if (!matches[0]) matches[0] = { pos: mask.length };
    return {
      schema: matches,
      template: template
    };
  }

  function autocompleteStaticValues (val, template, schema) {
    val = val.split('');
    // расставить по местам значения и дополнить статическими символами
    for (var i = 0, l = val.length; i<l && schema[i]; i++) {
      if (schema[i].static && !schema[i].pattern.test(val[i])) // место статического символа, но вставлен не он
      {
        val.splice(i, 0, template[schema[i].pos]);
        l++;
      }
    }

    val = val.join('');
    return val;
  }

  /**
   * Insert model value to mask
   * @param val
   * @param template
   * @param schema
   * @param auto
   * @returns {string}
   */
  function fillTemplate (val, template, schema, auto) {
    val = (val || '').toString();
    template = template.split('');

    if (auto == true) val = autocompleteStaticValues(val, template, schema);

    for (var i = 0, l = val.length; i<l; i++) {
      if (!schema[i]) break; // schema less, then value
      else if (!schema[i].static && !schema[i].pattern || !schema[i].pattern.test(val[i])) break; // don't insert if value is not matched with pattern OR not is static
      else template[schema[i].pos] = val[i]; // replace if value is correct
    }

    return template.join('');
  }
  /**
   * Clear data with mask
   * @param dirtyValue
   * @param template
   * @param schema
   * @returns {string}
   */
  function clearWithTemplate (dirtyValue, template, schema) {
    dirtyValue = (dirtyValue || '').toString();
    var res = [];
    schema.forEach(function (val, idx) {
      res[idx] = dirtyValue[val.pos];
    });
    return res.join('');
  }

  /**
   * Fill mask with spacer char
   * @param mask
   * @param space
   * @returns {string}
   */
  function placer (mask, space) {
    var config = parse(mask);
    space = typeof space !== 'undefined' ? space.toString() : '\u00a0';
    return new Array(config.template.length+1).join(space);
  }

  function autocomplete (val, template, schema) {
    if (schema[val.length] && schema[val.length].static) val = val + template[schema[val.length].pos]; // autocomplete
    return val;
  }

  /**
   * Placings
   */
  function placeWithTemplateFull (val, template, schema, space, auto) {
    if (auto) {
      val = autocompleteStaticValues(val, template, schema);
      val = autocomplete (val, template, schema);
    }
    return fillTemplate(val, placer(template, space), schema, false);
  }
  function placeWithTemplate (val, template, schema, space) {
    val = val || '';
    var l = (val.length > schema.length) ? schema.length : (val.length || 1);
    return placeWithTemplateFull(val, template, schema, space).substr(0, schema[l-1].pos + !!val.length);
  }
  /**
   * Placing to the next value with autocompleting for static value
   * @param val
   * @param template
   * @param schema
   * @param space
   * @returns {string}
   */
  function placeWithTemplateToTheNext (val, template, schema, space, auto) {
    val = val || '';
    if (auto) {
      val = autocompleteStaticValues(val, template, schema);
      val = autocomplete (val, template, schema);
    }
    var res = placeWithTemplateFull(val, template, schema, space, false);
    return res.substr(0, (schema[val.length] || {}).pos);
  }
  // Simplified outside interfaces by searching schema from cache
  function fill (val, mask, auto) {
    var config = parse(mask);
    return fillTemplate(val, config.template, config.schema, auto);
  }
  function clear (val, mask) {
    var config = parse(mask);
    return clearWithTemplate(val, config.template, config.schema);
  }
  function place (val, mask, char) {
    var config = parse(mask);
    return placeWithTemplate(val, config.template, config.schema, char);
  }
  function placeFull (val, mask, char, auto) {
    var config = parse(mask);
    return placeWithTemplateFull(val, config.template, config.schema, char, auto);
  }
  function placeToTheNext (val, mask, char, auto) {
    var config = parse(mask);
    return placeWithTemplateToTheNext(val, config.template, config.schema, char, auto);
  }
  function templateFromMask (mask) {
    return parse(mask).template;
  }

  function isStaticCharByIdx (idx, mask) {
    return onlyStatic(parse(mask).schema).filter(function (item) {
        return item.pos == idx;
      }).length > 0;
  }
  function isAccessoryCharByIdx (idx, mask) {
    var config = parse(mask);
    return config.template[idx] !== _spacer;
  }
  // get position in clear value from position in dirty value
  function clearPosition (idx, mask, forward) {
    forward = typeof forward !== 'undefined' ? forward : false; // true

    var clearIdx = 0,
      schema = notStatic(parse(mask).schema);

    if (idx < schema[0].pos) return 0;
    if (idx >= schema[schema.length - 1].pos) return schema.length - 1;

    for (var i = 0, l = schema.length; i < l; i++) {
      if (idx > schema[i].pos) continue;
      clearIdx = i;
      if (clearIdx > 0 && idx < schema[i].pos && !forward) clearIdx--;
      break;
    }

    return clearIdx;
  }
  function dirtyPosition (clearIdx, mask) {
    var config = parse(mask);
    if (clearIdx < 0 || !mask || clearIdx > config.schema.length-1) return;
    return (notStatic(config.schema)[clearIdx] || {}).pos || mask.length;
  }
  function nextPosition (dirtyIdx, mask, forward) {
    forward = (typeof forward === 'undefined') ?  true : forward;
    return dirtyPosition(clearPosition(dirtyIdx, mask) + (forward ? 1: -1), mask);
  }

  return {
    fill: fill,
    get: parse,
    parse: parse,
    clear: clear,
    clearPosition: clearPosition,
    dirtyPosition: dirtyPosition,
    nextPosition: nextPosition,
    has: hasMask,
    place: place,
    placeFull: placeFull,
    placeToTheNext: placeToTheNext,
    placer: placer,
    template: templateFromMask,
    isAccessoryCharByIdx: isAccessoryCharByIdx,
    isStaticCharByIdx: isStaticCharByIdx,
    notStatic: notStatic
  };
}

'use strict';

Mask.service('$maskCaret', function () {
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
  function caret (element, begin, end) {
    element = angular.element(element);
    if (element.length === 0) return;
    if (typeof begin == 'number') {
      end = (typeof end == 'number') ? end : begin;
      return element.each(function () {
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
      if (element[0].setSelectionRange) {
        begin = element[0].selectionStart;
        end = element[0].selectionEnd;
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
  }
  return {
    get: getPos,
    set: setPos,
    range: caret
  }
});

'use strict';

Mask.provider('$maskPhone', function () {
  var countries = {
    "" : "3_2_7",
    "1" : "1_3_7", // USA + Canada
    "2" : "3_3_6",
    "20" : "1_2_8", // Egypt
    "27" : "2_3_7", // South Africa
    "3" : "3_2_7",
    "30" : "2_3_7", // Greece
    "31" : "2_3_7", // Netherlands
    "32" : "2_3_7", // Belgium
    "33" : "2_2_8", // France
    "34" : "2_3_7", // Spain
    "36" : "2_3_7", // Hungary
    "39" : "2_3_7", // Italy
    "4" : "3_2_7",
    "40" : "2_3_7", // Romania
    "41" : "2_3_7", // Switzerland
    "43" : "2_3_7", // Austria
    "44" : "2_3_7", // United Kingdom
    "45" : "2_3_7", // Denmark
    "46" : "2_3_7", // Sweden
    "47" : "2_3_7", // Norway
    "48" : "2_3_7", // Poland
    "49" : "2_3_7", // Germany
    "51" : "2_3_7", // Peru
    "52" : "2_3_7", // Mexico
    "53" : "2_3_7", // Cuba
    "54" : "2_3_7", // Argentina
    "55" : "2_3_7", // Brazil
    "56" : "2_3_7", // Chile
    "57" : "2_3_7", // Colombia
    "58" : "2_3_7", // Venezuela
    "60" : "2_3_7", // Malaysia
    "61" : "2_3_7", // Australia
    "62" : "2_3_7", // Indonesia
    "63" : "2_3_7", // Philippines
    "64" : "2_3_7", // New Zealand
    "65" : "2_3_7", // Singapore
    "66" : "2_3_7", // Thailand
    "7" : "1_3_7", // Russia
    "81" : "2_3_7", // Japan
    "82" : "2_3_7", // South Korea
    "86" : "2_3_7", // China
    "9"  : "3_2_7", // Azia
    "90" : "2_3_7", // Turkey
    "91" : "2_3_7", // India
    "92" : "2_3_7", // Pakistan
    "93" : "2_3_7", // Afghanistan
    "94" : "2_3_7", // Sri Lanka
    "98" : "2_3_7", // Iran
    "99" : "3_2_7", //
    "992" : "3_2_7", // Tajikistan
    "993" : "3_2_7", // Turkmenistan
    "994" : "3_2_7", // Azerbaijan
    "995" : "3_2_7", // Georgia
    "996" : "3_2_7", // Kyrgyzstan
    "998" : "3_2_7" // Uzbekistan
  };

  return {
    masks: {
      "1_3_7": "# (###) ###-####",
      "3_2_7": "### (##) ###-####",
      "2_3_7": "## (###) ###-####",
      "1_2_8": "# (##) ########",
      "3_3_6": "### (###) ######",
      "2_1_8": "## (#) ####-####",
      "2_2_8": "## (##) ####-####"
    },
    countries: countries,
    $get: MaskPhoneService
  };
});

function MaskPhoneService () {
  var config = {
    masks: this.masks,
    countries: this.countries
  };
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function searchMask (number) {
    var found = null;
    number = (number || '').toString ();
    var i = 0;
    while (number[i] && !isNumeric(number[i])) i++;
    number = number.substr(i); // remove + at start
    var sstr = '';

    i = 0;
    for (var l = number.length; i <= l; i++) {
      sstr = number.substr (0, i);
      if (config.countries.hasOwnProperty (sstr)) found = sstr;
    }
    return {
      "mask": config.masks[config.countries[found]]
    };
  }
  return {
    search: searchMask
  };
}

}());