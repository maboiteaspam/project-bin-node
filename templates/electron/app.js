#!/usr/bin/env electron

var pkg = require('./package.json')
var app = require('app')
var BrowserWindow = require('browser-window')
var path = require('path')
var ipc = require('ipc')

var win
var ready = false

var frame = process.platform === 'win32'

// #region app init
app.on('ready', function () {
  ready = true
  win = new BrowserWindow({
    title: pkg.name + '@' + pkg.version,
    width: 860,
    height: 470,
    frame: frame,
    show: false
  })

  win.loadUrl('file://' + path.join(__dirname, 'static', 'app', 'index.html#' + JSON.stringify(process.argv.slice(2))))

  win.show()
})
// #endregion

// #region shortcut
app.on('ready', function () {

  var globalShortcut = require('global-shortcut');

  if (!globalShortcut.register('F12', function() {
      console.error('F12 is pressed');
      win.toggleDevTools();
    })) {
    console.error('registration failed');
  }

  if (!globalShortcut.register('F5', function() {
      console.error('F5 is pressed');
      win.reload();
    })) {
    console.error('registration failed');
  }

  app.on('quit', function(){
    globalShortcut.unregisterAll();
  })

})
// #endregion


// #region titlebar
app.on('ready', function () {
  ipc.on('close', function () {
    app.quit()
  })

  ipc.on('open-file-dialog', function () {
    var files = dialog.showOpenDialog({ properties: [ 'openFile', 'multiSelections' ]})
    if (files) win.send('add-to-playlist', files)
  })

  ipc.on('focus', function () {
    win.focus()
  })

  ipc.on('minimize', function () {
    win.minimize()
  })

  ipc.on('maximize', function () {
    win.maximize()
  })

  ipc.on('resize', function (e, message) {
    if (win.isMaximized()) return
    var wid = win.getSize()[0]
    var hei = (wid / message.ratio) | 0
    win.setSize(wid, hei)
  })

  ipc.on('enter-full-screen', function () {
    win.setFullScreen(true)
  })

  ipc.on('exit-full-screen', function () {
    win.setFullScreen(false)
    win.show()
  })

})
// #endregion
