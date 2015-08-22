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
}
