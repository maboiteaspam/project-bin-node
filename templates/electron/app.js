#!/usr/bin/env electron

var app = require('app')
var BrowserWindow = require('browser-window')
var path = require('path')

var win
var link
var ready = false

var frame = process.platform === 'win32'

app.on('ready', function () {
  win = new BrowserWindow({
    title: 'playback',
    width: 860,
    height: 470,
    frame: frame,
    show: false
  })

  win.loadUrl('file://' + path.join(__dirname, 'static', 'app', 'index.html#' + JSON.stringify(process.argv.slice(2))))

  win.show()
})

var menubar = require('menubar');
var mb = menubar({dir: path.join(__dirname, 'static', 'menubar')});
mb.on('ready', function ready () {
  console.log('app is ready')
})
