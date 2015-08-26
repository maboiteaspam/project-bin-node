
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')
var tasksUtils = require('./tasks-utils-helper.js');

var helper = {}
helper.getConfig = function(name, gitentry, gruntvar, global) {
  var targetOpts = {
    'options': {
      entry: gitentry,
      save_to: gruntvar,
      global: !!global
    }
  }
  return TasksWorkflow.createTask('getgitconfig', name, targetOpts)
}
helper.init = function(name, opts) {
  return TasksWorkflow.createTask('gitinit', name, {options: opts || {}})
}
helper.add = function(name, files, opts) {
  var targetOpts = {
    'options': opts || {},
    files: {
      src: files
    }
  }
  return TasksWorkflow.createTask('gitadd', name, targetOpts)
}
helper.commit = function(name, msg, opts) {
  opts = opts || {}
  opts.message = msg;
  return TasksWorkflow.createTask('gitcommit', name, {
    'options': opts
  })
}
helper.push = function(name, opts) {
  return TasksWorkflow.createTask('gitpush', name, {
    'options': opts || {}
  })
}
helper.tag = function(name, opts) {
  return TasksWorkflow.createTask('gittag', name, {
    'options': opts || {}
  })
}
helper.checkout = function(name, opts) {
  return TasksWorkflow.createTask('gitcheckout', name, {
    'options': opts || {}
  })
}
helper.fetch = function(name, opts) {
  return TasksWorkflow.createTask('gitfetch', name, {
    'options': opts || {}
  })
}
helper.pull = function(name, opts) {
  return TasksWorkflow.createTask('gitpull', name, {
    'options': opts || {}
  })
}
helper.globalExcludesFile = function(name, opts) {
  return TasksWorkflow.createTask('gitglobalexcludesfile', name, {
    'options': opts || {}
  })
}
helper.ensureExcludes = function(name, excludes, global) {
  return TasksWorkflow.createTask('ensuregitexclude', name, {
    'options': {
      excludes: excludes || [],
      global : !!global
    }
  })
}
helper.getStatus = function(name, saveTo) {
  return tasksUtils
    .spawnProcess(name, 'git status', {
      failOnError:true,
      saveTo: saveTo || 'global.run.git_status'
    });
}
helper.addOrigin = function(name, remote) {
  return tasksUtils
    .spawnProcess(name, 'git remote add origin ' + remote, {
      failOnError:true
    });
}
helper.setOrigin = function(name, remote) {
  return tasksUtils
    .spawnProcess(name, 'git remote set-url origin ' + remote, {
      failOnError:true
    });
}
helper.setUpstream = function(name, branch) {
  branch = branch || 'master'
  return tasksUtils
    .spawnProcess(name, 'git branch --set-upstream-to origin/' + branch, {
      failOnError:true
    });
}


module.exports = helper;
