var child_process = require('child_process')
var spawn = child_process.spawn;
var Spinner = require('cli-spinner').Spinner;

module.exports = function (grunt){

  grunt.registerMultiTask('githubrelease', function(){
    var done = this.async()
    var options = this.options()

    var gitAuth = options.gitAuth
    var ghClient = require('github');

    var repository = options.repository;
    var reponame = options.repo || repository
        .replace(/https?/, '')
        .replace('://github.com/', '')
        .split('/')[0];
    var username = options.owner || gitAuth.username || repository
        .replace(/https?/, '')
        .replace('://github.com/', '')
        .split('/')[1]
        .replace(/[.]git$/, '');
    var ghApi = new ghClient({
      version: "3.0.0"
    });
    ghApi.authenticate({
      type: "basic",
      username: username,
      password: options.password
    });
    ghApi.releases.createRelease({
      owner: username,
      repo: reponame,
      tag_name: options.tagname,
      target_commitish: options.branch,
      name: options.tagname,
      body: '\n'+options.body,
      draft: !!options.isDraft,
      prerelease: !!options.isPrerelease
    }, done);
  })

  grunt.registerMultiTask('githubrepo', function(){
    var done = this.async()
    var options = this.options()
    var ghClient = require('github');
    var ghApi = new ghClient({
      version: "3.0.0"
    });
    ghApi.authenticate(options.auth);
    ghApi.repos.create(options.repo, done);
  })

  grunt.registerMultiTask('githubauth', function(){
    var done = this.async()
    var options = this.options()
    var ghAuth = options.auth
    var ghConfig = options.config
    var ghClient = require('github');
    ghConfig.debug = grunt.option('debug') || grunt.option('verbose')
    var ghApi = new ghClient(ghConfig);
    ghApi.authenticate(ghAuth);
    var spinner = new Spinner('processing.. %s');
    spinner.setSpinnerString(10);
    spinner.start();
    ghApi.repos.getAll({type: 'all'}, function (err) {
      spinner.stop(true);
      done(err)
    });
  })

}
