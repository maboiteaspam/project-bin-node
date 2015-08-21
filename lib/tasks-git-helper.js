
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
    config: getGitConfigOpts
  }];
}
tasksGitHelper.gitInit = function(name, opts) {
  var gitInitOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitinit',
    target: name,
    config: gitInitOpts
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
    config: gitAddOpts
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
    config: gitCommitOpts
  }];
}
tasksGitHelper.gitPush = function(name, opts) {
  var gitPushOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitpush',
    target: name,
    config: gitPushOpts
  }];
}
tasksGitHelper.gitTag = function(name, opts) {
  var gitTagOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gittag',
    target: name,
    config: gitTagOpts
  }];
}
tasksGitHelper.gitCheckout = function(name, opts) {
  var gitCheckoutOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitcheckout',
    target: name,
    config: gitCheckoutOpts
  }];
}
tasksGitHelper.gitFetch = function(name, opts) {
  var gitFetchOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitfetch',
    target: name,
    config: gitFetchOpts
  }];
}
tasksGitHelper.gitPull = function(name, opts) {
  var gitPullOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitpull',
    target: name,
    config: gitPullOpts
  }];
}
tasksGitHelper.gitGlobalExcludesFile = function(name, opts) {
  var gitGlobalExcludesFileOpts = {
    'options': opts || {}
  }
  return [{
    name: 'gitglobalexcludesfile',
    target: name,
    config: gitGlobalExcludesFileOpts
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
    config: ensureGitExcludesOpts
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
