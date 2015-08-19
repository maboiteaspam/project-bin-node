
// grunt task <%= global.projectName %> by <%= global.author %>

var pkg = require('package.json');

module.exports = function (grunt) {

  grunt.initConfig({})

  grunt.registerMultiTask('some', function () {
    var done = this.async()
    var options = this.options({
      default: 'values'
    })

    grunt.log.writeFlags(options)

    grunt.log.ok('All done !')

    done()
  })

  grunt.registerTask('default', [])

};