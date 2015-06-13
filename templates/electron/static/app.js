
// client app for <%= projectName %> by <%= node.author %>

document.write('The current version of node is ' + process.version );

var fs = require('fs');

var contents = fs.readFileSync(__dirname + '/../package.json', 'utf8');
alert(contents);
