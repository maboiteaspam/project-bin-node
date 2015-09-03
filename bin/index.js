#!/usr/bin/env node

var cliargs = require('cliargs');
var path = require('path');
var pkg = require('../package.json');
var osenv = require('osenv')
var showusage = require('showusage')
var _ = require('underscore')

var argsObj = cliargs.parse();

var noCommit = 'nocommit' in argsObj || 'n' in argsObj;
var noPush = 'nopush' in argsObj;
var noVCS = 'novcs' in argsObj;
var layout = argsObj.layout || argsObj.l || 'lambda';
var bin = argsObj.bin || argsObj.b || false;
var templatePath = __dirname + '/../templates';


var wdPath = argsObj.path || argsObj.p || process.cwd();
wdPath = path.resolve(wdPath)+'/';
if (argsObj.path || argsObj.p) {
  process.chdir(wdPath);
}


var grunt2bin = require('grunt2bin')
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow')
var file = require('../lib/tasks-file-helper.js')
var templater = require('../lib/tasks-template-helper.js')
var git = require('../lib/tasks-git-helper.js')
var gh = require('../lib/tasks-gh-helper.js')
var misc = require('../lib/tasks-utils-helper.js')

grunt2bin.handleProgram({
  // -
  config: function(grunt, cwd){
    // -
    grunt.loadNpmTasks('grunt-template')
    grunt.loadNpmTasks('grunt-git')
    grunt.loadTasks('tasks')
    // -
    grunt.initConfig({
      'global': {
        'default_author' : '',
        'author' : '',
        'license' : '',
        'homepage' : 'https://github.com/<%= global.author %>/<%= global.projectName %>',
        'repository' : '<%= global.homepage %>.git',
        'bugs' : '<%= global.homepage %>/issues',
        'vcs' : 'git',
        'branch' : 'master',
        'ci' : 'travis',
        'linter' : 'eslint',
        'projectVersion' : '0.0.1',
        'projectName' : path.basename(wdPath),
        'init_message' : 'init project: <%=global.projectName %>',
        'description' : '',
        'keywords' : '',
        'gh': {
          'auth': {
            type: 'client',
            username: '',
            password: ''
          },
          config:{
            version: '3.0.0'
          }
        },
        'node': {
          'entry': 'main.js',
          'packages':[],
          'devPackages':[],
          'globalPackages':[]
        },
        'bower': {
          'ignore': [],
          'packages':[],
          'devPackages':[]
        },
        'travis': {
          'versions': [process.version]
        }
      },
      'run': {
        'cwd': cwd,
        'vcs' : {
          'add': []
        }
      }
    })
  },
  // -
  run: function(main, grunt, cwd){

    //region -------------------------- check auth.
    TasksWorkflow()
      .appendTask( gh.checkAuth('svcs_check_auth',
        '<%=global.gh.auth%>', '<%=global.gh.config%>'
      ))
      .packToTask('check_auth',
      'Ensure the various auth mechanism involved works properly ' +
      '\nbefore anything is started.'
    ).skipAll(!!noVCS).appendTo(main);
    //endregion

    //region -------------------------- proper config.
    TasksWorkflow()
      .appendTask( git.getConfig('get_git_config',
        'user.name', 'global.default_author', true
      ))
      .appendTask( misc.ensureValues('git_config', [
          {var:'global.author', default:'<%=global.default_author%>'},
          {var:'global.repository', default:'http://github.com/<%=global.author%>/<%=global.projectName%>'}
        ]
      ))
      .appendTask( git.globalExcludesFile('git_proper_config', {
          path: osenv.home() + '/.gitignore',
          required: true
        }
      ))
      .appendTask( git.ensureExcludes('git_proper_global_excludes',
        ['.local.json', '.idea'], true
      ))
      .packToTask('proper_config',
      'At first, it ensure the grunt configuration holds some values for `author` and `repository` entries.' +
      '\nThen, check `git` system configuration in order to ensure a global `excludefiles` is set.' +
      '\nConfigures it to something like `$HOME/.gitignore` if it is not done yet.' +
      '\nfinally ensure the global gitignore file contains some values like `.idea`.'
    ).appendTo(main);
    //endregion

    //region -------------------------- package purpose
    TasksWorkflow()
      .appendTask( misc.multiLineInput('description', 'Please enter the module description',
        'global.description', function(description){
          return description.replace(/\s+$/, '')
        }
      )).skipLastTask(!!grunt.config.get('global.description').length)

      .appendTask( misc.multiLineInput('keywords', 'Please enter the module keywords',
        'global.keywords', function(keywords){
          return _.filter(keywords.split(/\s+/), function(kw){return !!kw.length})
        }
      )).skipLastTask(!!grunt.config.get('global.keywords').length)

      .packToTask('describe',
      'Aims to gather information about the module such the `description` and the `keywords`.' +
      '\nModule name is always guessed from the directory name of the `cwd`.'
    ).appendTo(main);
    //endregion


    //region -------------------------- package common
    TasksWorkflow()
      .appendTask( templater.generateFile('node',
        templatePath + '/package.json', 'package.json',
        '<%=global%>'
      )).appendTask( templater.generateFile('node_gitignore',
        templatePath + '/gitignore.ejs', '.gitignore',
        '<%=global%>'
      )).appendTask( templater.generateFile('node_readme',
        templatePath + '/README.md', 'README.md',
        '<%=global%>'
      )).packToTask('pkg_init',
      'Creates `package.json`, `README.md` and `.gitignore` files given their templates.'
    ).appendTo(main);
    //endregion


    //region -------------------------- bin
    TasksWorkflow()
      .appendTask( templater.generateFile('bin',
        templatePath + '/binary/bin/nameit.js', './bin/'+bin+'.js',
        '<%=global%>'
      ))
      .appendTask( file.mergeJSONFile('bin_script',
        'package.json', function () {
          var binOpts = {'bin': {}}
          binOpts.bin[bin] = './bin/' + bin + '.js'
          return binOpts;
        }
      ))
      .skipAll(!bin)
      .packToTask('bin_setup',
      'Only when `-b|--bin` option is provided.' +
      '\nRe-configures the `package.json` file and create new bin files structure given `bin` template.'
    ).appendTo(main);
    //endregion


    //region -------------------------- layout
    TasksWorkflow()

      .appendTask( templater.generateDir('layout_lambda',
        templatePath + '/lambda', cwd,
        '<%=global%>'
      )).skipLastTask(!layout.match(/lambda/g))

      .appendTask( templater.generateDir('layout_electron',
        templatePath + '/electron', cwd,
        '<%=global%>'
      )).skipLastTask(!layout.match(/electron/g))

      .appendTask( templater.generateDir('layout_grunt',
        templatePath + '/grunt', cwd,
        '<%=global%>'
      )).skipLastTask(!layout.match(/grunt/g))

      .appendTask( templater.generateDir('layout_bower',
        templatePath + '/bower', cwd,
        '<%=global%>'
      )).skipLastTask(!layout.match(/bower/g))

      .packToTask('layout_make',
      'If `-l|--layout` option is not provided, default to lambda.' +
      '\nInitialize the module files structure given the layouts provided.'
    ).appendTo(main);
    //endregion


    //region -------------------------- linter
    var linter = grunt.config.get('global.linter')
    TasksWorkflow()
      // -
      .appendTask( misc.spawnProcess('linter_es', 'eslint --init', {
          stdinRawMode: true
        }
      )).skipLastTask(!linter.match(/eslint/))

      .appendTask( file.mergeJSONFile('linter_es_script',
        'package.json', {
          scripts: {'lint':'eslint'}
        }
      )).skipLastTask(!linter.match(/eslint/))

      .appendTask( misc.mergeGruntConfig('linter_vcs_add', {
          run: {vcs: {add: ['.eslintrc']}}
        }
      )).skipLastTask(!linter.match(/eslint/))

      // -
      .appendTask( templater.generateFile('linter_jsh',
        templatePath + '/.jshintrc.tpl', '.jshintrc',
        '<%=global%>'
      )).skipLastTask(!linter.match(/jshint/))

      .appendTask( file.mergeJSONFile('linter_jsh_script',
        'package.json', {
          scripts: {'lint': 'jshint'}
        }
      )).skipLastTask(!linter.match(/jshint/))

      // -
      .appendTask( templater.generateFile('linter_jsl',
        templatePath + '/.jslintrc.tpl', '.jslintrc',
        '<%=global%>'
      )).skipLastTask(!linter.match(/jslint/))

      .appendTask( file.mergeJSONFile('linter_jsl_script',
        'package.json', {
          scripts: {'lint': 'jslint'}
        }
      )).skipLastTask(!linter.match(/jslint/))

      // -
      .appendTask( file.mergeJSONFile('linter_std_script',
        'package.json', {
          scripts: {'lint': 'standard'}
        }
      )).skipLastTask(!linter.match(/standard/))

      .packToTask('linter',
      'Given `global.linter` option in `grunt` config, re-configures `package.json`' +
      '\nand initialize a default linter configuration given a template.'
    ).appendTo(main);
    //endregion


    //region -------------------------- ci
    var ci = grunt.config.get('global.ci')
    TasksWorkflow()
      // -
      .appendTask( templater.generateFile('ci_travis',
        templatePath + '/.travis.yml', '.travis.yml', '<%=global%>'
      )).skipLastTask(!ci.match(/travis/))

      // -
      .appendTask( templater.generateFile('ci_appveyor',
        templatePath + '/.appveyor.yml', '.appveyor.yml', '<%=global%>'
      )).skipLastTask(!ci.match(/appveyor/))

      // -
      .packToTask('ci',
      'Given `global.ci` option in `grunt` config, re-configures `package.json` ' +
      '\nand initialize a default `ci` configuration given a template.'
    ).appendTo(main);
    //endregion


    //region -------------------------- clean up
    TasksWorkflow()
      .appendTask( file.jsonFormat('bower_pkg_format', 'bower.json') )
      .appendTask( file.jsonFormat('node_pkg_format', 'package.json') )
      .packToTask('cleanup',
      'Ensure `json` files are human readable after templates are done.'
    ).appendTo(main);
    //endregion


    //region -------------------------- dependencies installation
    TasksWorkflow()
      .appendTask( misc.installPackages('npm_i_s',
        grunt.config.get('global.node.packages') || []
      ))
      .appendTask( misc.installPackages('npm_i_d',
        grunt.config.get('global.node.devPackages') || [],
        'save-dev'
      ))
      .appendTask( misc.installPackages('npm_i_g',
        grunt.config.get('global.node.globalPackages') || [],
        'global'
      ))
      .appendTask( misc.installPackages('bower_i_s',
        grunt.config.get('global.bower.packages') || [],
        'save', 'bower'
      ))
      .appendTask( misc.installPackages('bower_i_d',
        grunt.config.get('global.bower.devPackages') || [],
        'save-dev', 'bower'
      ))
      .packToTask('deps_install',
      'Invoke npm i and bower i'
    ).appendTo(main);
    //endregion


    //region -------------------------- vcs apply
    TasksWorkflow()
      .appendTask( git.init('vcs_init') )
      .appendTask( git.add('vcs_add', '<%=run.vcs.add%>') )
      .appendTask( git.commit('vcs_commit', '<%=global.init_message%>', {
          allowEmpty: true
        }
      ))
      .skipAll(grunt.config.get('global.vcs')!=='git' || !!noPush || !!noVCS)
      .packToTask('vcs_apply',
      'Given `global.init_message` option in `grunt` config,' +
      '\ninitializes a vcs on the current directory (init, add, commit).'
    ).appendTo(main);
    //endregion


    //region -------------------------- vcs config remote
    TasksWorkflow()
      .appendTask( gh.createRepo('vcs_create_remote_repo', '<%=global.gh.auth%>', {
          name: '<%=global.projectName%>',
          description: '<%=global.description%>',
          homepage: '<%=global.homepage%>'
        }
      ))
      .appendTask( git.addOrigin('vcs_add_origin', '<%=global.repository%>') )
      .skipAll( grunt.config.get('global.vcs')!=='git' || !!noPush || !!noVCS )
      .packToTask('vcs_config_remote',
      'Given `global.branch` and `global.repository` options within `grunt` config, ' +
      '\nadd a new remote named origin.'
    ).appendTo(main);
    //endregion


    //region -------------------------- vcs push
    TasksWorkflow()
      .appendTask( git.push('vcs_push', {
        auth: '<%=global.gh.auth%>',
        branch:'<%=global.branch%>',
        upstream:true}
      ))
      .skipAll( grunt.config.get('global.vcs')!=='git' || !!noPush || !!noVCS )
      .packToTask('vcs_push',
      'Given `global.git` option in `grunt` config, ' +
      '\npush the new repository to the remote origin.'
    ).appendTo(main);
    //endregion

    // that s it.
  }
})
