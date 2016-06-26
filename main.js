'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');
const https = require('https');

var mainWindow;

var sp = require('serialport');

function listPorts() {
  sp.list(function(err, ports) {
    if (err) {
      console.error('Error listing ports', err);
    } else {
      ports.forEach(function(port) {
        console.log(port.comName + '\t' + (port.pnpId || '') + '\t' + (port.manufacturer || ''));
      });
    }
  });
};

listPorts();
console.log(process.version);

const createWindow = function () {
  mainWindow = new BrowserWindow({
      width: 770,
      height: 550,
      resizable: false,
      autoHideMenuBar: true,
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
