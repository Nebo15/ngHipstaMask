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
