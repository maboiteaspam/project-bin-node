
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')
var gh = {}

gh.createRelease = function(name, repository, tagname, body, opts) {
  opts = opts || {}
  opts.repository = repository
  opts.tagname = tagname
  opts.body = body
  return TasksWorkflow.createTask('githubrelease', name, {
    'options': opts
  })
}

gh.createRepo = function(name, ghAuth, ghRepoOpts) {
  return TasksWorkflow.createTask('githubrepo', name, {
    'options': {
      auth: ghAuth,
      repo: ghRepoOpts
    }
  })
}

gh.checkAuth = function(name, ghAuth, ghConfig) {
  return TasksWorkflow.createTask('githubauth', name, {
    'options': {
      auth: ghAuth,
      config: ghConfig
    }
  })
}

module.exports = gh;
