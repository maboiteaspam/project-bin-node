
var fs = require('fs');
var spawn = require('child_process').spawn;
var chalk = require('chalk');
var cParser = require('cline-parser');

module.exports = function(grunt) {

  grunt.registerMultiTask('spawn-process', 'Merge JSON file values', function() {
    var cb = this.async();
    var options = this.options({
      failOnError: true
    });
    var cmd = this.data.command;

    if (cmd === undefined) {
      throw new Error('`command` required');
    }

    cmd = grunt.template.process(typeof cmd === 'function' ? cmd.apply(grunt, arguments) : cmd);

    cmd = cParser(cmd);
    grunt.verbose.writeflags(cmd)

    var error;
    spawn(cmd.prg, cmd.args, {stdio: 'inherit'})
      .on('error', function (err) {
        error = err
      })
      .on('close', function () {
        if (error && options.failOnError) {
          grunt.warn(error);
        }
        cb();
      });
    grunt.verbose.writeln('Command:', chalk.yellow(cmd));
  });

};
