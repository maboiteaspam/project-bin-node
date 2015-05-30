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
  console.log('\t%s', pkg.description);
  console.log('');
  console.log('%s', 'Usage');
  console.log('\t%s [-p|--path <path>]', pkg.name);
  console.log('\t%s --version', pkg.name);
  console.log('\t%s --h|--help', pkg.name);
  console.log('');
  console.log('%s', 'Options');
  console.log('\t-p|--path <path>\t Path to initialize');
  console.log('');
  process.exit(1 /* ? is correct ? */);
}

if(argsObj.version){
  console.log('%s %s', pkg.name, pkg.version);
  process.exit(1 /* ? is correct ? */);
}

var wdPath = argsObj.path || argsObj.p || process.cwd();
var projectPkg = path.join(wdPath,'package.json');
var projectName = path.basename(wdPath);

new Config().load().get('local').forEach(function(machine){

  _.defaults(machine.profileData,{node:{}});
  _.defaults(machine.profileData.node,{
    projectName:projectName,
    author:null,
    license:'',
    version:'0.0.1',
    packages:null,
    devPackages:null,
    entry:'index.js',
    repository:'https://github.com/<%=author%>/<%=projectName %>',
    test:null
  });


  new Cluc()
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
    }).stream('touch index.js', function(){
      this.display();
    }).then(function(next){
      var p = {
        "name": projectName,
        "version": machine.profileData.node.version,
        "description": "To be done",
        "main": machine.profileData.node.entry,
        "scripts": {},
        "repository": {},
        "keywords": [
          "To",
          "be",
          "done"
        ],
        "author": machine.profileData.node.author,
        "license": machine.profileData.node.license,
        "bugs": {}
      };
      if(machine.profileData.node.test){
        p.scripts.text = machine.profileData.node.test;
      }
      if(machine.profileData.node.repository){
        p.repository = {
          "type": "git",
          "url": _.template(machine.profileData.node.repository)(machine.profileData.node)
        };
      }
      if(machine.profileData.node.bugs){
        p.bugs = {
          "url": _.template(machine.profileData.node.bugs)(machine.profileData.node)
        };
      }
      if(machine.profileData.node.homepage){
        p.homepage =
          _.template(machine.profileData.node.homepage)(machine.profileData.node);
      }
      fs.writeFile(projectPkg, JSON.stringify(p, null, 4), function(){
        next();
      });
    }).when(machine.profileData.node.packages, function(line){
      var p = machine.profileData.node.packages;
      line.stream('npm i '+p+' --save', function(){
        this.display();
      });
    }).when(machine.profileData.node.devPackages, function(line){
      var p = machine.profileData.node.devPackages;
      line.stream('npm i '+p+' --save-dev', function(){
        this.display();
      });
    }).when(machine.profileData.node.blah, function(line){
      line.stream('blah readme', function(){
        this.display();
      }).stream('blah gitignore', function(){
        this.display();
      });
    }).when(machine.profileData.node.travis, function(line){
      var nodeVersions = machine.profileData.node.travis.versions||[process.version];
      var travisFile = '';
      travisFile += 'language: nodejs';
      travisFile += '\n';
      travisFile += 'node_js:';
      travisFile += ' - '+nodeVersions.join('\n - ')+'\n';
      travisFile += 'install:';
      travisFile += '\n';
      if(machine.profileData.node.mocha){
        travisFile += ' - npm i mocha -g';
        travisFile += '\n';
      }
      travisFile += ' - npm i';
      travisFile += '\n';
      travisFile += 'script:';
      travisFile += '\n';
      travisFile += ' - npm test';
      travisFile += '\n';
      line.writeFile('.travis.yml', travisFile, function(){
        this.display();
      });
    }).when(machine.profileData.node.mocha, function(line){
      line.mkdir('test', function(){
        this.display();
      }).writeFile('<%= wdPath %>test/index.js', '\n', function(){
        this.display();
      });
    }).when(machine.profileData.node.mochaIndex, function(line){
      line.putFile(machine.profileData.node.mochaIndex, '<%= wdPath %>test/index.js', function(){
        this.display();
      });
    }).stream('git add -A', function(){
      this.display();
    }).stream('git commit -m "project-node init"', function(){
      this.display();
    }).run(new Cluc.transports.process());
});