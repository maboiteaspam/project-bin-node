
var temp = require('temp').track();
var glob = require('glob');
var path = require('path');
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')

var tasksTemplateHelper = {}

tasksTemplateHelper.generateContent = function(name, template, data, saveTo, refine) {
  var tasks = []
  // --
  var tempFile = temp.path({suffix: '.mutiline'})
  tasks = tasks.concat(this.generateFile('mulitline_'+name, template, tempFile, data))
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
tasksTemplateHelper.generateFile = function(name, template, output, data) {
  var tasks = []
  // --
  var targetOpts = {
    'options': {
      data: data
    },
    'files': {}
  }
  targetOpts.files[output] = template;
  var gruntConfig = {
    run:{
      vcs:{
        add: [output]
      }
    }
  };
  tasks.push(TasksWorkflow.createTask('template', name, targetOpts, gruntConfig))
  // --
  if (output.match(/json$/)) {
    targetOpts = {
      'options': {
        infile: output
      }
    }
    tasks.push(TasksWorkflow.createTask('jsonformat', name, targetOpts))
  }
  return tasks;
}
tasksTemplateHelper.generateDir = function(name, fromDir, toDir, data) {
  var tasks = []
  // --
  var targetOpts = {
    'options': {
      data: data
    },
    'files': {}
  }
  var files = glob.sync('**/**', {dot: true, cwd: fromDir, nodir: true})
  files.forEach(function (f) {
    targetOpts.files[path.join(toDir, f)] = path.join(fromDir, f);
  });

  var gruntConfig = {
    run:{
      vcs:{
        add: Object.keys(targetOpts.files)
      }
    }
  }
  tasks.push(TasksWorkflow.createTask('template', name, targetOpts, gruntConfig))
  return tasks;
}

module.exports = tasksTemplateHelper;
