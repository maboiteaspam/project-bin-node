
// server app for <%= projectName %> by <%= node.author %>

var pkg = require('package.json');
var app = require('app');
var BrowserWindow = require('browser-window');

app.on('ready', function(){
  // starts here
  var mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });
  mainWindow.loadUrl('file://' + __dirname + 'public/index.html')
});
