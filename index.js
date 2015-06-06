#!/usr/bin/env node

var Config = require('project-bin-config');
var Cluc = require('cluc');
var cliargs = require('cliargs');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var pkg = require('./package.json');

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
  console.log('');
  console.log('%s', 'Options');
  console.log(' -p|--path <path>\t Path to initialize');
  console.log('');
  process.exit(1 /* ? is correct ? */);
}

if(argsObj.version){
  console.log('%s %s', pkg.name, pkg.version);
  process.exit(1 /* ? is correct ? */);
}

var wdPath = argsObj.path || argsObj.p || process.cwd();
wdPath = path.resolve(wdPath)+'/';
var projectName = path.basename(wdPath);
var gitAddfiles = [];
var layout = argsObj.layout || argsObj.l || 'lambda';

new Config().load().get('local').forEach(function(machine){

  _.defaults(machine.profileData,{node:{}});
  _.defaults(machine.profileData.node,{
    projectName:projectName,
    author:null,
    layouts:{
      lambda:{
        path:'templates/lambda/',
        main:'index.js'
      }
    },
    license:'',
    version:'0.0.1',
    packages:null,
    devPackages:null,
    entry:'index.js',
    repository:'https://github.com/<%=author%>/<%=projectName %>',
    test:null
  });


  var line = new Cluc();
  line
    .then(function(next){
      if(!machine.profileData.node.author){
        throw 'profileData.node.author is missing';
      }
      if(!machine.profileData.node.repository){
        throw 'profileData.node.repository is missing';
      }
      this.saveValue('wdPath', wdPath);
      this.saveValue('author', machine.profileData.node.author);
      this.saveValue('projectName', projectName);
      this.saveValue('projectVersion', machine.profileData.node.version);
      this.saveValue('test', machine.profileData.node.test);
      this.saveValue('license', machine.profileData.node.license);
      this.saveValue('entry', machine.profileData.node.entry);
      this.saveValue('repository', machine.profileData.node.repository);
      next();
    }).stream('cd <%= wdPath %>', function(){
      this.display();
    }).stream('git init', function(){
      this.display();
    })

    .when(layout==='lambda', function (line) {
      line
        .subtitle('lambda app')
        .stream('touch index.js', function(){
          this.display();
          gitAddfiles.push('<%= wdPath %>index.js');
        }).then(function(next){
          var tplDir = machine.profileData.node.layouts[layout].path|| machine.profileData.node.layouts.lambda.path;
          var extraData = _.extend({projectName:projectName}, machine.profileData);
          var nLine = new Cluc()
            .generateTemplateDir(tplDir, '<%=wdPath%>', extraData, function(){
              this.display();
            });
          next(nLine);
        });
    })

    .when(layout==='electron', function (line) {
      var tplDir = 'templates/electron/';
      if(machine.profileData.node.layouts[layout]){
        if(machine.profileData.node.layouts[layout].path){
          tplDir = machine.profileData.node.layouts[layout].path;
        }
      }
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      line
        .subtitle('electron app')
        .generateTemplateDir(tplDir, '<%=wdPath%>', extraData, function(){
          this.display();
        });
    })


    .subtitle('Package JSON')
    .stream('touch package.json', function(){
      this.display();
      gitAddfiles.push('<%= wdPath %>package.json');
    }).then(function(next){
      var tplFile = machine.profileData.node.packageTplFile||'templates/package.json';
      tplFile = path.resolve(__dirname, tplFile);
      var destPath = '<%= wdPath %>package.json';
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      var nLine = new Cluc()
        .generateTemplate(tplFile, destPath, extraData, function(){
          this.display();
        });
      next(nLine);
    })

    .when(machine.profileData.node.packages, function(line){
      var p = machine.profileData.node.packages;
      line
        .subtitle('Installing default packages')
        .stream('npm i '+p+' --save', function(){
        this.display();
        this.spin();
      });
    }).when(machine.profileData.node.devPackages, function(line){
      var p = machine.profileData.node.devPackages;
      line
        .subtitle('Installing default dev-packages')
        .stream('npm i '+p+' --save-dev', function(){
        this.display();
        this.spin();
      });
    })

    .stream('touch README.md', function(){
      this.display();
      gitAddfiles.push('<%= wdPath %>README.md');
    }).then(function(next){
      var tplFile = machine.profileData.node.readmeTplFile||'templates/README.md';
      tplFile = path.resolve(__dirname, tplFile);
      var destPath = '<%= wdPath %>README.md';
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      var nLine = new Cluc()
        .subtitle('README')
        .generateTemplate(tplFile, destPath, extraData, function(){
          this.display();
        });
      next(nLine);
    })

    .stream('touch .gitignore', function(){
      this.display();
      gitAddfiles.push('<%= wdPath %>.gitignore');
    }).then(function(next){
      var tplFile = machine.profileData.node.readmeTplFile||'templates/.gitignore';
      tplFile = path.resolve(__dirname, tplFile);
      var destPath = '<%= wdPath %>.gitignore';
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      var nLine = new Cluc()
        .subtitle('.gitignore')
        .generateTemplate(tplFile, destPath, extraData, function(){
          this.display();
        });
      next(nLine);
    })

    .when(machine.profileData.node.travis, function(line){
      line
        .subtitle('Generate travis file')
        .then(function(next){
          var tplFile = machine.profileData.node.travis.travisTplFile||'templates/.travis.yml';
          tplFile = path.resolve(__dirname, tplFile);
          gitAddfiles.push('<%= wdPath %>.travis.yml');
          var destPath = '<%= wdPath %>.travis.yml';
          var extraData = _.extend({projectName:projectName}, machine.profileData);
          var nLine = new Cluc()
            .generateTemplate(tplFile, destPath, extraData, function(){
              this.display();
            });
          next(nLine);
        });
    })

    .when(machine.profileData.node.mocha, function(line){
      line
        .subtitle('Generate test folder')
        .mkdir('test', function(){
          this.display();
        }).writeFile('<%= wdPath %>test/index.js', '\n', function(){
          this.display();
          gitAddfiles.push('<%= wdPath %>test/index.js');
        });
    }).when(machine.profileData.node.mochaIndex, function(line){
      line.putFile(machine.profileData.node.mochaIndex, '<%= wdPath %>test/index.js', function(){
        this.display();
      });
    })

    .then(function(next){
      var nLine = new Cluc()
        .subtitle('Git commit')
        .each(gitAddfiles, function(f, i, nLine){
          nLine.stream('git add '+f, function(){
            this.display();
          })
        }).stream('git commit -m "project-node init"', function(){
          this.display();
        });
      next(nLine);
    })

    .subtitle('All done !')
    .run(new Cluc.transports.process());
});