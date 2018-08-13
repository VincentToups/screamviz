var ColorScheme = require('color-scheme')
var hexToRGB = require('./hexToRGB')

var scheme1 = new ColorScheme;
var scheme2 = new ColorScheme;
var scheme3 = new ColorScheme;
scheme1.from_hue(8)
  .scheme('tetrade')
  .variation('soft');
scheme2.from_hue(42)
  .scheme('tetrade')
  .variation('light');
scheme3.from_hue(16)
  .scheme('tetrade')
  .variation('pastel');
var colors1 = scheme1.colors();
var colors2 = scheme2.colors();
var colors3 = scheme3.colors();
console.log('Colors1', colors1)
console.log('Colors2', colors2)
console.log('Colors3', colors3)
var colors = colors1.concat(colors2).concat(colors3)
colors = colors.map( c => hexToRGB(c))

// colors ==> array of arrays of rgb values
// ie [[r,g,b], [r,g,b] ... ] where r, g, b are values between 0 - 255 respectively
module.exports = colors