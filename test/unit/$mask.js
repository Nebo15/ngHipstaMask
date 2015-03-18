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
          if (!valid.hasOwnProperty(mask)) continue;
          expect($mask.parse(mask).schema).toEqual(valid[mask].schema);
        }
      });
      it ('should get template from mask', function () {
        for (var mask in valid) {
          if (!valid.hasOwnProperty(mask)) continue;
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
    });
    describe('clearPosition', function () {
      it ('should return 0 position in empty mask', function () {
        expect($mask.clearPosition(10,'')).toEqual(0);
      });
      it ('should return 0 on less idx, then minimum pattern idx', function () {
        expect($mask.clearPosition(2,'12312312##')).toEqual(0);
        expect($mask.clearPosition(2,'123##1312##')).toEqual(0);
      });
      it ('should return schema length if idx more, then schema max pos', function () {
        expect($mask.clearPosition(4,'###123')).toEqual(2);
        expect($mask.clearPosition(11,'123##1312#2323')).toEqual(2);
      });
      it ('should return index of the char in clear value', function () {
        expect($mask.clearPosition(3,'2###')).toEqual(2);
        expect($mask.clearPosition(2,'2###')).toEqual(1);
        expect($mask.clearPosition(4,'2#23##')).toEqual(1);
      });
      it ('should return index of the nearest valid pattern position on the left side', function () {
        expect($mask.clearPosition(3,'2#23##')).toEqual(0);
        expect($mask.clearPosition(8,'2#23#123123#')).toEqual(1);
      });
      it ('should return index of the nearest valid pattern position on the right side', function () {
        expect($mask.clearPosition(1,'2123##223#', true)).toEqual(0);
        expect($mask.clearPosition(3,'2##223#', true)).toEqual(2);
        expect($mask.clearPosition(2,'2#21##', true)).toEqual(1);
        expect($mask.clearPosition(3,'2##8#3##', true)).toEqual(2);
      });
    });
    describe('dirtyPosition', function () {
      it ('should return undefined if value is less 0', function () {
        expect($mask.dirtyPosition(-1, '1###')).not.toBeDefined();
      });
      it ('should return undefined for empty mask', function () {
        expect($mask.dirtyPosition(2, '')).not.toBeDefined();
        expect($mask.dirtyPosition(0, '')).not.toBeDefined();
      });
      it ('should return undefined if idx is bigger then schema length', function () {
        expect($mask.dirtyPosition(2, '#')).not.toBeDefined();
      });
      it ('should return position of schema char', function () {
        expect($mask.dirtyPosition(0, '232#')).toEqual(3);
        expect($mask.dirtyPosition(1, '232#23#')).toEqual(6);
      });
    });
    describe('nextPosition', function () {
      it ('should return Undefined for empty mask', function () {
        expect($mask.nextPosition(1,'')).not.toBeDefined();
      });
      it ('should return Undefined if place was not found', function () {
        expect($mask.nextPosition(1,'123')).not.toBeDefined();
        expect($mask.nextPosition(1,'3#')).not.toBeDefined();
      });
      it ('should calculate next position', function () {
        expect($mask.nextPosition(2,'22#2#')).toEqual(4);
        expect($mask.nextPosition(1,'22#2#')).toEqual(4);
        expect($mask.nextPosition(2,'22##2#')).toEqual(3);
      });
      it ('should calculate prev position', function () {
        expect($mask.nextPosition(4,'22#2#', false)).toEqual(2);
        expect($mask.nextPosition(10,'2122#12 32#', false)).toEqual(4);
        expect($mask.nextPosition(4,'# # #', false)).toEqual(2);
      })
    })
  });
});
