const serialport = require('serialport');
const SerialPort = serialport.SerialPort;
const Promise = require('promise');
const events = require('./events');

var buffer = "";
var port = null;

const types = {
    ECHO: 'e',
    GET_VERSION: 'v',
    GET_ROLE: 'r',
    GET_REMOTE_VERSION: 'w',
    GET_REMOTE_ROLE: 's',
    GET_CHANNEL: 'c',
    SET_CHANNEL: 'C',
    GET_START_STATE: 't',
    SET_START_STATE: 'T',
    GET_MAX_VELOCITY: 'm',
    SET_MAX_VELOCITY: 'M',
    GET_ACCEL: 'a',
    SET_ACCEL: 'A',
    GET_Z_MAX_VELOCITY: 'n',
    SET_Z_MAX_VELOCITY: 'N',
    GET_Z_ACCEL: 'b',
    SET_Z_ACCEL: 'B',
    GET_POT: 'p',
    GET_ENCODER: 'e',
};

const lineTest = /^([^\n]*)\n/;

const connect = (p) => {
    port = new SerialPort(p.comName, {
        baudRate: 57600
    });

    port.on('open', (err) => {
        if (err) {
            throw err;
        }

        events.emit("SERIAL_PORT_OPEN");

        port.on('data', data => {
            buffer += data;

            var match;
            while (match = lineTest.exec(buffer)) {
                console.log(match[1]);

                var outputVar = /([a-zA-Z])=([0-9]+)/;

                if (outputVar.test(match[1])) {
                    var ms = outputVar.exec(match[1]);
                    var k = ms[1];
                    var v = ms[2];

                    events.emit("RESPONSE_OUTPUT:" + k, v);
                }

                buffer = buffer.slice(match[0].length);
            }
        });

    });

    port.on("error", (err) => {
        if (err) {
            port = null;
            throw err;
        }

        console.log("port error")
    });
};

var interval = setInterval(() => {
    serialport.list((e, ports) => {
        if (e) throw e;
        var arduinos = ports.filter(p => /VID_2341.*PID_8036/i.test(p.pnpId));

        if (arduinos.length == 1) {
            if (!port) {
                connect(arduinos[0]);
            }
        } else if (arduinos.length > 1) {
            console.log("More than one arduino plugged in");
        } else {
            if (port) {
                port.close();
                port = null;
                events.emit("SERIAL_PORT_CLOSE");
            }
        }
    });
}, 1000);

module.exports = {
    getPort: () => port,

    _getApiPromise(key, callback) {
        return new Promise((ok, err) => {
            this.command(key);
            setTimeout(() => err("timeout"), 100);
            events.once(`RESPONSE_OUTPUT:${key}`, (v) => {
                ok(callback(v));
            });
        });
    },

    setStartInCal(val) {
        this.command(`${types.SET_START_STATE} ${val ? "1" : "0"}`);
    },

    getStartInCal() {
        return this._getApiPromise(types.GET_START_STATE, v => (v === "0") ? false : true);
    },

    setMaxSpeed(val) {
        this.command(`${types.SET_MAX_VELOCITY} ${val}`);
    },

    getMaxSpeed() {
        return this._getApiPromise(types.GET_MAX_VELOCITY, v => parseInt(v));
    },

    setAccel(val) {
        this.command(`${types.SET_ACCEL} ${val}`);
    },

    getAccel() {
        return this._getApiPromise(types.GET_ACCEL, v => parseInt(v));
    },

    command(cmd) {
        if (port) {
            console.log(cmd);
            port.write(cmd + '\n', (err, results) => {
                if (err) throw err;
            });
        }
    },

    types
}
