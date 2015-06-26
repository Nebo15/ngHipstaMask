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
