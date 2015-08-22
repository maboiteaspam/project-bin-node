
var temp = require('temp').track();
var fs = require('fs');
var path = require('path');

var tasksTemplate = require('./tasks-template-helper.js');
var tasksFile = require('./tasks-file-helper.js');
var TasksWorkflow = require('./tasks-workflow.js')

var tasksUtilHelper = {}
tasksUtilHelper.spawnProcess = function(name, cmd, opts) {
  var targetOpts = {
    options: opts || {},
    command: cmd
  }
  return TasksWorkflow.createTask('spawn-process', name, targetOpts)
}
tasksUtilHelper.ensureValues = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    var targetOpts = {
      'options': v
    };
    tasks.push(TasksWorkflow.createTask('ensurevar', okName, targetOpts))
  })
  return tasks;
}
tasksUtilHelper.ensureValuesDoesNotMatch = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    var targetOpts = {
      'options': v
    };
    tasks.push(TasksWorkflow.createTask('ensurevardoesnotmatch', okName, targetOpts))
  })
  return tasks;
}
tasksUtilHelper.ensureValuesMatch = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    var targetOpts = {
      'options': v
    };
    tasks.push(TasksWorkflow.createTask('ensurevarmatch', okName, targetOpts))
  })
  return tasks;
}
tasksUtilHelper.editFile = function(name, file, editor) {
  var targetOpts = {
    'options': {
      file: file,
      editor: editor || null
    }
  }
  return TasksWorkflow.createTask('edit', name, targetOpts)
}
tasksUtilHelper.multiLineInput = function(name, question, save_to, refine, editor) {
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
    tasksUtilHelper.editFile('mulitline_'+name, tempFile, editor || null)
  )
  // --
  var targetOpts = {
    'options': {
      file: tempFile,
      save_to: save_to || 'run.multiline.' + name,
      exclude: /^\s*#/,
      refine: refine
    }
  }
  tasks.push(
    TasksWorkflow.createTask('readfiletoconfig', name, targetOpts)
  )
  return tasks;
}
tasksUtilHelper.chooseOption = function(name, question, choices, saveTo, refine) {
  var targetOpts = {
    'options': {
      question: question,
      choices: choices,
      saveTo: saveTo,
      refine: refine
    }
  }
  return TasksWorkflow.createTask('chooseoption', name, targetOpts)
}



module.exports = tasksUtilHelper;
