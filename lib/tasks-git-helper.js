
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')
var tasksUtils = require('./tasks-utils-helper.js');

var tasksGitHelper = {}
tasksGitHelper.getGitConfig = function(name, gitentry, gruntvar, global) {
  var targetOpts = {
    'options': {
      entry: gitentry,
      save_to: gruntvar,
      global: !!global
    }
  }
  return TasksWorkflow.createTask('getgitconfig', name, targetOpts)
}
tasksGitHelper.gitInit = function(name, opts) {
  return TasksWorkflow.createTask('gitinit', name, {options: opts || {}})
}
tasksGitHelper.gitAdd = function(name, files, opts) {
  var targetOpts = {
    'options': opts || {},
    files: {
      src: files
    }
  }
  return TasksWorkflow.createTask('gitadd', name, targetOpts)
}
tasksGitHelper.gitCommit = function(name, msg, opts) {
  var targetOpts = {
    'options': opts || {}
  }
  targetOpts.options.message = msg;
  return TasksWorkflow.createTask('gitcommit', name, targetOpts)
}
tasksGitHelper.gitPush = function(name, opts) {
  return TasksWorkflow.createTask('gitpush', name, {options: opts || {}})
}
tasksGitHelper.gitTag = function(name, opts) {
  return TasksWorkflow.createTask('gittag', name, {options: opts || {}})
}
tasksGitHelper.gitCheckout = function(name, opts) {
  return TasksWorkflow.createTask('gitcheckout', name, {options: opts || {}})
}
tasksGitHelper.gitFetch = function(name, opts) {
  return TasksWorkflow.createTask('gitfetch', name, {options: opts || {}})
}
tasksGitHelper.gitPull = function(name, opts) {
  return TasksWorkflow.createTask('gitpull', name, {options: opts || {}})
}
tasksGitHelper.gitGlobalExcludesFile = function(name, opts) {
  return TasksWorkflow.createTask('gitglobalexcludesfile', name, {options: opts || {}})
}
tasksGitHelper.ensureGitExcludes = function(name, excludes, global) {
  var targetOpts = {
    'options': {
      excludes: excludes || [],
      global : !!global
    }
  }
  return TasksWorkflow.createTask('ensuregitexclude', name, targetOpts)
}
tasksGitHelper.getGitStatus = function(name, saveTo) {
  return tasksUtils
    .spawnProcess(name, 'git status', {
      failOnError:true,
      saveTo: saveTo || 'global.run.git_status'
    });
}

module.exports = tasksGitHelper;
