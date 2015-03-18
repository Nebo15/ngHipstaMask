'use strict';

Mask.service('$mask', function () {

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
  function placeWithTemplateFull (val, template, schema, space) {
    return fillTemplate(val, placer(template, space), schema);
  }
  function placeWithTemplate (val, template, schema, space) {
    var l = (val.length > schema.length) ? schema.length : (val.length || 1);
    return placeWithTemplateFull(val, template, schema, space).substr(0, schema[l-1].pos + !!val.length);
  }
  function placeWithTemplateToTheNext (val, template, schema, space) {
    var l = (val.length > schema.length) ? schema.length : (val.length || 1);
    return placeWithTemplateFull(val, template, schema, space).substr(0, (schema[l] || {}).pos || template.length);
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
  function placeFull (val, mask, char) {
    var config = parse(mask);
    return placeWithTemplateFull(val, config.template, config.schema, char);
  }
  function placeToTheNext (val, mask, char) {
    var config = parse(mask);
    return placeWithTemplateToTheNext(val, config.template, config.schema, char);
  }
  function templateFromMask (mask) {
    return parse(mask).template;
  }

  // get position in clear value from position in dirty value
  function clearPosition (idx, mask, forward) {
    forward = typeof forward !== 'undefined' ? forward : false; // true

    var config = parse(mask);

    var clearIdx = 0,
        schema = config.schema;
    if (idx < schema[0].pos) return 0;
    if (idx >= schema[schema.length - 1].pos) return schema.length - 1;

    for (var i = 0, l = schema.length; i < l; i++) {
      if (schema[i].pos <= idx) {
        clearIdx = i;
      } else {
        clearIdx = forward ? i : clearIdx;
        break;
      }
    }

    return clearIdx;
  }
  function dirtyPosition (clearIdx, mask) {
    var config = parse(mask);
    if (clearIdx < 0 || !mask || clearIdx > config.schema.length-1) return;
    return config.schema[clearIdx].pos;
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
    template: templateFromMask
  };
});
