
// client app for <%= projectName %> by <%= node.author %>

var fs = require('fs');

var contents = fs.readFileSync(__dirname + '/../package.json', 'utf8');
var content = JSON.stringify(contents, null, 4).replace(/\\n/g,'\n').replace(/\\"/g, '"')
$("<pre></pre>").text(content).appendTo('body')

$(".welcome").text('The current version of node is ' + process.version )
