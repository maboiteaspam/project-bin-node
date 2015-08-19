
var fs = require('fs');
var _ = require('underscore');

module.exports = function(grunt) {

  grunt.registerMultiTask('merge-jsonfile', 'Merge JSON file values', function() {
    var options = this.options()

    var file = options.file
    var data = options.data

    if (fs.existsSync(file)) {
      var c = JSON.parse(fs.readFileSync(file));
      if (_.isFunction(data)) data = data(c)
      grunt.util._.merge(c, data);
      fs.writeFileSync(file, JSON.stringify(data, null, 2))
    }
  });

};
