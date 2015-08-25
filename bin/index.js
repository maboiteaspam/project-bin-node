#!/usr/bin/env node

var cliargs = require('cliargs');
var path = require('path');
var pkg = require('../package.json');
var osenv = require('osenv')
var showusage = require('showusage')
var _ = require('underscore')

var argsObj = cliargs.parse();

if(argsObj.help || argsObj.h){
  return showusage(path.join(__dirname, '..'), pkg.name, 'Usage')
}

if(argsObj.version){
  console.log('%s %s', pkg.name, pkg.version);
  process.exit(1 /* ? is correct ? */);
}

var wdPath = argsObj.path || argsObj.p || process.cwd();
wdPath = path.resolve(wdPath)+'/';

var noCommit = 'nocommit' in argsObj || 'n' in argsObj;
var noPush = 'nopush' in argsObj;
var noVCS = 'novcs' in argsObj;
var layout = argsObj.layout || argsObj.l || 'lambda';
var bin = argsObj.bin || argsObj.b || false;
var templatePath = __dirname + '/../templates';

if (argsObj.path || argsObj.p) {
  process.chdir(wdPath);
}


var grunt2bin = require('grunt2bin')
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow')
var tasksFile = require('../lib/tasks-file-helper.js')
var tasksTemplate = require('../lib/tasks-template-helper.js')
var tasksGit = require('../lib/tasks-git-helper.js')
var tasksGh = require('../lib/tasks-gh-helper.js')
var tasksUtils = require('../lib/tasks-utils-helper.js')

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
          }
        },
        'node_pkg': {
          'entry': 'main.js',
          'packages':[],
          'devPackages':[],
          'globalPackages':[]
        },
        'bower': {
          'ignore': []
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
    // -
    grunt.setUserGruntfile('project-init.js')
  },
  // -
  run: function(main, grunt, cwd){

    //region -------------------------- check auth.
    TasksWorkflow()
      .appendTask( tasksGh.ghCheckAuth('svcs_check_auth', '<%=global.gh.auth%>', '<%=global.gh.config%>'
      ))
      .packToTask('check_auth',
      'Ensure the various auth mechanism involved works properly before anything is started.'
    ).appendTo(main);
    //endregion

    //region -------------------------- proper config.
    TasksWorkflow()
      .appendTask( tasksGit.getGitConfig('get_git_config',
        'user.name', 'global.default_author', true
      ))
      .appendTask( tasksUtils.ensureValues('git_config',[
        {var:'global.author', default:'<%=global.default_author%>'},
        {var:'global.repository', default:'http://github.com/<%=global.author%>/<%=global.projectName%>'}
      ]))
      .appendTask( tasksGit.gitGlobalExcludesFile('git_proper_config', {
        path: osenv.home() + '/.gitignore',
        required: true
      }))
      .appendTask( tasksGit.ensureGitExcludes('git_proper_global_excludes',
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
      .appendTask( tasksUtils.multiLineInput('description',
        'Please enter the module description',
        'global.description'
      )).skipLastTask(!!grunt.config.get('global.description').length)

      .appendTask( tasksUtils.multiLineInput('keywords',
        'Please enter the module keywords',
        'global.keywords',
        function(v){return _.filter(v.split(/\s+/), function(y){return !!y.length})}
      )).skipLastTask(!!grunt.config.get('global.keywords').length)

      .packToTask('describe',
      'Aims to gather information about the module such the `description` and the `keywords`.' +
      '\nModule name is always guessed from the directory name of the `cwd`.'
    ).appendTo(main);
    //endregion


    //region -------------------------- package common
    TasksWorkflow()
      .appendTask( tasksTemplate.generateFile('node_pkg',
        templatePath + '/package.json', 'package.json', '<%=global%>'
      )).appendTask( tasksTemplate.generateFile('node_gitignore',
        templatePath + '/gitignore.ejs', '.gitignore', '<%=global%>'
      )).appendTask( tasksTemplate.generateFile('node_readme',
        templatePath + '/README.md', 'README.md', '<%=global%>'
      )).packToTask('pkg_init',
      'Creates `package.json`, `README.md` and `.gitignore` files given their templates.'
    ).appendTo(main);
    //endregion


    //region -------------------------- bin
    TasksWorkflow()
      .appendTask( tasksTemplate.generateFile('bin',
        templatePath + '/binary/bin/nameit.js', './bin/'+bin+'.js', '<%=global%>'
      ))
      .appendTask( tasksFile.mergeJSONFile('bin_script', 'package.json', function () {
          var binOpts = {
            'bin': {}
          }
          binOpts.bin[bin] = './bin/'+bin+'.js'
          return binOpts;
      }))
      .skipAll(!bin)
      .packToTask('bin_setup',
      'Only when `-b|--bin` option is provided.' +
      '\nRe-configures the `package.json` file and create new bin files structure given their template.'
    ).appendTo(main);
    //endregion


    //region -------------------------- layout
    TasksWorkflow()

      .appendTask( tasksTemplate.generateDir('layout_lambda',
        templatePath + '/lambda', cwd, '<%=global%>'
      )).skipLastTask(!layout.match(/lambda/g))

      .appendTask( tasksTemplate.generateDir('layout_electron',
        templatePath + '/electron', cwd, '<%=global%>'
      )).skipLastTask(!layout.match(/electron/g))

      .appendTask( tasksTemplate.generateDir('layout_grunt',
        templatePath + '/grunt', cwd, '<%=global%>'
      )).skipLastTask(!layout.match(/grunt/g))

      .appendTask( tasksTemplate.generateDir('layout_bower',
        templatePath + '/bower', cwd, '<%=global%>'
      )).skipLastTask(!layout.match(/bower/g))

      .packToTask('layout_make',
      'Only when `-l|--layout` option is provided.' +
      '\nRe-configures the `package.json` file and create new bin files structure given their template.'
    ).appendTo(main);
    //endregion


    //region -------------------------- linter
    var linter = grunt.config.get('global.linter')
    TasksWorkflow()
      // -
      .appendTask( tasksUtils.spawnProcess('linter_es',
        'eslint --init', {stdinRawMode: true}
      )).skipLastTask(!linter.match(/eslint/))

      .appendTask( tasksFile.mergeJSONFile('linter_es_script',
        'package.json', {scripts:{'lint':'eslint'}}
      )).skipLastTask(!linter.match(/eslint/))

      .appendTask( tasksUtils.mergeGruntConfig('linter_vcs_add',{
          run:{vcs:{add:['.eslintrc']}}
        }
      )).skipLastTask(!linter.match(/eslint/))

      // -
      .appendTask( tasksTemplate.generateFile('linter_jsh',
        templatePath + '/.jshintrc.tpl', '.jshintrc', '<%=global%>'
      )).skipLastTask(!linter.match(/jshint/))

      .appendTask( tasksFile.mergeJSONFile('linter_jsh_script',
        'package.json', {scripts:{'lint':'jshint'}}
      )).skipLastTask(!linter.match(/jshint/))

      // -
      .appendTask( tasksTemplate.generateFile('linter_jsl',
        templatePath + '/.jslintrc.tpl', '.jslintrc', '<%=global%>'
      )).skipLastTask(!linter.match(/jslint/))

      .appendTask( tasksFile.mergeJSONFile('linter_jsl_script',
        'package.json', {scripts:{'lint':'jslint'}}
      )).skipLastTask(!linter.match(/jslint/))

      // -
      .appendTask( tasksFile.mergeJSONFile('linter_std_script',
        'package.json', {scripts:{'lint':'standard'}}
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
      .appendTask( tasksTemplate.generateFile('ci_travis',
        templatePath + '/.travis.yml', '.travis.yml', '<%=global%>'
      )).skipLastTask(!ci.match(/travis/))

      // -
      .appendTask( tasksTemplate.generateFile('ci_appveyor',
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
      .appendTask( tasksFile.jsonFormat('bower_pkg_format',
        'bower.json'
      ))
      .appendTask( tasksFile.jsonFormat('node_pkg_format',
        'package.json'
      ))
      .packToTask('cleanup',
      'Clean up to re format `json` files.'
    ).appendTo(main);
    //endregion


    //region -------------------------- vcs apply
    TasksWorkflow()
      .appendTask( tasksGit.gitInit('vcs_init'
      ))
      .appendTask( tasksGit.gitAdd('vcs_add',
        '<%=run.vcs.add%>'
      ))
      .appendTask( tasksGit.gitCommit('vcs_commit',
        '<%=global.init_message%>',
        {allowEmpty: true}
      ))
      .skipAll(grunt.config.get('global.vcs')!=='git')
      .skipAll(!!noCommit)
      .skipAll(!!noVCS)
      .packToTask('vcs_apply',
      'Given `global.init_message` option in `grunt` config,' +
      'applies a new vcs on the current directory (init, add, commit).'
    ).appendTo(main);
    //endregion


    //region -------------------------- vcs config remote
    TasksWorkflow()
      .appendTask( tasksGh.ghRepo('vcs_create_remote_repo', '<%=global.gh.auth%>', {
          name: '<%=global.projectName%>',
          description: '<%=global.description%>',
          homepage: '<%=global.homepage%>'
        }
      ))
      .appendTask( tasksGit.addOrigin('vcs_add_origin', '<%=global.repository%>'
      ))
      .appendTask( tasksGit.setUpstream('vcs_set_upstream', '<%=global.branch%>'
      ))
      .skipAll(grunt.config.get('global.vcs')!=='git')
      .skipAll(!!noVCS)
      .skipAll(!!noPush)
      .packToTask('vcs_config_remote',
      'Given `global.branch` and `global.repository` options from global `grunt` config,' +
      'add a new remote named origin and configure it as upstream to the new repository.'
    ).appendTo(main);
    //endregion


    //region -------------------------- vcs push
    TasksWorkflow()
      .appendTask( tasksGit.gitPush('vcs_push'))
      .skipAll(grunt.config.get('global.vcs')!=='git')
      .skipAll(!!noPush)
      .skipAll(!!noVCS)
      .packToTask('vcs_push',
      'Given `global.git` option in `grunt` config,' +
      'Push the new repository to the remote origin..'
    ).appendTo(main);
    //endregion


    //region -------------------------- dependencies installation
    var gPkgList = grunt.config.get('global.node_pkg.globalPackages')
    var dPkgList = grunt.config.get('global.node_pkg.devPackages')
    var pkgList = grunt.config.get('global.node_pkg.packages')
    TasksWorkflow()
      .appendTask( tasksUtils.spawnProcess('npm_install_local',
        'npm i .'
      ))
      .appendTask( tasksUtils.spawnProcess('npm_install_global',
        'npm i ' + pkgList.join(' ') + ' --save'
      ))
      .appendTask( tasksUtils.spawnProcess('npm_install_global',
        'npm i ' + dPkgList.join(' ') + ' --save-dev'
      ))
      .appendTask( tasksUtils.spawnProcess('npm_install_global',
        'npm i ' + gPkgList.join(' ') + ' -g'
      ))
      .skipLastTask(!gPkgList || !gPkgList.length)

      .appendTask( tasksUtils.spawnProcess('bower_install',
        'bower i'
      )).skipLastTask(!layout.match(/bower/g))

      .packToTask('deps_install',
      'Invoke npm i and bower i'
    ).appendTo(main);
    //endregion

    // that s it.
  }
})
