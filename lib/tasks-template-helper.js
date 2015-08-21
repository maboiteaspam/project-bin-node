
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
    config: readfiletoconfigOpts
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
    config: templateOpts
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
      config: jsonFormatOpts
    }])
  }
  // --
  //taskOpts.run = {
  //  'vcs': {
  //    add: [output]
  //  }
  //}
  //grunt.config.merge(taskOpts)
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
    config: templateOpts
  }])
  //taskOpts.run = {
  //  'vcs': {
  //    add: files
  //  }
  //}
  //grunt.config.merge(taskOpts)
  return tasks;
}

module.exports = tasksTemplateHelper;
