
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