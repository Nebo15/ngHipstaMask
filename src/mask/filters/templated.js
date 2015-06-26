'use strict';

Mask.filter('template', function ($mask) {
  return function (val) {
    return $mask.template(val);
  }
});
