
var TasksWorkflow = require('grunt2bin/lib/tasks-workflow.js')
var file = {};

file.appendToFile = function(name, file, content) {
  return TasksWorkflow.createTask('writefile', name, {
    'options': {
      file: file,
      mode: 'append',
      content: content
    }
  })
}
file.prependToFile = function(name, file, content) {
  return TasksWorkflow.createTask('writefile', name, {
    'options': {
      file: file,
      mode: 'prepend',
      content: content
    }
  })
}
file.writeFile = function(name, file, content) {
  return TasksWorkflow.createTask('writefile', name, {
    'options': {
      file: file,
      mode: 'replace',
      force: true,
      content: content
    }
  })
}
file.mergeJSONFile = function(name, jsonfile, data) {
  return TasksWorkflow.createTask('merge-jsonfile', name, {
    options: {
      file: jsonfile,
      data: data
    }
  })
}
file.jsonFormat = function(name, jsonfile) {
  return TasksWorkflow.createTask('jsonformat', name, {
    options: {
      infile: jsonfile
    }
  })
}

module.exports = file;
