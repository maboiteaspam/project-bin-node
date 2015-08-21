#!/usr/bin/env node

var cliargs = require('cliargs');
var path = require('path');
var _ = require('underscore');
var pkg = require('../package.json');
var Tasks = require('../lib/tasks-helper.js')
var osenv = require('osenv')

var argsObj = cliargs.parse();

if(argsObj.help || argsObj.h){
  console.log('');
  console.log('%s', pkg.name);
  console.log(' %s', pkg.description);
  console.log('');
  console.log('%s', 'Usage');
  console.log(' %s [-p|--path <path>]', pkg.name);
  console.log(' %s --version', pkg.name);
  console.log(' %s --h|--help', pkg.name);
  console.log(' %s --nocommit', pkg.name);
  console.log(' %s --nopush', pkg.name);
  console.log(' %s --novcs', pkg.name);
  console.log('');
  console.log('%s', 'Options');
  console.log(' -p|--path <path>\t Path to initialize');
  console.log(' -l|--layout <layout>\t App layout to use lamba|electron');
  console.log(' -n|--nocommit \t Do not commit or added files');
  console.log(' --nopush \t Do not push after commit');
  console.log(' --novcs \t Do not apply any vcs');
  console.log('');
  process.exit(1 /* ? is correct ? */);
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


require('grunt2bin')({
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
  run: function(grunt, cwd){

    var programTasks = []

    // -------------------------- proper config.
    Tasks(grunt
    ).getGitConfig('get_git_config',
      'user.name', 'global.default_author', true
    ).ensureValues('git_config',[
        {var:'global.author', default:'<%=global.default_author%>'},
        {var:'global.repository', default:'http://github.com/<%=global.author%>/<%=global.projectName%>'}
      ]
    ).gitGlobalExcludesFile('git_proper_config', {
        path: osenv.home() + '/.gitignore',
        required: true
      }
    ).ensureGitExcludes('git_proper_global_excludes',
      ['.local.json', '.idea'], true
    ).packToTask('proper_config', programTasks);


    // -------------------------- package purpose
    Tasks(grunt

    ).multiLineInput('description', 'Please enter the module description', 'global.description'
    ).skipLastTask(!!grunt.config.get('global.description').length

    ).multiLineInput('keywords', 'Please enter the module keywords', 'global.keywords',
      function(v){return _.filter(v.split(/\s+/), function(y){return !!y.length})}
    ).skipLastTask(!!grunt.config.get('global.keywords').length

    ).packToTask('describe', programTasks);


    // -------------------------- package common
    Tasks(grunt
    ).generateFile('node_pkg',
      templatePath + '/package.json', 'package.json'
    ).generateFile('node_gitignore',
      templatePath + '/gitignore.ejs', '.gitignore'
    ).generateFile('node_readme',
      templatePath + '/README.md', 'README.md'
    ).packToTask('pkg_init', programTasks);


    // -------------------------- dependencies setup
    var deps = Tasks(grunt);
    if (grunt.config.get('global.node_pkg.packages')
      && grunt.config.get('global.node_pkg.packages').length) {
      deps.mergeJSONFile('deps_pkg_save', 'package.json', {dependencies:
        grunt.config.get('global.node_pkg.packages')
      });
    }
    if (grunt.config.get('global.node_pkg.devPackages')
      && grunt.config.get('global.node_pkg.devPackages').length) {
      deps.mergeJSONFile('deps_pkg_save', 'package.json', {devDependencies:
        grunt.config.get('global.node_pkg.packages')
      });
    }
    deps.packToTask('deps_configure', programTasks);


    // -------------------------- bin
    Tasks(grunt
    ).generateFile('bin',
      templatePath + '/binary/bin/nameit.js', './bin/'+bin+'.js'
    ).skipLastTask(!bin
    ).mergeJSONFile('bin_script', 'package.json', function () {
        var binOpts = {
          'bin': {}
        }
        binOpts.bin[bin] = './bin/'+bin+'.js'
        return binOpts;
      }
    ).skipLastTask(!bin
    ).packToTask('bin_setup', programTasks);


    // -------------------------- layout
    Tasks(grunt
    ).generateDir('layout_lambda',
      templatePath + '/lambda', cwd
    ).skipLastTask(!layout.match(/lambda/g)

    ).generateDir('layout_electron',
      templatePath + '/electron', cwd
    ).skipLastTask(!layout.match(/electron/g)

    ).generateDir('layout_grunt',
      templatePath + '/grunt', cwd
    ).skipLastTask(!layout.match(/grunt/g)

    ).generateDir('layout_bower',
      templatePath + '/bower', cwd
    ).skipLastTask(!layout.match(/bower/g)

    ).packToTask('layout_make', programTasks);


    // -------------------------- linter
    Tasks(grunt
    ).spawnProcess('linter_es',
      'eslint --init', {stdinRawMode: true}
    ).skipLastTask(!grunt.config.get('global.linter').match(/eslint/)
    ).mergeJSONFile('es_linter_script', 'package.json', {scripts:{'lint':'eslint'}}
    ).skipLastTask(!grunt.config.get('global.linter').match(/eslint/)

    ).generateFile('linter_jsh',
      templatePath + '/.jshintrc.tpl', '.jshintrc'
    ).skipLastTask(!grunt.config.get('global.linter').match(/jshint/)
    ).mergeJSONFile('jsh_linter_script', 'package.json', {scripts:{'lint':'jshint'}}
    ).skipLastTask(!grunt.config.get('global.linter').match(/jshint/)

    ).generateFile('linter_jsl',
      templatePath + '/.jslintrc.tpl', '.jslintrc'
    ).skipLastTask(!grunt.config.get('global.linter').match(/jslint/)
    ).mergeJSONFile('jsl_linter_script', 'package.json', {scripts:{'lint':'jslint'}}
    ).skipLastTask(!grunt.config.get('global.linter').match(/jshint/)

    ).mergeJSONFile('std_linter_script', 'package.json', {scripts:{'lint':'standard'}}
    ).skipLastTask(!grunt.config.get('global.linter').match(/standard/)

    ).packToTask('linter', programTasks);


    // -------------------------- ci
    Tasks(grunt
    ).generateFile('ci_travis',
      templatePath + '/.travis.yml', '.travis.yml'
    ).skipLastTask(!grunt.config.get('global.ci').match(/travis/)

    ).generateFile('ci_appveyor',
      templatePath + '/.appveyor.yml', '.appveyor.yml'
    ).skipLastTask(!grunt.config.get('global.ci').match(/appveyor/)

    ).packToTask('ci', programTasks);


    // -------------------------- clean up
    Tasks(grunt
    ).jsonFormat('node_pkg_format', 'package.json'
    ).jsonFormat('bower_pkg_format', 'bower.json'
    ).packToTask('cleanup', programTasks);


    // -------------------------- vcs
    var vcs = Tasks(grunt
    ).gitInit('vcs_init'
    ).gitAdd('vcs_add', '<%=run.vcs.add %>'
    ).gitCommit('vcs_commit', '<%=global.vcs.init_message%>'
    ).skipLastTask(!!noCommit
    ).gitPush('vcs_push'
    ).skipLastTask(!!noPush
    ).skipAll(grunt.config.get('global.vcs')!=='git'
    ).skipAll(!!noVCS
    ).packToTask('vcs', programTasks);


    // -------------------------- dependencies installation
    Tasks(grunt
    ).spawnProcess('npm_install',
      'npm i'
    ).spawnProcess('npm_install',
      'npm i ' + grunt.config.get('global.node_pkg.globalPackages').join(' ')+ ' -g'
    ).skipLastTask(!!grunt.config.get('global.node_pkg.globalPackages').length
    ).spawnProcess('bower_install',
      'bower i'
    ).packToTask('deps_install', programTasks);

    // that s it.
    grunt.registerTask('default', programTasks)
  }
})
