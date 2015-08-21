
var temp = require('temp').track();
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var _ = require('underscore');


var TasksHelper = function (grunt){
  var self = this
  if (!(self instanceof TasksHelper)) return new TasksHelper(grunt)

  this.grunt = grunt;
  this.tasks = [];
}
TasksHelper.prototype.replaceTask = function (name, newTasks) {
  this.grunt.registerTask(name, newTasks)
  this.tasks.forEach(function(task){
    if (task.name===name) {
      task.tasks = []
    }
  })
  return this;
}
TasksHelper.prototype.skipTask = function (name, onlyIf) {
  if (onlyIf) {
    var grunt = this.grunt
    var i = -1
    this.tasks.forEach(function(task){
      if (task.name===name) {
        task.tasks = []
      }
    })
    if (i>-1) {
      var task = this.tasks.splice(i, 1)
      delete grunt.task._tasks[task.name]
    }
  }
  return this;
}
TasksHelper.prototype.skipLastTask = function (onlyIf) {
  if (onlyIf) {
    var grunt = this.grunt
    var task = this.tasks.pop()
    delete grunt.task._tasks[task.name]
  }
  return this;
}
TasksHelper.prototype.skipAll = function (onlyIf) {
  if (onlyIf) {
    var grunt = this.grunt
    this.tasks.forEach(function(task){
      delete grunt.task._tasks[task.name]
    })
    this.tasks = []
  }
  return this;
}
TasksHelper.prototype.packToTask = function (name, superTask, description) {
  var grunt = this.grunt
  var tasks = []
  this.tasks.forEach(function(task){
    tasks.push(task.name)
    grunt.registerTask(task.name, task.tasks)
  })
  if (tasks.length) {
    grunt.registerTask(name, tasks)
    superTask.push(name)
  }
  var g = {
    global: {descriptions: {}}
  }
  g.global.descriptions[name] = description || 'description not provided.';
  grunt.config.merge(g)
  this.tasks = []
  return this;
}
TasksHelper.prototype.ensureValues = function(name, vars) {

  var grunt = this.grunt
  var opts = {};
  var tasks = [];

  vars.forEach(function(v){
    var okName = v.var.replace(/:/g, '-')
    opts[okName] = {
      'options': v
    };
    tasks.push('ensurevar:'+okName)
  })

  grunt.config.merge({
    'ensurevar': opts
  })

  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.generateFile = function(name, template, output) {

  var grunt = this.grunt
  var tasks = []
  var taskOpts = {}

  // --
  var templateOpts = {}
  templateOpts[name] = {
    'options': {
      data: function(){return grunt.config.get();}
    },
    'files': {}
  }
  templateOpts[name].files[output] = [template]
  taskOpts.template = templateOpts

  tasks.push('template:'+name)

  // --
  if (output.match(/json$/)) {
    var jsonFormatOpts = {}
    jsonFormatOpts[name] = {
      'options': {
        infile: output
      }
    }
    taskOpts['jsonformat'] = jsonFormatOpts
    if (output.match(/json$/)) {
      tasks.push('jsonformat:'+name)
    }
  }

  // --
  taskOpts.run = {
    'vcs': {
      add: [output]
    }
  }

  grunt.config.merge(taskOpts)
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.generateDir = function(name, fromDir, toDir) {

  var grunt = this.grunt
  var tasks = []
  var taskOpts = {}

  // --
  var templateOpts = {}
  templateOpts[name] = {
    'options': {
      data: function(){return grunt.config.get();}
    },
    'files': {}
  }
  var files = glob.sync('**/**', {dot: true, cwd: fromDir, nodir: true})
  files.forEach(function (f) {
    templateOpts[name].files[path.join(toDir, f)] = path.join(fromDir, f);
  })
  taskOpts.template = templateOpts
  tasks.push('template:'+name)

  taskOpts.run = {
    'vcs': {
      add: files
    }
  }

  grunt.config.merge(taskOpts)

  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.mergeJSONFile = function(name, jsonfile, data) {

  var grunt = this.grunt
  var tasks = []

  // --
  var mergeJSONFileOpts = {}
  mergeJSONFileOpts[name] = {
    options: {
      file: jsonfile,
      data: data
    }
  }

  tasks.push('merge-jsonfile:' + name)

  grunt.config.merge({
    'merge-jsonfile': mergeJSONFileOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.jsonFormat = function(name, jsonfile) {

  var grunt = this.grunt
  var tasks = []

  // --
  var mergeJSONFileOpts = {}
  mergeJSONFileOpts[name] = {
    options: {
      infile: jsonfile
    }
  }

  tasks.push('jsonformat:' + name)

  grunt.config.merge({
    'jsonformat': mergeJSONFileOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.spawnProcess = function(name, cmd, opts) {

  var grunt = this.grunt
  var tasks = []

  // --
  var spawnProcessOpts = {}
  spawnProcessOpts[name] = {
    options: opts,
    command: cmd
  }

  tasks.push('spawn-process:' + name)

  grunt.config.merge({
    'spawn-process': spawnProcessOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.getGitConfig = function(name, gitentry, gruntvar, global) {

  var grunt = this.grunt
  var tasks = []

  // --
  var getGitConfigOpts = {}
  getGitConfigOpts[name] = {
    'options': {
      entry: gitentry,
      save_to: gruntvar,
      global: !!global
    }
  }

  tasks.push('getgitconfig:' + name)

  grunt.config.merge({
    'getgitconfig': getGitConfigOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.gitInit = function(name, opts) {

  var grunt = this.grunt
  var tasks = []

  // --
  var gitInitOpts = {}
  gitInitOpts[name] = {
    'options': opts || {}
  }

  tasks.push('gitinit:'+name)

  grunt.config.merge({
    'gitinit': gitInitOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.gitAdd = function(name, files, opts) {

  var grunt = this.grunt
  var tasks = []

  // --
  var gitAddOpts = {}
  gitAddOpts[name] = {
    'options': opts || {},
    files: files
  }

  tasks.push('gitadd:'+name)

  grunt.config.merge({
    'gitadd': gitAddOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.gitCommit = function(name, msg, opts) {

  var grunt = this.grunt
  var tasks = []

  // --
  var gitCommitOpts = {}
  gitCommitOpts[name] = {
    'options': opts || {}
  }
  gitCommitOpts[name].options.message = grunt.config.get(msg)

  tasks.push('gitcommit:'+name)

  grunt.config.merge({
    'gitcommit': gitCommitOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.gitPush = function(name, opts) {

  var grunt = this.grunt
  var tasks = []

  // --
  var gitPushOpts = {}
  gitPushOpts[name] = {
    'options': opts || {}
  }

  tasks.push('gitpush:'+name)

  grunt.config.merge({
    'gitpush': gitPushOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.gitGlobalExcludesFile = function(name, opts) {

  var grunt = this.grunt
  var tasks = []

  // --
  var gitGlobalExcludesFileOpts = {}
  gitGlobalExcludesFileOpts[name] = {
    'options': opts || {}
  }

  tasks.push('gitglobalexcludesfile:'+name)

  grunt.config.merge({
    'gitglobalexcludesfile': gitGlobalExcludesFileOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.ensureGitExcludes = function(name, excludes, global) {

  var grunt = this.grunt
  var tasks = []

  // --
  var ensureGitExcludesOpts = {}
  ensureGitExcludesOpts[name] = {
    'options': {
      excludes: excludes || [],
      global : !!global
    }
  }

  tasks.push('ensuregitexclude:'+name)

  grunt.config.merge({
    'ensuregitexclude': ensureGitExcludesOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.npmInstall = function(name, pkgs, mode) {

  var grunt = this.grunt
  var tasks = []

  // --
  var npmInstallOpts = {}
  npmInstallOpts[name] = {
    'options': {
      pkgs: _.isString(pkgs)
        ? grunt.config.get(pkgs)
        : pkgs,
      mode: mode || 'save-dev'
    }
  }
  tasks.push('npminstall:'+name)

  grunt.config.merge({
    'npminstall': npmInstallOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.editFile = function(name, file, editor) {

  var grunt = this.grunt
  var tasks = []

  // --
  var editorOpts = {}
  editorOpts[name] = {
    'options': {
      file: file,
      editor: editor || null
    }
  }
  tasks.push('edit:'+name)

  grunt.config.merge({
    'edit': editorOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}
TasksHelper.prototype.multiLineInput = function(name, question, save_to, refine, editor) {

  var grunt = this.grunt
  var tasks = []

  var tempFile = temp.path({suffix: '.mutiline'})
  fs.writeFileSync(tempFile, '# '+question+'\n\n')

  // --
  var editorOpts = {}
  editorOpts[name] = {
    'options': {
      file: tempFile,
      editor: editor || null
    }
  }
  tasks.push('edit:'+name)
  // --
  var readfiletoconfigOpts = {}
  readfiletoconfigOpts[name] = {
    'options': {
      file: tempFile,
      save_to: save_to || 'run.multiline.' + name,
      exclude: /^\s*#/,
      refine: refine
    }
  }
  tasks.push('readfiletoconfig:'+name)

  grunt.config.merge({
    'edit': editorOpts,
    'readfiletoconfig': readfiletoconfigOpts
  })
  this.tasks.push({
    name:name,
    tasks: tasks
  })

  return this;
}

module.exports = TasksHelper;
