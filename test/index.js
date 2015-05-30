require('should');
var path = require('path-extra');
var fs = require('fs-extra');
var spawn = require('child-process').spawn;

var fixturePath = path.join(__dirname, 'test', 'fixture');

before(function(then){
  fs.mkdirs(fixturePath, function(){
    then();
  })
});

describe('project-bin-node testing', function(){
  this.timeout(100000);
  it('should work', function(then){
    var binPath = path.join(__dirname, '..', 'index.js');
    spawn('node', [binPath, '-p', fixturePath], function(){
      then();
    });
  })
});