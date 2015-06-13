#!/usr/bin/env node

var Config = require('project-bin-config');
var Cluc = require('cluc');
var cliargs = require('cliargs');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var pkg = require('./package.json');
var glob = require('glob');

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
var projectName = path.basename(wdPath);
var gitAddfiles = [];
var layout = argsObj.layout || argsObj.l || 'lambda';
console.log(noCommit)

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
    repository:'https://github.com/<%=node.author%>/<%=projectName %>',
    test:null
  });

  _.defaults(machine.profileData,{bower:{}});
  _.defaults(machine.profileData.bower,{
    projectName:projectName,
    author:machine.profileData.node.author,
    license:'',
    version:machine.profileData.node.version || '0.0.1',
    "ignore": [
      "**/.*",
      "node_modules",
      "bower_components",
      "static/app/components/",
      "test",
      "tests"
    ]
  });


  var line = new Cluc();
  line
    .title('Generating a new project')
    .then(function(next){
      if(!machine.profileData.node.author){
        throw 'profileData.node.author is missing';
      }
      if(!machine.profileData.node.repository){
        throw 'profileData.node.repository is missing';
      }
      this.saveValue('wdPath', wdPath);
      this.saveValue('projectName', projectName);
      this.saveValue('projectVersion', machine.profileData.node.version);
      this.saveValue('test', machine.profileData.node.test);
      next();
    }).stream('cd <%= wdPath %>', function(){
      this.display();
    }).stream('git init', function(){
      this.display();
    })

    .subtitle('Package JSON')
    .stream('touch package.json', function(){
      this.display();
      gitAddfiles.push('<%= wdPath %>package.json');
    }).then(function(next, nLine){
      var tplFile = machine.profileData.node.packageTplFile||'templates/package.json';
      tplFile = path.resolve(__dirname, tplFile);
      var destPath = '<%= wdPath %>package.json';
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      nLine.generateTemplate(tplFile, destPath, extraData, function(){
          this.display();
        });
      next();
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

    .when(layout==='lambda', function (line) {
      var tplDir = machine.profileData.node.layouts[layout].path|| machine.profileData.node.layouts.lambda.path;
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      line.subtitle('lambda app')
        .stream('touch index.js', function(){
          this.display();
          gitAddfiles.push('<%= wdPath %>index.js');
        }).then(function(next, nLine){
          nLine.generateTemplateDir(tplDir, '<%=wdPath%>', extraData, function(){
              this.display();
            }).then(function(next_){
            var options = {
              cwd: tplDir,
              dot: true,
              nodir: true
            };
            glob( '**', options, function (er, files) {
              files.forEach(function(f){
                gitAddfiles.push('<%= wdPath %>/' + f);
              });
              next_();
            });
          });
          next();
        });
    })

    .when(layout==='electron', function (line) {
      var tplDir = path.join(__dirname, 'templates/electron/');
      if(machine.profileData.node.layouts[layout]){
        if(machine.profileData.node.layouts[layout].path){
          tplDir = machine.profileData.node.layouts[layout].path;
        }
      }
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      line.subtitle('electron app')
        .generateTemplateDir(tplDir, '<%=wdPath%>', extraData, function(){
          this.display();
        }).then(function(next){
          var options = {
            cwd: tplDir,
            dot: true,
            nodir: true
          };
          glob( '**', options, function (er, files) {
            files.forEach(function(f){
              gitAddfiles.push('<%= wdPath %>/' + f);
            });
            next();
          });
        }).stream('npm i electron-prebuilt electron-packager --save-dev', function(){
          this.display();
          this.spin();
        }).stream('bower i jquery --save', function(){
          this.display();
          this.spin();
        }).then(function(next){
          var projectPkg = fs.readFileSync(wdPath+'/package.json', 'utf8');
          projectPkg = JSON.parse(projectPkg);
          projectPkg.scripts = projectPkg.scripts || {};
          var electronMain = 'app.js';
          if(projectPkg.main
            && projectPkg.main!==electronMain){
            projectPkg.mainOld = projectPkg.main;
          }
          projectPkg.main = electronMain
          var electronStart = 'node bin.js';
          if(projectPkg.scripts.start
            && projectPkg.scripts.start!==electronStart){
              projectPkg.scripts.startOld = projectPkg.scripts.start;
          }
          projectPkg.scripts.start = electronStart;
          projectPkg.bin = projectPkg.bin || {};
          projectPkg.bin[projectName] = './bin.js';
          fs.writeFileSync(wdPath+'/package.json', JSON.stringify(projectPkg, null, 4), 'utf-8')
          next();
        });
    })

    .then(function(next, nLine){
      var tplFile = machine.profileData.node.readmeTplFile||'templates/README.md';
      tplFile = path.resolve(__dirname, tplFile);
      var destPath = '<%= wdPath %>README.md';
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      nLine.subtitle('README')
        .stream('touch README.md', function(){
          this.display();
          gitAddfiles.push('<%= wdPath %>README.md');
        })
        .generateTemplate(tplFile, destPath, extraData, function(){
          this.display();
        });
      next();
    })

    .then(function(next, nLine){
      var tplFile = machine.profileData.node.readmeTplFile||'templates/.gitignore';
      tplFile = path.resolve(__dirname, tplFile);
      var destPath = '<%= wdPath %>.gitignore';
      var extraData = _.extend({projectName:projectName}, machine.profileData);
      nLine.subtitle('.gitignore')
        .stream('touch .gitignore', function(){
          this.display();
          gitAddfiles.push('<%= wdPath %>.gitignore');
        })
        .generateTemplate(tplFile, destPath, extraData, function(){
          this.display();
        })
        .when(layout==='electron', function(line){
          line.ensureFileContains('<%= wdPath %>.gitignore', '\nstatic/app/components/');
        });
      next();
    })

    .when(machine.profileData.node.travis, function(line){
      line.subtitle('Generate travis file')
        .then(function(next, nLine){
          var tplFile = machine.profileData.node.travis.travisTplFile||'templates/.travis.yml';
          tplFile = path.resolve(__dirname, tplFile);
          gitAddfiles.push('<%= wdPath %>.travis.yml');
          var destPath = '<%= wdPath %>.travis.yml';
          var extraData = _.extend({projectName:projectName}, machine.profileData);
          nLine.generateTemplate(tplFile, destPath, extraData, function(){
              this.display();
            });
          next();
        });
    })

    .when(machine.profileData.node.mocha, function(line){
      line.subtitle('Generate test folder')
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

    .when(!noCommit, function(line){
      line.then(function(next, nLine){
        nLine.subtitle('Git commit')
          .each(gitAddfiles, function(f, i, nLine){
            nLine.stream('git add '+f, function(){
              this.display();
            })
          }).stream('git commit -m "project-node init"', function(){
            this.display();
          });
        next(nLine);
      })
    })



    .subtitle('All done !')
    .run(new Cluc.transports.process());
});