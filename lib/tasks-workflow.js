
var TasksWorkflow = function (){
  var self = this
  if (!(self instanceof TasksWorkflow)) return new TasksWorkflow()
  this.tasks = [];
}
TasksWorkflow.prototype.replaceTask = function (name, newTasks, newConfig) {
  this.tasks.forEach(function(task){
    if (task.name===name) {
      task.tasks = newTasks
      task.config = newConfig
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
//TasksWorkflow.prototype.registerTask = function (task, target, opts) {
//  var gruntconfig = {}
//  gruntconfig[task] = {}
//  gruntconfig[task][target] = opts
//  return this.appendTask({
//    name: task + ':' + target,
//    config: gruntconfig,
//    tasks: []
//  });
//}
TasksWorkflow.prototype.appendTask = function (task) {
  if (!task.length&& task.tasks) task = [task]
  task.forEach(function(t){
    if (!t.tasks) t.tasks = []
    if (!t.config) t.config = {}
    if (t.target && t.config && !t.config[t.name]) {
      var c = t.config;
      t.config = {}
      t.config[t.name] = {};
      t.config[t.name][t.target] = c;
    }
  })
  this.tasks = this.tasks.concat(task)
  return this;
}

TasksWorkflow.prototype.packToTask = function (name, description) {
  var tasks = [].concat(this.tasks)
  var g = {
    global: {descriptions: {}}
  }
  g.global.descriptions[name] = description || 'description not provided.';
  this.tasks = [{
    name: name,
    tasks: tasks,
    config: g
  }]
  return this;
}
TasksWorkflow.prototype.appendTo = function (workflow) {
  this.tasks.forEach(function(task){
    workflow.appendTask(task)
  })
  return this;
}

TasksWorkflow.prototype.registerTo = function (grunt, mainTask) {
  var topTasks = []
  this.tasks.forEach(function(task){
    var taskNames = []
    task.tasks.forEach(function(t){
      var name = t.name + (t.target?':'+t.target:'')
      grunt.config.merge(t.config)
      taskNames.push(name)
    })
    grunt.config.merge(task.config)
    if (taskNames.length) {
      grunt.registerTask(task.name, taskNames)
      topTasks.push(task.name)
    }
  })
  grunt.registerTask(mainTask, topTasks)
  return this;
}

module.exports = TasksWorkflow;
