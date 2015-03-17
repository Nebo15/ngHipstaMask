'use strict';

Mask.filter('cleared', function ($mask) {
  return function (val, mask) {
    return $mask.clear(val, mask);
  }
});
