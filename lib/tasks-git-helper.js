
var tasksUtils = require('./tasks-utils-helper.js');

var tasksGitHelper = {}
tasksGitHelper.getGitConfig = function(name, gitentry, gruntvar, global) {
  var getGitConfigOpts = {
    'options': {
      entry: gitentry,
      save_to: gruntvar,
      global: !!global
    }
  }
  return [{
    name: 'getgitconfig',
    target: name,
    options: getGitConfigOpts
  }];
}
tasksGitHelper.gitInit = function(name, opts) {
  var gitInitOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitinit',
    target: name,
    options: gitInitOpts
  }];
}
tasksGitHelper.gitAdd = function(name, files, opts) {
  var gitAddOpts = {
    'options': opts || {},
    files: files
  }
  return [{
    name: 'gitadd',
    target: name,
    options: gitAddOpts
  }];
}
tasksGitHelper.gitCommit = function(name, msg, opts) {
  var gitCommitOpts = {
    'options': opts || {}
  }
  gitCommitOpts.options.message = function (grunt){
    return grunt.config.get(msg)
  }
  return [{
    name: 'gitcommit',
    target: name,
    options: gitCommitOpts
  }];
}
tasksGitHelper.gitPush = function(name, opts) {
  var gitPushOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitpush',
    target: name,
    options: gitPushOpts
  }];
}
tasksGitHelper.gitTag = function(name, opts) {
  var gitTagOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gittag',
    target: name,
    options: gitTagOpts
  }];
}
tasksGitHelper.gitCheckout = function(name, opts) {
  var gitCheckoutOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitcheckout',
    target: name,
    options: gitCheckoutOpts
  }];
}
tasksGitHelper.gitFetch = function(name, opts) {
  var gitFetchOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitfetch',
    target: name,
    options: gitFetchOpts
  }];
}
tasksGitHelper.gitPull = function(name, opts) {
  var gitPullOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitpull',
    target: name,
    options: gitPullOpts
  }];
}
tasksGitHelper.gitGlobalExcludesFile = function(name, opts) {
  var gitGlobalExcludesFileOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitglobalexcludesfile',
    target: name,
    options: gitGlobalExcludesFileOpts
  }];
}
tasksGitHelper.ensureGitExcludes = function(name, excludes, global) {
  var ensureGitExcludesOpts = {
    'options': {
      excludes: excludes || [],
      global : !!global
    }
  }
  return [{
    name: 'ensuregitexclude',
    target: name,
    options: ensureGitExcludesOpts
  }];
}
tasksGitHelper.getGitStatus = function(name, saveTo) {
  return tasksUtils
    .spawnProcess(name, 'git status', {
      failOnError:true,
      saveTo: saveTo || 'global.run.git_status'
    });
}

module.exports = tasksGitHelper;
