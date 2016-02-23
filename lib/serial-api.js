'use strict';

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var listeners = [];
var buffer = "";
var port = null;
var lineTest = /^([^\n]*)\n/;

serialport.list(function (e, ports) {
    if (e) throw e;
    var leonardos = ports.filter(function (p) {
        return (/VID_2341.*PID_8036/i.test(p.pnpId)
        );
    });

    leonardos.forEach(function (p) {
        port = new SerialPort(p.comName, {
            baudRate: 57600
        });

        port.on('open', function () {
            port.on('data', function (data) {
                buffer += data;

                var match;
                while (match = lineTest.exec(buffer)) {
                    listeners.forEach(function (l) {
                        var m = l.pattern.exec(match[1]);
                        m && l.callback.apply(null, m.slice(1));
                    });

                    buffer = buffer.slice(match[0].length);
                }
            });
        });
    });
});

var bindingKey = 0;
module.exports = {
    getPort: function getPort() {
        return port;
    },

    command: function command(cmd) {
        if (port) {
            port.write(cmd + '\n', function (err, results) {
                if (err) throw err;
            });
        }
    },
    bind: function bind(pattern, callback) {
        listeners.push({ pattern: pattern, callback: callback, key: bindingKey++ });
        return bindingKey;
    },
    unbind: function unbind(key) {
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i].key == key) {
                listeners = listeners.slice(0, i) + listeners.slice(i + 1);
                break;
            }
        }
    }
};