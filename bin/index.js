#!/usr/bin/env node

var cliargs = require('cliargs');
var path = require('path');
var pkg = require('../package.json');
var osenv = require('osenv')
var showusage = require('showusage')

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
var tasksUtils = require('../lib/tasks-utils-helper.js')

grunt2bin.handleProgram({
  // -
  config: function(grunt, cwd){
    grunt.loadNpmTasks('grunt-template')
    grunt.loadTasks('tasks')
    // -
    grunt.initConfig({
      'global': {
        'default_author' : '',
        'author' : '',
        'repository' : '',
        'vcs' : 'git',
        'ci' : 'travis',
        'linter' : 'eslint',
        'projectVersion' : '0.0.1',
        'projectName' : path.basename(wdPath),
        'init_message' : 'init <% global.projectName %> project',
        'description' : '',
        'keywords' : '',
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

    // -------------------------- proper config.
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
      '\nfinally ensure the global gitinore file contains some values like `.idea`.'
    ).appendTo(main);

    // -------------------------- package purpose
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


    // -------------------------- package common
    TasksWorkflow()
      .appendTask( tasksTemplate.generateFile('node_pkg',
        templatePath + '/package.json', 'package.json'
      )).appendTask( tasksTemplate.generateFile('node_gitignore',
        templatePath + '/gitignore.ejs', '.gitignore'
      )).appendTask( tasksTemplate.generateFile('node_readme',
        templatePath + '/README.md', 'README.md'
      )).packToTask('pkg_init',
      'Creates `package.json`, `README.md` and `.gitignore` files given their templates.'
    ).appendTo(main);


    // -------------------------- dependencies setup
    var dPkgList = grunt.config.get('global.node_pkg.devPackages')
    var pkgList = grunt.config.get('global.node_pkg.packages')
    TasksWorkflow()
      .appendTask( tasksFile.mergeJSONFile('deps_pkg_save', 'package.json',
        {dependencies: pkgList}
      )).skipLastTask(!pkgList || !pkgList.length)

      .appendTask( tasksFile.mergeJSONFile('deps_dpkg_save', 'package.json',
        {devDependencies: dPkgList}
      )).skipLastTask(!dPkgList || !dPkgList.length)

      .packToTask('deps_configure',
      'Re-configures `package.json` to add a set of pre defined `dependencies` and `dev-dependencies`.'
    ).appendTo(main);


    // -------------------------- bin
    TasksWorkflow()
      .appendTask( tasksTemplate.generateFile('bin',
        templatePath + '/binary/bin/nameit.js', './bin/'+bin+'.js'
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


    // -------------------------- layout
    TasksWorkflow()

      .appendTask( tasksTemplate.generateDir('layout_lambda',
        templatePath + '/lambda', cwd
      )).skipLastTask(!layout.match(/lambda/g))

      .appendTask( tasksTemplate.generateDir('layout_electron',
        templatePath + '/electron', cwd
      )).skipLastTask(!layout.match(/electron/g))

      .appendTask( tasksTemplate.generateDir('layout_grunt',
        templatePath + '/grunt', cwd
      )).skipLastTask(!layout.match(/grunt/g))

      .appendTask( tasksTemplate.generateDir('layout_bower',
        templatePath + '/bower', cwd
      )).skipLastTask(!layout.match(/bower/g))

      .packToTask('layout_make',
      'Only when `-l|--layout` option is provided.' +
      '\nRe-configures the `package.json` file and create new bin files structure given their template.'
    ).appendTo(main);


    // -------------------------- linter
    var linter = grunt.config.get('global.linter')
    TasksWorkflow()
      // -
      .appendTask( tasksUtils.spawnProcess('linter_es',
        'eslint --init', {stdinRawMode: true}
      )).skipLastTask(!linter.match(/eslint/))

      .appendTask( tasksFile.mergeJSONFile('linter_es_script',
        'package.json', {scripts:{'lint':'eslint'}}
      )).skipLastTask(!linter.match(/eslint/))

      // -
      .appendTask( tasksTemplate.generateFile('linter_jsh',
        templatePath + '/.jshintrc.tpl', '.jshintrc'
      )).skipLastTask(!linter.match(/jshint/))

      .appendTask( tasksFile.mergeJSONFile('linter_jsh_script',
        'package.json', {scripts:{'lint':'jshint'}}
      )).skipLastTask(!linter.match(/jshint/))

      // -
      .appendTask( tasksTemplate.generateFile('linter_jsl',
        templatePath + '/.jslintrc.tpl', '.jslintrc'
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


    // -------------------------- ci
    var ci = grunt.config.get('global.ci')
    TasksWorkflow()
      // -
      .appendTask( tasksTemplate.generateFile('ci_travis',
        templatePath + '/.travis.yml', '.travis.yml'
      )).skipLastTask(!ci.match(/travis/))

      // -
      .appendTask( tasksTemplate.generateFile('ci_appveyor',
        templatePath + '/.appveyor.yml', '.appveyor.yml'
      )).skipLastTask(!ci.match(/appveyor/))

      // -
      .packToTask('ci',
      'Given `global.ci` option in `grunt` config, re-configures `package.json` ' +
      '\nand initialize a default `ci` configuration given a template.'
    ).appendTo(main);


    // -------------------------- clean up
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


    // -------------------------- vcs
    TasksWorkflow()
      .appendTask( tasksGit.gitInit('vcs_init'
      ))
      .appendTask( tasksGit.gitAdd('vcs_add'
      ))
      .appendTask( tasksGit.gitCommit('vcs_commit',
        '<%=global.vcs.init_message%>'
      ))
      .skipLastTask(!!noCommit)
      .appendTask( tasksGit.gitPush('vcs_push'
      ))
      .skipLastTask(!!noPush)
      .skipAll(grunt.config.get('global.vcs')!=='git')
      .skipAll(!!noVCS)
      .packToTask('vcs',
      'Given `global.git` option in `grunt` config,' +
      'initialize a new repository and proceeds steps to put it online (add, commit, push).'
    ).appendTo(main);


    // -------------------------- dependencies installation
    var gPkgList = grunt.config.get('global.node_pkg.packages')
    TasksWorkflow()
      .appendTask( tasksUtils.spawnProcess('npm_install_local',
        'npm i'
      ))
      .appendTask( tasksUtils.spawnProcess('npm_install_global',
        'npm i ' + gPkgList.join(' ') + ' -g'
      ))
      .skipLastTask(!gPkgList || !gPkgList.length)
      .appendTask( tasksUtils.spawnProcess('bower_install',
        'bower i'
      ))
      .packToTask('deps_install',
      'Invoke npm i and bower i'
    ).appendTo(main);

    // that s it.
    //grunt.registerTask('default', programTasks)
    return main
  }
})
