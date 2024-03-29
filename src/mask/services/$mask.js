'use strict';

Mask.provider('$mask', function () {

  return {
    patterns: {
      '#': /\d/,
      '*': /\w/,
      "\\\\": null
    },
    spacer: '_',
    $get: MaskService
  };

});

function MaskService () {

  var __cache = {},
      patterns = this.patterns,
      _spacer = this.spacer;

  function hasMask (mask) {
    return !!__cache[mask];
  }
  function parse (mask) {
    if (!hasMask(mask)) { // to avoid reparsing cached mask
      __cache[mask] = parseMask (mask);
    }
    return __cache[mask];
  }
  function notStatic (schemas) {
    return schemas.filter(function (item) {
      return !item.static;
    });
  }
  function onlyStatic (schemas) {
    return schemas.filter(function (item) {
      return item.static === true;
    });
  }

  /**
   * Parsing mask for templating, clearing, etc.
   * @param mask
   * @returns {{schema: Array, template: string}}
   */
  function parseMask (mask) {
    //analyse inserting position
    var matches = [],
      template;

    mask = mask || '';
    mask = mask.replace(/\s/g,'\u00a0');
    var reg = new RegExp('['+Object.keys(patterns).join('')+']', 'g');

    var res, ret, pattern, isStatic, statics = 0;
    template = mask.replace(reg, function (val, index) {

      ret = _spacer;
      pattern = patterns[val];
      isStatic = false;

      if (val == '\\') {
        index++;
        statics++;
        ret = '';
        isStatic = true;
        pattern = new RegExp('\\'+mask[index]);
      }
      res = { // save position of masked symbol and verification pattern to config
        pos: index-statics, // offset to the left for count of the escaping symbols '\'
        pattern: pattern
      };
      if (isStatic) res.static = isStatic;
      matches.push(res);
      return ret; // mask symbol to placeholder char
    });
    if (!matches[0]) matches[0] = { pos: mask.length };
    return {
      schema: matches,
      template: template
    };
  }

  function autocompleteStaticValues (val, template, schema) {
    val = val.split('');
    // расставить по местам значения и дополнить статическими символами
    for (var i = 0, l = val.length; i<l && schema[i]; i++) {
      if (schema[i].static && !schema[i].pattern.test(val[i])) // место статического символа, но вставлен не он
      {
        val.splice(i, 0, template[schema[i].pos]);
        l++;
      }
    }

    val = val.join('');
    return val;
  }

  /**
   * Insert model value to mask
   * @param val
   * @param template
   * @param schema
   * @param auto
   * @returns {string}
   */
  function fillTemplate (val, template, schema, auto) {
    val = (val || '').toString();
    template = template.split('');

    if (auto == true) val = autocompleteStaticValues(val, template, schema);

    for (var i = 0, l = val.length; i<l; i++) {
      if (!schema[i]) break; // schema less, then value
      else if (!schema[i].static && !schema[i].pattern || !schema[i].pattern.test(val[i])) break; // don't insert if value is not matched with pattern OR not is static
      else template[schema[i].pos] = val[i]; // replace if value is correct
    }

    return template.join('');
  }
  /**
   * Clear data with mask
   * @param dirtyValue
   * @param template
   * @param schema
   * @returns {string}
   */
  function clearWithTemplate (dirtyValue, template, schema) {
    dirtyValue = (dirtyValue || '').toString();
    var res = [];
    schema.forEach(function (val, idx) {
      res[idx] = dirtyValue[val.pos];
    });
    return res.join('');
  }

  /**
   * Fill mask with spacer char
   * @param mask
   * @param space
   * @returns {string}
   */
  function placer (mask, space) {
    var config = parse(mask);
    space = typeof space !== 'undefined' ? space.toString() : '\u00a0';
    return new Array(config.template.length+1).join(space);
  }

  function autocomplete (val, template, schema) {
    if (schema[val.length] && schema[val.length].static) val = val + template[schema[val.length].pos]; // autocomplete
    return val;
  }

  /**
   * Placings
   */
  function placeWithTemplateFull (val, template, schema, space, auto) {
    if (auto) {
      val = autocompleteStaticValues(val, template, schema);
      val = autocomplete (val, template, schema);
    }
    return fillTemplate(val, placer(template, space), schema, false);
  }
  function placeWithTemplate (val, template, schema, space) {
    val = val || '';
    var l = (val.length > schema.length) ? schema.length : (val.length || 1);
    return placeWithTemplateFull(val, template, schema, space).substr(0, schema[l-1].pos + !!val.length);
  }
  /**
   * Placing to the next value with autocompleting for static value
   * @param val
   * @param template
   * @param schema
   * @param space
   * @returns {string}
   */
  function placeWithTemplateToTheNext (val, template, schema, space, auto) {
    val = val || '';
    if (auto) {
      val = autocompleteStaticValues(val, template, schema);
      val = autocomplete (val, template, schema);
    }
    var res = placeWithTemplateFull(val, template, schema, space, false);
    return res.substr(0, (schema[val.length] || {}).pos);
  }
  // Simplified outside interfaces by searching schema from cache
  function fill (val, mask, auto) {
    var config = parse(mask);
    return fillTemplate(val, config.template, config.schema, auto);
  }
  function clear (val, mask) {
    var config = parse(mask);
    return clearWithTemplate(val, config.template, config.schema);
  }
  function place (val, mask, char) {
    var config = parse(mask);
    return placeWithTemplate(val, config.template, config.schema, char);
  }
  function placeFull (val, mask, char, auto) {
    var config = parse(mask);
    return placeWithTemplateFull(val, config.template, config.schema, char, auto);
  }
  function placeToTheNext (val, mask, char, auto) {
    var config = parse(mask);
    return placeWithTemplateToTheNext(val, config.template, config.schema, char, auto);
  }
  function templateFromMask (mask) {
    return parse(mask).template;
  }

  function isStaticCharByIdx (idx, mask) {
    return onlyStatic(parse(mask).schema).filter(function (item) {
        return item.pos == idx;
      }).length > 0;
  }
  function isAccessoryCharByIdx (idx, mask) {
    var config = parse(mask);
    return config.template[idx] !== _spacer;
  }
  // get position in clear value from position in dirty value
  function clearPosition (idx, mask, forward) {
    forward = typeof forward !== 'undefined' ? forward : false; // true

    var clearIdx = 0,
      schema = notStatic(parse(mask).schema);

    if (idx < schema[0].pos) return 0;
    if (idx >= schema[schema.length - 1].pos) return schema.length - 1;

    for (var i = 0, l = schema.length; i < l; i++) {
      if (idx > schema[i].pos) continue;
      clearIdx = i;
      if (clearIdx > 0 && idx < schema[i].pos && !forward) clearIdx--;
      break;
    }

    return clearIdx;
  }
  function dirtyPosition (clearIdx, mask) {
    var config = parse(mask);
    if (clearIdx < 0 || !mask || clearIdx > config.schema.length-1) return;
    return (notStatic(config.schema)[clearIdx] || {}).pos || mask.length;
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
    template: templateFromMask,
    isAccessoryCharByIdx: isAccessoryCharByIdx,
    isStaticCharByIdx: isStaticCharByIdx,
    notStatic: notStatic
  };
}
