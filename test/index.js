require('should');
var path = require('path-extra');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;

var fixturePath = path.join(__dirname, 'fixture');

before(function(then){
  fs.mkdirs(fixturePath, function(){
    then();
  });
});

describe('project-bin-node testing', function(){

  beforeEach(function(then){
    fs.emptyDir(fixturePath, function(){
      then();
    });
  });

  this.timeout(100000);
  it('should generate lambda app', function(then){
    var binPath = path.join(__dirname, '..', 'index.js');
    spawn('node', [binPath, '-p', fixturePath],
      {stdio:'inherit'})
      .on('close', function(){
        then();
      });
  });
  it('should generate electron app', function(then){
    var binPath = path.join(__dirname, '..', 'index.js');
    spawn('node', [binPath, '-p', fixturePath, '-l', 'electron'],
      {stdio:'inherit'})
      .on('close', function(){
        then();
      });
  });
});