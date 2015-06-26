'use strict';

Mask.filter('masked', function ($mask) {
  return function (val, mask) {
    return $mask.fill(val, mask, true);
  }
});
