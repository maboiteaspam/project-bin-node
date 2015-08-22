
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
  var targetOpts = {
    'options': {
      file: tempFile,
      save_to: saveTo || 'run.content.' + name,
      refine: refine
    }
  }
  tasks.push(TasksWorkflow.createTask('concat', name, targetOpts))
  return tasks;
}
tasksTemplateHelper.generateFile = function(name, template, output) {
  var tasks = []
  // --
  var targetOpts = {
    'options': {
      data: function(grunt){return grunt.config.get();}
    },
    'files': {}
  }
  targetOpts.files[output] = [template]
  var gruntConfig = {
    config: {
      run:{
        vcs:{
          add:[].concat(targetOpts.files)
        }
      }
    }
  }
  tasks.push(TasksWorkflow.createTask('template', name, targetOpts, gruntConfig))
  // --
  if (output.match(/json$/)) {
    targetOpts = {
      'options': {
        infile: output
      }
    }
    gruntConfig = {
      config: {
        run:{
          vcs:{
            add:[].concat(targetOpts.infile)
          }
        }
      }
    }
    tasks.push(TasksWorkflow.createTask('jsonformat', name, targetOpts, gruntConfig))
  }
  return tasks;
}
tasksTemplateHelper.generateDir = function(name, fromDir, toDir) {
  var tasks = []
  // --
  var targetOpts = {
    'options': {
      data: function(grunt){return grunt.config.get();}
    },
    'files': {}
  }
  var files = glob.sync('**/**', {dot: true, cwd: fromDir, nodir: true})
  files.forEach(function (f) {
    targetOpts.files[path.join(toDir, f)] = path.join(fromDir, f);
  })
  var gruntConfig = {
    config: {
      run:{
        vcs:{
          add:[].concat(targetOpts.files)
        }
      }
    }
  }
  tasks.push(TasksWorkflow.createTask('template', name, targetOpts, gruntConfig))
  return tasks;
}

module.exports = tasksTemplateHelper;
