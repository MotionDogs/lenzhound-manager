'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path')
const url = require('url')

var mainWindow;

const createWindow = function () {
  let iconExtension = process.platform == 'darwin' ? 'png' : 'ico';

  mainWindow = new BrowserWindow({
      width: 770,
      height: 550,
      resizable: false,
      autoHideMenuBar: true,
      title: "DIG Uploader Pro",
      icon: __dirname + '/content/icon.' + iconExtension,
  });
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

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
