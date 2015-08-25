var fs = require('fs')
var _ = require('underscore')

module.exports = function (grunt){

  grunt.registerMultiTask('writefile', function(){
    var options = this.options()
    var infile = options.file
    var mode = options.mode || 'replace'
    var force = !!options.force
    var content = _.isFunction(options.content)
      ? options.content(grunt)
      : grunt.config.process(options.content)

    var cFileContent = ''
    if (fs.existsSync(infile)) {
      cFileContent = fs.readFileSync(infile)
    }
    if (mode.match(/append/)) cFileContent = cFileContent + content
    if (mode.match(/prepend/)) cFileContent = content + cFileContent
    if (mode.match(/replace/)) cFileContent = content

    if (force || fs.existsSync(infile)) {
      fs.writeFileSync(infile, cFileContent)
      grunt.log.ok('File ' + infile + ' is updated !')
    } else {
      grunt.log.warn('This file does not exists ' + infile + ', skipped!')
    }
  })

  grunt.registerMultiTask('merge-jsonfile', 'Merge JSON file values', function() {
    var options = this.options()

    var file = options.file
    var data = options.data

    if (fs.existsSync(file)) {
      var c = JSON.parse(fs.readFileSync(file));
      if (_.isFunction(data)) data = data(c)
      grunt.util._.merge(c, data);
      fs.writeFileSync(file, JSON.stringify(c, null, 2))
      grunt.log.ok('File ' + file + ' is up to date !')
    } else {
      grunt.log.warn('This file does not exists ' + file + ', skipped!')

    }
  });

  grunt.registerMultiTask('jsonformat', function(){
    var options = this.options()
    var infile = options.infile
    if (fs.existsSync(infile)) {
      var k = fs.readFileSync(infile)
      k = JSON.parse(k)
      k = JSON.stringify(k, null, 4)
      fs.writeFileSync(infile, k)
      grunt.log.ok('File is clean !')
    } else {
      grunt.log.warn('This file does not exists ' + infile + ', skipped!')
    }
  })

}
