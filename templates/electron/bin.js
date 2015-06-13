#!/usr/bin/env node

var electron = require('electron-prebuilt')
var proc = require('child_process')

// will something similar to print /Users/maf/.../Electron
console.log(electron)

// spawn electron
var pkg = require('./package.json')
var child = proc.spawn(electron, [pkg.main || 'app.js'], {stdio:'inherit'})
