
var _ = require('underscore')

var TasksWorkflow = function (){
  var self = this
  if (!(self instanceof TasksWorkflow)) return new TasksWorkflow()
  this.tasks = [];
}

TasksWorkflow.createTask = function(task, target, options, config){
  return {
    name: task,
    target: target,
    options: options,
    config: config,
    fqtt: function (){
      return this.name + (this.target?':'+this.target:'')
    }
  }
}

TasksWorkflow.createTaskAlias = function(name, tasks, options, config){
  return {
    name: name,
    tasks: tasks,
    options: options,
    config: config,
    fqtt: function (){
      return this.name + (this.target?':'+this.target:'')
    },
    getTasksName: function(){
      var names = []
      this.tasks.forEach(function(t){names.push(t.fqtt())})
      return names
    }
  }
}

TasksWorkflow.prototype.getTasksName = function (withTasks) {
  var names = []
  this.tasks.forEach(function(t){
    (!withTasks || t.tasks.length>0) && names.push(t.fqtt())
  })
  return names
}

TasksWorkflow.prototype.replaceTask = function (name, newTasks) {
  this.tasks.forEach(function(task){
    if (task.name===name) {
      task.tasks = newTasks
    }
  })
  return this;
}
TasksWorkflow.prototype.skipTask = function (name, onlyIf) {
  if (onlyIf) {
    var i = -1
    this.tasks.forEach(function(task){
      if (task.name===name) {
        task.tasks = []
      }
    })
    if (i>-1) {
      var task = this.tasks.splice(i, 1)
    }
  }
  return this;
}
TasksWorkflow.prototype.skipLastTask = function (onlyIf) {
  if (onlyIf) {
    this.tasks.pop()
  }
  return this;
}
TasksWorkflow.prototype.skipAll = function (onlyIf) {
  if (onlyIf) {
    this.tasks = []
  }
  return this;
}
TasksWorkflow.prototype.appendTask = function (task) {
  if (!_.isArray(task)) task = [task]
  var that = this
  task.forEach(function(t){
    if (!t.fqtt) {
      t = TasksWorkflow.createTask(t.name, t.target, t.options, t.config)
    }
    //if (!t.tasks) t.tasks = []
    if (!t.options) t.options = {}
    if (!t.config) t.config = {}
    that.tasks.push(t)
  })
  return this;
}

TasksWorkflow.prototype.packToTask = function (name, description) {
  var tasks = [].concat(this.tasks)
  var g = {
    global: {descriptions: {}}
  }
  g.global.descriptions[name] = description || 'description not provided.';
  this.tasks = [TasksWorkflow.createTaskAlias(name, tasks, {}, g)]
  return this;
}
TasksWorkflow.prototype.appendTo = function (workflow) {
  this.tasks.forEach(function(task){
    workflow.appendTask(task)
  })
  return this;
}

TasksWorkflow.prototype.configureGrunt = function (grunt) {
  this.tasks.forEach(function(task){
    (task.tasks || []).forEach(function(t){
      var options = {};
      if (t.target && t.options && !t.options[t.name]) {
        options[t.name] = {};
        options[t.name][t.target] = t.options;
      } else {
        options = t.options
      }
      grunt.config.merge(options)
      grunt.config.merge(t.config)
    })
    var options = {};
    if (task.target && task.options && !task.options[task.name]) {
      options[task.name] = {};
      options[task.name][task.target] = task.options;
    } else {
      options = task.options
    }
    grunt.config.merge(options)
    grunt.config.merge(task.config)
  })
  return this;
};

TasksWorkflow.prototype.registerTo = function (grunt, mainTask) {
  this.configureGrunt(grunt)
  this.tasks.forEach(function(task){
    var taskNames = task.getTasksName()
    if (taskNames.length) {
      grunt.registerTask(task.name, taskNames)
    }
  })
  grunt.registerTask(mainTask, this.getTasksName(true))
  return this;
};

module.exports = TasksWorkflow;
