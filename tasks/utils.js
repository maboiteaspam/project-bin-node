
var fs = require('fs');
var spawn = require('child_process').spawn;
var chalk = require('chalk');
var cParser = require('cline-parser');
var inquirer = require('inquirer')
var editor = require('editors');
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')

module.exports = function(grunt) {

  grunt.registerMultiTask('spawn-process', 'Merge JSON file values', function() {
    var cb = this.async();
    var options = this.options({
      spawn: null,
      failOnError: true,
      saveTo: null
    });
    var cmd = this.data.command;

    if (cmd === undefined) {
      throw new Error('`command` required');
    }

    cmd = grunt.template.process(typeof cmd === 'function' ? cmd.apply(grunt, arguments) : cmd);

    cmd = cParser(cmd);
    grunt.verbose.writeflags(cmd)

    var spawnOpts = options.spawn
    if (!spawnOpts) {
      if (!options.spawn) spawnOpts = {stdio: 'inherit'}
      else spawnOpts = {stdio: 'pipe'}
    }
    var error;
    spawn(cmd.prg, cmd.args, spawnOpts)
      .on('error', function (err) {
        error = err
      })
      .on('close', function () {
        if (options.saveTo) {
          grunt.config.set(options.saveTo, d);
        }
        if (error && options.failOnError) {
          grunt.warn(error);
        }
        cb();
      });
    grunt.verbose.writeln('Command:', chalk.yellow(cmd));
  });

  grunt.registerMultiTask('readfiletoconfig', function(){
    var options = this.options()
    var file = options.file
    var save_to = options.save_to
    var exclude = options.exclude || null
    var refine = options.refine || function(v){return v;}

    var content = ''
    if (fs.existsSync(file)) content += ''+fs.readFileSync(file);
    content.split('\n').forEach(function(line, i){
      if (!i) content = ''
      if (!exclude || !line.match(exclude)) content+=line+'\n'
    })

    content = refine(content)

    if (content) {
      grunt.log.ok('saved value to ' + save_to)
    }

    grunt.config.set(save_to, content)

  })

  grunt.registerMultiTask('chooseoption', function(){

    var options = this.options();
    var question = options.question
    var choices = options.choices
    var def = items.indexOf(options.defVal)
    var saveTo = options.saveTo
    var refine = options.refine

    var done = this.async()
    var questions = [
      {
        type: "list",
        name: "value",
        message: question,
        choices: choices,
        default: def,
        filter: refine
      }
    ];

    inquirer.prompt( questions, function( answers ) {
      grunt.config.set(saveTo, answers.value)
      grunt.log.ok('Grunt config "' + saveTo + '" is set to "' + answers.value + '" !')
      done()
    });
  })

  grunt.registerMultiTask('edit', 'Open an editor', function() {

    var options = this.options(),
      done = this.async();

    function editFile(file, callback) {
      editor(file, options, function () {
        grunt.log.ok('Got it !')
        callback();
      });
    }
    editFile(options.file, done)
  });

  grunt.registerMultiTask('ensurevar', function(){

    var options = this.options();
    var varName = options.var
    var defaultValue = grunt.config.process(options.default)
    var currentValue = grunt.config.get(varName)

    if (!currentValue)  {

      var done = this.async()
      var questions = [
        {
          type: "input",
          name: "value",
          message: "You are required to configure '"+varName+"', please type in its value (defaults to "+defaultValue+") :",
          validate: function( value ) {
            if (!value && !defaultValue) {
              return "You must enter a different value !";
            }
            return true;
          }
        }
      ];

      inquirer.prompt( questions, function( answers ) {
        var answer = answers.value || defaultValue
        grunt.config.set(varName, answer)
        grunt.log.ok('Grunt config "' + varName + '" is set to "' + answer + '" !')
        done()
      });
    } else {
      grunt.log.ok('Grunt config "' + varName + '" is already set to "' + defaultValue + '" !')
    }
  })

  grunt.registerMultiTask('ensurevardoesnotmatch', function(){

    var options = this.options();
    var varName = options.var
    var pattern = grunt.config.process(options.pattern)
    var currentValue = grunt.config.get(varName)

    if (currentValue.match(pattern)) {
      grunt.log.error(currentValue)
      grunt.fail.fatal('"'+varName+'" must not match "'+pattern+'"')
    } else {
      grunt.log.ok('Grunt config "' + varName + '" is valid !')
    }
  })

  grunt.registerMultiTask('ensurevarmatch', function(){

    var options = this.options();
    var varName = options.var
    var pattern = grunt.config.process(options.pattern)
    var currentValue = grunt.config.get(varName)

    if (!currentValue.match(pattern)) {
      grunt.log.error(currentValue)
      grunt.fail.fatal('"'+varName+'" must match "'+pattern+'"')
    } else {
      grunt.log.ok('Grunt config "' + varName + '" is valid !')
    }
  })

  grunt.registerMultiTask('merge-grunt-config', function(){

    var options = this.options();
    var config = options.config

    TasksWorkflow.merge(grunt.config.data, options, TasksWorkflow.mergeArrays);

    grunt.log.ok('Grunt config merged with')
    grunt.log.writeflags(options)

  })


};
