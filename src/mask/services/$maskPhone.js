'use strict';

Mask.service('$maskPhone', function () {
  var config = {
    masks: {
      "1_3_7": "# (###) ###-####",
      "3_2_7": "### (##) ###-####",
      "2_3_7": "## (###) ###-####",
      "1_2_8": "# (##) ########",
      "3_3_6": "### (###) ######",
      "2_1_8": "## (#) ####-####",
      "2_2_8": "## (##) ####-####"
    },
    countries: {
      "" : "1_3_7",
      "1" : "1_3_7", // USA + Canada
      "2" : "3_3_6",
      "20" : "1_2_8", // Egypt
      "27" : "2_3_7", // South Africa
      "3" : "3_2_7",
      "30" : "2_3_7", // Greece
      "31" : "2_3_7", // Netherlands
      "32" : "2_3_7", // Belgium
      "33" : "2_2_8", // France
      "34" : "2_3_7", // Spain
      "36" : "2_3_7", // Hungary
      "39" : "2_3_7", // Italy
      "4" : "3_2_7",
      "40" : "2_3_7", // Romania
      "41" : "2_3_7", // Switzerland
      "43" : "2_3_7", // Austria
      "44" : "2_3_7", // United Kingdom
      "45" : "2_3_7", // Denmark
      "46" : "2_3_7", // Sweden
      "47" : "2_3_7", // Norway
      "48" : "2_3_7", // Poland
      "49" : "2_3_7", // Germany
      "51" : "2_3_7", // Peru
      "52" : "2_3_7", // Mexico
      "53" : "2_3_7", // Cuba
      "54" : "2_3_7", // Argentina
      "55" : "2_3_7", // Brazil
      "56" : "2_3_7", // Chile
      "57" : "2_3_7", // Colombia
      "58" : "2_3_7", // Venezuela
      "60" : "2_3_7", // Malaysia
      "61" : "2_3_7", // Australia
      "62" : "2_3_7", // Indonesia
      "63" : "2_3_7", // Philippines
      "64" : "2_3_7", // New Zealand
      "65" : "2_3_7", // Singapore
      "66" : "2_3_7", // Thailand
      "7" : "1_3_7", // Russia
      "81" : "2_3_7", // Japan
      "82" : "2_3_7", // South Korea
      "86" : "2_3_7", // China
      "9"  : "3_2_7", // Azia
      "90" : "2_3_7", // Turkey
      "91" : "2_3_7", // India
      "92" : "2_3_7", // Pakistan
      "93" : "2_3_7", // Afghanistan
      "94" : "2_3_7", // Sri Lanka
      "98" : "2_3_7", // Iran
      "99" : "3_2_7", //
      "992" : "3_2_7", // Tajikistan
      "993" : "3_2_7", // Turkmenistan
      "994" : "3_2_7", // Azerbaijan
      "995" : "3_2_7", // Georgia
      "996" : "3_2_7", // Kyrgyzstan
      "998" : "3_2_7" // Uzbekistan
    }
  };

  function searchMask (number) {
    var found = null;
    number = (number || '').toString();
    var sstr = '';
    for (var i = 0, l = number.length; i <= l; i++) {
      sstr = number.substr(0,i);
      if (config.countries.hasOwnProperty(sstr)) found = sstr;
    }
    return {
      "mask": config.masks[config.countries[found]]
    };
  }
  return {
    search: searchMask
  };
});
