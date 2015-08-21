
var temp = require('temp').track();
var fs = require('fs');
var path = require('path');

var tasksTemplate = require('./tasks-template-helper.js');
var tasksFile = require('./tasks-file-helper.js');

var tasksUtilHelper = {}
tasksUtilHelper.spawnProcess = function(name, cmd, opts) {
  var spawnProcessOpts = {
    options: opts || {},
    command: cmd
  }
  return [{
    name: 'spawn-process',
    target: name,
    config: spawnProcessOpts
  }];
}
tasksUtilHelper.ensureValues = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    var opts = {
      'options': v
    };
    tasks = tasks.concat([{
      name: 'ensurevar',
      target: okName,
      config: opts
    }])
  })
  return tasks;
}
tasksUtilHelper.ensureValuesDoesNotMatch = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    var opts = {
      'options': v
    };
    tasks = tasks.concat([{
      name: 'ensurevardoesnotmatch',
      target: okName,
      config: opts
    }])
  })
  return tasks;
}
tasksUtilHelper.ensureValuesMatch = function(name, vars) {
  var tasks = []
  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    var opts = {
      'options': v
    };
    tasks = tasks.concat([{
      name: 'ensurevarmatch',
      target: okName,
      config: opts
    }])
  })
  return tasks;
}
tasksUtilHelper.editFile = function(name, file, editor) {
  var editorOpts = {
    'options': {
      file: file,
      editor: editor || null
    }
  }
  return [{
    name: 'edit',
    target: name,
    config: editorOpts
  }];
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
    tasks = tasks.concat(
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
  tasks = tasks.concat(
    tasksUtilHelper.editFile('mulitline_'+name, tempFile, editor || null)
  )
  // --
  var readfiletoconfigOpts = {
    'options': {
      file: tempFile,
      save_to: save_to || 'run.multiline.' + name,
      exclude: /^\s*#/,
      refine: refine
    }
  }
  tasks = tasks.concat([{
    name: 'readfiletoconfig',
    target: name,
    config: readfiletoconfigOpts
  }])
  return tasks;
}
tasksUtilHelper.chooseOption = function(name, question, choices, saveTo, refine) {
  var chooseOptionOpts = {
    'options': {
      question: question,
      choices: choices,
      saveTo: saveTo,
      refine: refine
    }
  }
  return [{
    name: 'chooseoption',
    target: name,
    config: chooseOptionOpts
  }];
}



module.exports = tasksUtilHelper;
