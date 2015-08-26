
var temp = require('temp').track();
var fs = require('fs');
var path = require('path');

var tasksTemplate = require('./tasks-template-helper.js');
var tasksFile = require('./tasks-file-helper.js');
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')

var misc = {}
misc.spawnProcess = function(name, cmd, opts) {
  return TasksWorkflow.createTask('spawn-process', name, {
    options: opts || {},
    command: cmd
  })
}
misc.ensureValues = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    tasks.push(TasksWorkflow.createTask('ensurevar', okName, {
      'options': v
    }))
  })
  return tasks;
}
misc.installPackages = function(name, pkgs, mode, bin) {
  if (pkgs.length) {
    bin = bin || 'npm'
    mode = mode || 'save'
    mode = '--' + mode
    return  misc.spawnProcess(name,
      bin + ' i ' + pkgs.join(' ') + ' '+mode
    );
  }
}
misc.ensureValuesDoesNotMatch = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    tasks.push(TasksWorkflow.createTask('ensurevardoesnotmatch', okName, {
      'options': v
    }))
  })
  return tasks;
}
misc.ensureValuesMatch = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    tasks.push(TasksWorkflow.createTask('ensurevarmatch', okName, {
      'options': v
    }))
  })
  return tasks;
}
misc.editFile = function(name, file, editor) {
  return TasksWorkflow.createTask('edit', name, {
    'options': {
      file: file,
      editor: editor || null
    }
  })
}
misc.multiLineInput = function(name, question, save_to, refine, editor) {
  var tasks = []
  //var q = grunt.config.process(question)
  var tempFile = temp.path({suffix: '.mutiline'})
  if (fs.existsSync(question)) {
    tasks = tasks.concat(
      tasksTemplate.generateFile('mulitline_'+name, question, tempFile)
    )
  } else {
    tasks.push(
      tasksFile.writeFile('mulitline_'+name, tempFile, function (grunt) {
        var pQuestion = grunt.config.process(question)
        if (pQuestion===question) {
          pQuestion = '# '+question+'\n\n'
        }
        return pQuestion
      })
    )
  }
  // --
  tasks.push(
    misc.editFile('mulitline_'+name, tempFile, editor || null)
  )
  // --
  tasks.push(
    TasksWorkflow.createTask('readfiletoconfig', name, {
      'options': {
        file: tempFile,
        save_to: save_to || 'run.multiline.' + name,
        exclude: /^\s*#/,
        refine: refine
      }
    })
  )
  return tasks;
}
misc.chooseOption = function(name, question, choices, saveTo, refine) {
  return TasksWorkflow.createTask('chooseoption', name, {
    'options': {
      question: question,
      choices: choices,
      saveTo: saveTo,
      refine: refine
    }
  })
}
misc.mergeGruntConfig = function(name, config) {
  return TasksWorkflow.createTask('merge-grunt-config', name, {
    'options': {
      config: config
    }
  })
}



module.exports = misc;
