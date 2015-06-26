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
