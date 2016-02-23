const serialport = require('serialport');
const SerialPort = serialport.SerialPort;

var listeners = [];
var buffer = "";
var port = null;
const lineTest = /^([^\n]*)\n/;

serialport.list((e, ports) => {
    if (e) throw e;
    var leonardos = ports.filter(p => /VID_2341.*PID_8036/i.test(p.pnpId));

    leonardos.forEach(p => {
        port = new SerialPort(p.comName, {
             baudRate: 57600
         });

        port.on('open', () => {
            port.on('data', data => {
                buffer += data;

                var match;
                while (match = lineTest.exec(buffer)) {
                    listeners.forEach(l => {
                        var m = l.pattern.exec(match[1]);
                        m && l.callback.apply(null, m.slice(1))
                    });

                    buffer = buffer.slice(match[0].length);
                }
            });

        });
    });
});

var bindingKey = 0;
module.exports = {
    getPort: () => port,

    command(cmd) {
        if (port) {
            port.write(cmd + '\n', (err, results) => {
                if (err) throw err;
            });
        }
    },

    bind(pattern, callback) {
        listeners.push({pattern, callback, key: bindingKey++});
        return bindingKey;
    },

    unbind(key) {
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i].key == key) {
                listeners = listeners.slice(0,i) + listeners.slice(i+1);
                break;
            }
        }
    }
}
