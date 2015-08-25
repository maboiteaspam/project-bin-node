var child_process = require('child_process')
var spawn = child_process.spawn;

module.exports = function (grunt){

  grunt.registerTask('gitinit', function(){
    var done = this.async()
    var options = this.options()
    var args = ['init'];
    ('path' in options)&& args.push(options.path);
    ('shared' in options)&& args.push('--shared', options.shared);
    ('template' in options)&& args.push('--template', options.template);
    ('gitDir' in options)&& args.push('--separate-git-dir', options.gitDir);
    ('bare' in options)&& args.push('--bare ');
    ('quiet' in options)&& args.push('--quiet ');
    spawn('git', args, {stdio:'inherit'})
      .on('close', function () {
        done()
      })
  })

  grunt.registerMultiTask('gitglobalexcludesfile', function(){
    var done = this.async()
    var options = this.options()
    var args = [
      'config',
      '--global',
      'core.excludesfile'
    ];

    if (options.force && options.path) {
      args.push(options.path)
      spawn('git', args, {stdio:'inherit'})
        .on('close', function () {
          done()
        })
    } else {
      var currentConfig = ''
      var git = spawn('git', args, {stdio: ['inherit','pipe','inherit']});
      git.stdout.on('data', function (d) {
        currentConfig = (d + '').replace(/\s+$/, '');
      });
      git.on('close', function () {
        if (!currentConfig.length && options.path) {
          args.push(options.path)
          grunt.log.warn('Configuring code.excludefiles git variable ' +
          'to ' + options.path)
          spawn('git', args, {stdio:'inherit'})
            .on('close', function () {
              grunt.log.ok('All done !')
              done()
            })
        } else if(!currentConfig.length && options.required) {
          grunt.log.error('git variable code.excludefiles must be configured, ' +
          'but you have not told me how it should be, ' +
          'please check your configuration!')
          done()
        } else if(!currentConfig.length) {
          grunt.log.warn('fyi, ' +
          'git variable code.excludefiles is not configured.')
          done()
        } else {
          grunt.log.ok('All fine !')
          done()
        }
      })
    }
  })

  grunt.registerMultiTask('getgitconfig', function(){
    var done = this.async()
    var options = this.options()
    var gitentry = options.entry
    var gruntvar = options.save_to
    var global = !!options.global

    var args = ['config'];
    if (global) args.push('--global')
    args.push(gitentry)

    var currentConfig = ''
    var git = spawn('git', args, {stdio: ['inherit','pipe','inherit']});
    git.stdout.on('data', function (d) {
      currentConfig = (d + '').replace(/\s+$/, '');
    });
    git.on('close', function () {
      if (!currentConfig) {
        grunt.log.warn('git does not have '+(global?'global ':' ')+'configuration for entry: "'+gitentry+'"')
      } else {
        grunt.config.set(gruntvar, currentConfig)
        grunt.log.ok('Save '+(global?'global ':' ')+'git config value "'+gruntvar+'" to "'+currentConfig+'" !')
      }
      done()
    })

  })

  grunt.registerMultiTask('ensuregitexclude', function(){
    var done = this.async()
    var options = this.options()
    var gitignorefile = '.gitignore'
    var excludes = options.excludes || []

    var updateFile = function(file, items) {
      grunt.log.ok('Checking file ' + file)
      var added = []
      var ignored = !fs.existsSync(file)
        ? ''
        : fs.readFileSync(file) + '';
      items.forEach(function (ex) {
        if (!ignored.match(new RegExp('('+rquote(ex)+')'))) {
          ignored += '\n'+ex
          added.push(ex)
        }
      });
      fs.writeFileSync(file, ignored)
      if (added.length) grunt.log.ok('Added new entries:' + added.join(','))
      grunt.log.ok('All fine !')
    }

    if (!options.global) {
      updateFile(gitignorefile, excludes)
      done()
    } else {
      var args = [
        'config',
        '--global',
        'core.excludesfile'
      ];
      var git = spawn('git', args, {stdio: ['inherit','pipe','inherit']});
      git.stdout.on('data', function (d) {
        gitignorefile = (d + '').replace(/\s+$/, '');
      });
      git.on('close', function () {
        updateFile(gitignorefile, excludes)
        done()
      })
    }
  })

  grunt.registerMultiTask('gitinit', function(){
    var done = this.async()
    var options = this.options()
    var args = ['init'];
    ('path' in options)&& args.push(options.path);
    ('shared' in options)&& args.push('--shared', options.shared);
    ('template' in options)&& args.push('--template', options.template);
    ('gitDir' in options)&& args.push('--separate-git-dir', options.gitDir);
    ('bare' in options)&& args.push('--bare ');
    ('quiet' in options)&& args.push('--quiet ');
    spawn('git', args, {stdio:'inherit'})
      .on('close', function () {
        done()
      })
  })

}
