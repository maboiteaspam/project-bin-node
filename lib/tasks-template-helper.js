
var temp = require('temp').track();
var glob = require('glob');
var path = require('path');
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')

var templater = {}

templater.generateContent = function(name, template, data, saveTo, refine) {
  var tasks = []
  // --
  var tempFile = temp.path({suffix: '.mutiline'})
  tasks = tasks.concat(this.generateFile('mulitline_'+name, template, tempFile, data))
  // --
  tasks.push(TasksWorkflow.createTask('concat', name, {
    'options': {
      file: tempFile,
      save_to: saveTo || 'run.content.' + name,
      refine: refine
    }
  }))
  return tasks;
}
templater.generateFile = function(name, template, output, data) {
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
    tasks.push(TasksWorkflow.createTask('jsonformat', name, {
      'options': {
        infile: output
      }
    }))
  }
  return tasks;
}
templater.generateDir = function(name, fromDir, toDir, data) {
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

module.exports = templater;
