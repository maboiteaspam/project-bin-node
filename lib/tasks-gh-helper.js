
var tasksGhHelper = {}

tasksGhHelper.ghRelease = function(name, repository, tagname, body, opts) {
  opts = opts || {}

  opts.repository = repository
  opts.tagname = tagname
  opts.body = body
  var ghReleaseOpts = {
    'options': opts
  }
  return [{
    name: 'githubrelease',
    target: name,
    config: ghReleaseOpts
  }];
}

module.exports = tasksGhHelper;
