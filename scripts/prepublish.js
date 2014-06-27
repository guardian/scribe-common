/* npm prepublish script

Converts AMD modules in src/ to commonjs format.
*/

var src = 'src';
var dest = '.';

var fs = require('fs');
var path = require('path');
var walk = require('fs-walk');

function lodash_amd_lodash_node(filename) {
  var through = require('through');
  var data = '';
  function write(chunk) {
    data += chunk;
  }
  function end() {
    this.queue(data.replace(/lodash-amd/g, 'lodash-node'));
    this.queue(null);
  }
  return through(write, end);
}

function fixup_use_strict(filename) {
  // deamdify will put require statements above a 'use strict';
  var through = require('through');
  var data = '';
  function write(chunk) {
    data += chunk;
  }
  function end() {
    var use_strict_pos = data.search(/\n["']use strict["'];/);
    var function_pos = data.search('function');
    if (use_strict_pos !== -1 && (function_pos === -1 || use_strict_pos < function_pos)) {
      data = "'use strict';\n" + data.replace(/\n["']use strict["'];/, '');
    }
    this.queue(data);
    this.queue(null);
  }
  return through(write, end);
}

var transforms = [
  require('deamdify'),
  lodash_amd_lodash_node,
  fixup_use_strict,
];

walk.walk(src, function (basedir, filename, stat, next) {
  var oldpath = path.join(basedir, filename);
  var newpath = path.join(dest, basedir.slice(src.length), filename);

  if (stat.isDirectory()) {
    fs.exists(newpath, function (exists) {
      if (exists) {
        next();
      } else {
        fs.mkdir(newpath, next);
      }
    });
    return;
  }

  var input = fs.createReadStream(oldpath);
  var output = fs.createWriteStream(newpath);

  if (path.extname(filename) === '.js') {
    input = transforms.map(function (transform) {
      return transform(oldpath);
    }).reduce(function (input, transform) {
      input.pipe(transform);
      return transform;
    }, input);
  }

  input.pipe(output);
  output.on('finish', next);
}, function (err) {
  if (err) {
    console.log(err);
  }
});
