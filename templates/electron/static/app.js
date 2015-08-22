
// client app for electron-test by <%= author %>


// #region work with jquery and the local resources
var fs = require('fs');
var contents = fs.readFileSync(__dirname + '/../package.json', 'utf8');
var content = JSON.stringify(contents, null, 4).replace(/\\n/g,'\n').replace(/\\"/g, '"')
$("<pre></pre>").text(content).appendTo('body')

$(".welcome").text('The current version of node is ' + process.version )
// #endregion




// #region platform
$('html').addClass('platform-'+process.platform)
// #endregion


// #region full screen
var ipc = require('ipc');
var titlebar = require('titlebar')()
titlebar.appendTo('#titlebar')
var isFullscreen = false

var onfullscreentoggle = function (e) {
  if (isFullscreen) {
    isFullscreen = false
    $('#titlebar').show()
    ipc.send('exit-full-screen')
  } else {
    isFullscreen = true
    $('#titlebar').hide()
    ipc.send('enter-full-screen')
  }
}
titlebar.on('close', function () {
  ipc.send('close')
})

titlebar.on('minimize', function () {
  ipc.send('minimize')
})

titlebar.on('maximize', function () {
  ipc.send('maximize')
})

titlebar.on('fullscreen', onfullscreentoggle)
// #endregion


