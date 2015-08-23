
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

module.exports = tasksGhHelper;
