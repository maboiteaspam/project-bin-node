
var tasksFileHelper = {};

tasksFileHelper.ensureGitExcludes = function(name, excludes, global) {
  var ensureGitExcludesOpts = {
    'options': {
      excludes: excludes || [],
      global : !!global
    }
  }
  return [{
    name: 'ensuregitexclude',
    target: name,
    config: ensureGitExcludesOpts
  }];
}

tasksFileHelper.appendToFile = function(name, file, content) {
  var appendToFileOpts = {
    'options': {
      file: file,
      mode: 'append',
      content: content
    }
  }
  return [{
    name: 'writefile',
    target: name,
    config: appendToFileOpts
  }];
}
tasksFileHelper.prependToFile = function(name, file, content) {
  var prependToFileOpts = {
    'options': {
      file: file,
      mode: 'prepend',
      content: content
    }
  }
  return [{
    name: 'writefile',
    target: name,
    config: prependToFileOpts
  }];
}
tasksFileHelper.writeFile = function(name, file, content) {
  var prependToFileOpts = {
    'options': {
      file: file,
      mode: 'replace',
      force: true,
      content: content
    }
  }
  return [{
    name: 'writefile',
    target: name,
    options: prependToFileOpts
  }];
}
tasksFileHelper.mergeJSONFile = function(name, jsonfile, data) {
  var mergeJSONFileOpts = {
    options: {
      file: jsonfile,
      data: data
    }
  }
  return [{
    name: 'merge-jsonfile',
    target: name,
    options: mergeJSONFileOpts
  }];
}
tasksFileHelper.jsonFormat = function(name, jsonfile) {
  var mergeJSONFileOpts = {
    options: {
      infile: jsonfile
    }
  }
  return [{
    name: 'jsonformat',
    target: name,
    options: mergeJSONFileOpts
  }];
}

module.exports = tasksFileHelper;
