#!/usr/bin/env node
const proc = require('child_process');
const electron = require('electron-prebuilt');
const path = require('path');
const fs = require('fs');

const serverPath = path.join(__dirname, '../index.js');

// spawn electron
proc.spawn(electron, [serverPath]);