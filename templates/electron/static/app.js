
// client app for <%= projectName %> by <%= node.author %>

document.write('The current version of node is ' + process.version );

var fs = require('fs');

var contents = fs.readFileSync(__dirname + '/../package.json', 'utf8');
var pre = document.createElement('pre')
pre.innerHTML = JSON.stringify(contents, null, 4)
document.body.appendChild(pre)
