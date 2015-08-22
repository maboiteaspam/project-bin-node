
var temp = require('temp').track();
var glob = require('glob');
var path = require('path');
var TasksWorkflow = require('./tasks-workflow.js');

var tasksTemplateHelper = {}

tasksTemplateHelper.generateContent = function(name, template, saveTo, refine) {
  var tasks = []
  // --
  var tempFile = temp.path({suffix: '.mutiline'})
  tasks = tasks.concat(this.generateFile('mulitline_'+name, template, tempFile))
  // --
  var readfiletoconfigOpts = {
    'options': {
      file: tempFile,
      save_to: saveTo || 'run.content.' + name,
      refine: refine
    }
  }
  tasks = tasks.concat([{
    name: 'readfiletoconfig',
    target: name,
    options: readfiletoconfigOpts
  }])
  return tasks;
}
tasksTemplateHelper.generateFile = function(name, template, output) {
  var tasks = []
  // --
  var templateOpts = {
    'options': {
      data: function(grunt){return grunt.config.get();}
    },
    'files': {}
  }
  templateOpts.files[output] = [template]
  tasks = tasks.concat([{
    name: 'template',
    target: name,
    options: templateOpts,
    config: {
      run:{
        vcs:{
          add:[].concat(templateOpts.files)
        }
      }
    }
  }])
  // --
  if (output.match(/json$/)) {
    var jsonFormatOpts = {
      'options': {
        infile: output
      }
    }
    tasks = tasks.concat([{
      name: 'jsonformat',
      target: name,
      options: jsonFormatOpts,
      config: {
        run:{
          vcs:{
            add:[output]
          }
        }
      }
    }])
  }
  return tasks;
}
tasksTemplateHelper.generateDir = function(name, fromDir, toDir) {
  var tasks = []
  // --
  var templateOpts = {
    'options': {
      data: function(grunt){return grunt.config.get();}
    },
    'files': {}
  }
  var files = glob.sync('**/**', {dot: true, cwd: fromDir, nodir: true})
  files.forEach(function (f) {
    templateOpts.files[path.join(toDir, f)] = path.join(fromDir, f);
  })
  tasks = tasks.concat([{
    name: 'template',
    target: name,
    options: templateOpts,
    config: {
      run:{
        vcs:{
          add:[].concat(templateOpts.files)
        }
      }
    }
  }])
  return tasks;
}

module.exports = tasksTemplateHelper;
