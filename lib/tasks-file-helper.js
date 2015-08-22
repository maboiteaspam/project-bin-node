
var TasksWorkflow = require('./tasks-workflow.js')
var tasksFileHelper = {};

tasksFileHelper.ensureGitExcludes = function(name, excludes, global) {
  var targetOpts = {
    'options': {
      excludes: excludes || [],
      global : !!global
    }
  }
  return TasksWorkflow.createTask('ensuregitexclude', name, targetOpts)
}

tasksFileHelper.appendToFile = function(name, file, content) {
  var targetOpts = {
    'options': {
      file: file,
      mode: 'append',
      content: content
    }
  }
  return TasksWorkflow.createTask('writefile', name, targetOpts)
}
tasksFileHelper.prependToFile = function(name, file, content) {
  var targetOpts = {
    'options': {
      file: file,
      mode: 'prepend',
      content: content
    }
  }
  return TasksWorkflow.createTask('writefile', name, targetOpts)
}
tasksFileHelper.writeFile = function(name, file, content) {
  var targetOpts = {
    'options': {
      file: file,
      mode: 'replace',
      force: true,
      content: content
    }
  }
  return TasksWorkflow.createTask('writefile', name, targetOpts)
}
tasksFileHelper.mergeJSONFile = function(name, jsonfile, data) {
  var targetOpts = {
    options: {
      file: jsonfile,
      data: data
    }
  }
  return TasksWorkflow.createTask('merge-jsonfile', name, targetOpts)
}
tasksFileHelper.jsonFormat = function(name, jsonfile) {
  var targetOpts = {
    options: {
      infile: jsonfile
    }
  }
  return TasksWorkflow.createTask('jsonformat', name, targetOpts)
}

module.exports = tasksFileHelper;
