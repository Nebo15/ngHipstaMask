'use strict';

describe('ngMask', function() {

  beforeEach(module('ngMask'));
  describe('service: $mask', function () {

    var $mask;
    beforeEach(inject(function (_$mask_) {
      $mask = _$mask_;
    }));

    var valid = {
      '+380(##)###-##-##': {
        schema: [
          { pos: 5, pattern: /\d/ },
          { pos: 6, pattern: /\d/ },
          { pos: 8, pattern: /\d/ },
          { pos: 9, pattern: /\d/ },
          { pos: 10, pattern: /\d/ },
          { pos: 12, pattern: /\d/ },
          { pos: 13, pattern: /\d/ },
          { pos: 15, pattern: /\d/ },
          { pos: 16, pattern: /\d/ }
        ],
        template: '+380(__)___-__-__'
      },
      '': {
        schema: [{ pos: 0}],
        template: ''
      },
      'a': {
        schema: [{ pos: 1}],
        template: 'a'
      },
      '#####': {
        schema: [
          { pos: 0, pattern: /\d/ },
          { pos: 1, pattern: /\d/ },
          { pos: 2, pattern: /\d/ },
          { pos: 3, pattern: /\d/ },
          { pos: 4, pattern: /\d/ }
        ],
        template: '_____'
      }
    };

    //it('should', function () {
    //  console.log(expect(true).toBeTruthy);
    //  //expect(true).toBe(true);
    //});
    //var $mask;
    //beforeEach(inject(function (_$mask_) { //injecting $mask service
    //}));
    describe('fill', function () {
      it ('should fill value to mask', function () {
        expect($mask.fill('987654321', '+380(##)###-##-##')).toEqual("+380(98)765-43-21");
      });
      it ('should fill not fill full value if mask is less, then value length', function () {
        expect($mask.fill('987654321','+380(##)###')).toEqual("+380(98)765");
      });
      it ('should support multi space', function () {
        expect($mask.fill('98765','+380(##)##   #')).toEqual('+380(98)76   5');
      });
      it ('should fill only valid data', function () {
        expect($mask.fill('987a5','+380(##)###')).toEqual('+380(98)7__');
      });
    });
    describe('clear', function () {
      it ('should get data from dirty string by mask', function () {
        expect($mask.clear("+380(98)765-43-21", '+380(##)###-##-##')).toEqual('987654321');
      });
      it ('should support multi spaces', function () {
        expect($mask.clear("     5", '     #')).toEqual('5');
      })
    });
    describe('place', function () {
      it ('should place value to mask and replace accessory symbols with spaces', function () {
        expect($mask.place('12', '38##as',' ')).toEqual('  12');
      });
      it ('should remove all spaces above placed value', function () {
        expect($mask.place('12', '38##as    ',' ')).toEqual('  12');
      });
      it ('should support custom spacec char', function () {
        expect($mask.place('12', '38##as    ','a')).toEqual('aa12');
      });
    });

    describe('parce', function () {
      it ('should get schema from mask', function () {
        for (var mask in valid) {
          expect($mask.parse(mask).schema).toEqual(valid[mask].schema);
        }
      });
      it ('should get template from mask', function () {
        for (var mask in valid) {
          expect($mask.parse(mask).template).toEqual(valid[mask].template);
        }
      });
    });
    describe('placer', function () {
      it ('should return full placer for mask', function () {
        expect($mask.placer('###',' ')).toEqual('   ');
      });
      it ('should support custom spacer', function () {
        expect($mask.placer('###','a')).toEqual('aaa');
      });
      it ('should support empty mask', function () {
        expect($mask.placer('','a')).toEqual('');
      });
      it ('should support placing with pattern symbols ', function () {
        expect($mask.placer('###','#')).toEqual('###');
      });
    });
    describe('template', function () {
      it ('should return template for mask', function () {
        for (var mask in valid) {
          expect($mask.template(mask)).toEqual(valid[mask].template);
        }
      });
      it ('should support empty mask', function () {
        expect($mask.template('')).toEqual('');
      });
      it ('should support mask that have not placements', function () {
        expect($mask.template('123')).toEqual('123');
      });
    })
  });
});
