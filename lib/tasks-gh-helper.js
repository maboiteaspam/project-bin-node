
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')
var tasksGhHelper = {}

tasksGhHelper.ghRelease = function(name, repository, tagname, body, opts) {
  opts = opts || {}

  opts.repository = repository
  opts.tagname = tagname
  opts.body = body
  var targetOpts = {
    'options': opts
  }
  return TasksWorkflow.createTask('githubrelease', name, targetOpts)
}

tasksGhHelper.ghRepo = function(name, ghAuth, ghRepoOpts) {
  var targetOpts = {
    'options': {
      auth: ghAuth,
      repo: ghRepoOpts
    }
  }
  return TasksWorkflow.createTask('githubrepo', name, targetOpts)
}

tasksGhHelper.ghCheckAuth = function(name, ghAuth, ghConfig) {
  var targetOpts = {
    'options': {
      auth: ghAuth,
      config: ghConfig
    }
  }
  return TasksWorkflow.createTask('githubauth', name, targetOpts)
}

module.exports = tasksGhHelper;
