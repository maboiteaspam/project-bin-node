#!/usr/bin/env node

var cliargs = require('cliargs');
var path = require('path');
var _ = require('underscore');
var pkg = require('./package.json');
var Tasks = require('./lib/tasks-helper.js')
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
  console.log(' %s -nocommit', pkg.name);
  console.log('');
  console.log('%s', 'Options');
  console.log(' -p|--path <path>\t Path to initialize');
  console.log(' -l|--layout <layout>\t App layout to use lamba|electron');
  console.log(' -n|-nocommit \t Do not commit after update');
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
var layout = argsObj.layout || argsObj.l || 'lambda';
var bin = argsObj.bin || argsObj.b || false;

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
        //'vcs' : 'git',
        'ci' : 'travis',
        'projectVersion' : '0.0.1',
        'projectName' : path.basename(wdPath),
        'init_message' : 'init <% global.projectName %> project',
        'description' : '',
        'keywords' : '',
        'node_pkg': {
          'entry': 'main.js',
          'packages':[],
          'devPackages':[]
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
    grunt.setUserGruntfile('project-init.js')
  },
  // -
  run: function(grunt, cwd){

    var programTasks = []

    // -
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

    // -
    Tasks(grunt
    ).multiLineInput('description', 'Please enter the module description', 'global.description'
    ).multiLineInput('keywords', 'Please enter the module keywords', 'global.keywords',
      function(v){return _.filter(v.split(/\s+/), function(y){return !!y.length})}
    ).packToTask('describe', programTasks);

    // -
    Tasks(grunt
    ).generateFile('node_pkg',
      __dirname + '/templates/package.json',
      'package.json'
    ).generateFile('node_gitignore',
      __dirname + '/templates/gitignore.ejs',
      '.gitignore'
    ).generateFile('node_readme',
      __dirname + '/templates/README.md',
      'README.md'
    ).packToTask('pkg_init', programTasks);

    // -
    var deps = Tasks(grunt);
    if (grunt.config.get('global.node_pkg.packages')
      && grunt.config.get('global.node_pkg.packages').length) {
      deps.npmInstall('node_deps',
        '<%=global.node_pkg.packages%>',
        'save');
    }
    if (grunt.config.get('global.node_pkg.devPackages')
      && grunt.config.get('global.node_pkg.devPackages').length) {
      deps.npmInstall('node_devdeps',
        '<%=global.node_pkg.devPackages%>',
        'save-dev');
    }
    if (grunt.config.get('global.node_pkg.globalPackages')
      && grunt.config.get('global.node_pkg.globalPackages').length) {
      deps.npmInstall('node_globaldeps',
        '<%=global.node_pkg.globalPackages%>',
        'global');
    }
    deps.packToTask('deps_install', programTasks);

    // -
    if (bin) {
      Tasks(grunt
      ).generateFile('bin',
        __dirname + '/templates/binary/bin/nameit.js',
        bin
      ).packToTask('bin_setup', programTasks);
    }

    // -
    var layoutMaker = Tasks(grunt);
    if (layout.match(/lambda/)) {
      layoutMaker.generateDir('lambda',
        __dirname + '/templates/lambda',
        cwd
      )
    }
    if (layout.match(/electron/)) {
      layoutMaker.generateDir('electron',
        __dirname + '/templates/electron',
        cwd
      )
    }
    if (layout.match(/grunt/)) {
      layoutMaker.generateDir('grunt',
        __dirname + '/templates/grunt',
        cwd
      )
    }
    if (layout.match(/bower/)) {
      layoutMaker.generateDir('bower',
        __dirname + '/templates/bower',
        cwd
      )
    }
    layoutMaker
      .packToTask('layout_make', programTasks);

    // -
    if (grunt.config.get('global.ci')==='travis') {
      Tasks(grunt)
        .generateFile('ci_travis',
        __dirname + '/templates/.travis.yml',
        '.travis.yml'
      ).packToTask('ci', programTasks);
    }

    // -
    if (grunt.config.get('global.vcs')==='git') {
      var vcs = Tasks(grunt)
        .gitInit('vcs_init')
        .gitAdd('vcs_add', '<%=run.vcs.add %>');
      if (!noCommit) vcs.gitCommit('vcs_commit', '<%=global.vcs.init_message%>')
      if (!noPush) vcs.gitPush('vcs_push')
      vcs.packToTask('vcs', programTasks);
    }

    // -
    grunt.registerTask('default', programTasks)
  }
})
