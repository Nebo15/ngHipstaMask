'use strict';

angular.module('ngMask', []).service('$mask', function () {

    var __cache = {};

    var patterns = {
        '#': /\d/,
        '*': /\w/
    };
    function parseMask (mask) {
        //analyse inserting position
        var matches = [],
            template;

        mask = mask.replace(/\s/g,'\u00a0');
        var reg = new RegExp('['+Object.keys(patterns).join('')+']', 'g');
        template = mask.replace(reg, function (val, index) {
            matches.push({ // save position of masked symbol and verification pattern to config
                pos: index,
                pattern: patterns[val]
            });
            return '_'; // mask symbol to placeholder char
        });
        if (!matches[0]) matches[0] = { pos: mask.length };
        return {
            schema: matches,
            template: template
        };
    }
    function fillTemplate (val, template, schema) {
        val = (val || '').toString();
        template = template.split('');
        for (var i = 0, l = (val.length > schema.length) ? schema.length : val.length; i<l; i++) {
            if (!schema[i].pattern || !schema[i].pattern.test(val[i])) break;
            template[schema[i].pos] = val[i];
        }
        return template.join('');
    }
    function clearWithTemplate (dirtyValue, template, schema) {
        dirtyValue = (dirtyValue || '').toString();
        template = template.split('');
        var res = [];
        schema.forEach(function (val, idx) {
            res[idx] = dirtyValue[val.pos];
        });
        return res.join('');
    }
    function placer (mask, space) {
        space = typeof space !== 'undefined' ? space.toString() : '\u00a0';
        return new Array(mask.length+1).join(space);
    }
    function placeWithTemplate (val, template, schema, space) {
        var clearTemplate = placer(template, space);
        var l = (val.length > schema.length) ? schema.length : (val.length || 1);
        return fillTemplate(val, clearTemplate, schema).substr(0, schema[l-1].pos + !!val.length);
    }
    function hasMask (mask) {
        return !!__cache[mask];
    }
    function parse (mask) {
        if (!hasMask(mask)) { // to avoid reparsing cached mask
            __cache[mask] = parseMask (mask);
        }
        return __cache[mask];
    }
    function fill (val, mask) {
        var config = parse(mask);
        return fillTemplate(val, config.template, config.schema);
    }
    function clear (val, mask) {
        var config = parse(mask);
        return clearWithTemplate(val, config.template, config.schema);
    }
    function place (val, mask, char) {
        var config = parse(mask);
        return placeWithTemplate(val, config.template, config.schema, char);
    }
    function templateFromMask (mask) {
        return parse(mask).template;
    }
    return {
        fill: fill,
        get: parse,
        parse: parse,
        clear: clear,
        has: hasMask,
        place: place,
        placer: placer,
        template: templateFromMask
    };
})
.filter('masked', function ($mask) {
    return function (val, mask) {
        return $mask.fill(val, mask);
    }
})
.filter('cleared', function ($mask) {
    return function (val, mask) {
        return $mask.clear(val, mask);
    }
})
.filter('template', function ($mask) {
    return function (val) {
        return $mask.template(val);
    }
})
.filter('placed', function ($mask) {
    return function (val, mask) {
        return $mask.place(val, mask);
    }
})
.directive('mask', function ($mask) {
    return {
        restrict: 'A',
        require: '^ngModel',
        compile: function (inputElement, attrs, ngModel) {
            return {
                pre: function (scope, el, attrs) {},
                post: function (scope, inputEl, attrs, ngModel) {
                    // compiling element
                    var overallWrap = angular.element('<div />').addClass('mask-wrap'),
                        textWrap = angular.element('<div />').addClass('mask-text').appendTo(overallWrap),
                        inputWrap = angular.element('<div />').addClass('mask-input').appendTo(overallWrap);

                    overallWrap.insertBefore(inputEl);
                    inputEl.appendTo(inputWrap);

                    overallWrap.bind('click', function () {
                        inputEl.focus(); //to focus input by clicking on text mask
                    });
                    // masking
                    var mask, config, minLength;
                    function updateMask (val) {
                        mask = val;
                        config = $mask.get(mask);
                        textWrap.text(config.template);
                        minLength = config.schema[0].pos;
                        ngModel.$render();
                    }
                    attrs.$observe('mask', updateMask);
                    updateMask (attrs['mask']);

                    function clearValue (val) {
                        return val.replace(/\s/g, '').substr(0, config.schema.length);
                    }
                    ngModel.$render = function () {
                        inputEl.val($mask.place(clearValue(ngModel.$viewValue), mask));
                    };
                    ngModel.$parsers.push(function (val) {
                        ngModel.$render();
                        return clearValue(val);
                    });
                }
            }
        }
    };
});