const serialport = require('serialport');
const SerialPort = serialport.SerialPort;
const events = require('./events');
const config = require('./config');
const https = require('https');
const fs = require('fs');
const path = require('path');
const Avrgirl = require('avrgirl-arduino');

var buffer = "";
var port = null;

const roles = {
    PAW: 0,
    DOGBONE: 1,
};

const types = {
    ECHO: 'e',
    GET_VERSION: 'v',
    GET_ROLE: 'r',
    GET_REMOTE_VERSION: 'w',
    GET_REMOTE_ROLE: 's',
    GET_CHANNEL: 'c',
    GET_REMOTE_CHANNEL: 'd',
    SET_REMOTE_CHANNEL: 'D',
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
    SAVE_CONFIGS: 'u',
    INVALID_COMMAND: '`',
};

const lineTest = /^([^\n]*)\n/;

const connect = (p) => {
    port = new SerialPort(p.comName, {
        baudRate: 9600
    });

    port.on('open', (err) => {
        if (err) {
            throw err;
        }

        events.emit(events.SERIAL_PORT_OPEN);

        port.on('data', data => {
            buffer += data;

            var match;
            while (match = lineTest.exec(buffer)) {
                var outputVar = /([a-zA-Z])=(.+)/;
                var error = /ERR /;

                if (outputVar.test(match[1])) {
                    var ms = outputVar.exec(match[1]);
                    var k = ms[1];
                    var v = ms[2];

                    events.emit(events.RESPONSE_OUTPUT(k), v);
                } else if (error.test(match[1])) {
                    throw new Error(`Device returned "${match[1]}"`);
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

        console.log(`port error: ${err}`)
    });
};

var interval = null;

module.exports = {
    getPort: () => port,

    _getApiPromise(key, callback) {
        return new Promise((ok, err) => {
            this.command(key);

            const cb = (v) => {
                ok(callback(v));
            };

            events.once(`RESPONSE_OUTPUT:${key}`, cb);
            setTimeout(() => {
                events.off(`RESPONSE_OUTPUT:${key}`, cb);
                err(new Error(`timeout on key:${key}`));
            }, 100);
        });
    },

    disableAutoConnect() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    },

    enableAutoConnect() {
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(() => {
            serialport.list((e, ports) => {
                if (!ports) throw e;
                var arduinos = ports.filter(p =>
                    /VID_2341.*PID_8036/i.test(p.pnpId) ||
                    (/2341/i.test(p.vendorId) && /8036/i.test(p.productId)));
                if (arduinos.length == 1) {
                    if (!port) {
                        connect(arduinos[0]);
                    }
                } else if (arduinos.length > 1) {
                    console.log("More than one arduino plugged in");
                } else {
                    if (port) {
                        try {
                            port.close();
                        } catch (e) {
                        }
                        port = null;
                        events.emit(events.SERIAL_PORT_CLOSE);
                    }
                }
            });
        }, 1000);
    },

    closePort() {
        port.close();
        port = null;
    },

    setStartInCal(val) {
        this.command(`${types.SET_START_STATE} ${val ? "1" : "0"}`);
    },

    getStartInCal() {
        return this._getApiPromise(types.GET_START_STATE,
            v => (v === "0") ? false : true);
    },

    setMaxSpeed(val) {
        this.command(`${types.SET_MAX_VELOCITY} ${val}`);
    },

    getMaxSpeed() {
        return this._getApiPromise(types.GET_MAX_VELOCITY, v => parseInt(v));
    },

    getChannel() {
        return this._getApiPromise(types.GET_CHANNEL, v => parseInt(v));
    },

    setAccel(val) {
        this.command(`${types.SET_ACCEL} ${val}`);
    },

    setChannel(val) {
        this.command(`${types.SET_CHANNEL} ${val}`);
    },

    getAccel() {
        return this._getApiPromise(types.GET_ACCEL, v => parseInt(v));
    },

    saveConfigs() {
        this.command(types.SAVE_CONFIGS);
    },

    getRole() {
        return this._getApiPromise(types.GET_ROLE, r => {
            var parsed = parseInt(r);
            if (parsed === 0) {
                return "PAW";
            } else if (parsed === 1) {
                return "DOGBONE";
            } else {
                return "UNKNOWN";
            }
        });
    },

    getRxrVersion() {
        return this.getRole().then(
        role => {
            if (role === "DOGBONE") {
                return this._getApiPromise(types.GET_VERSION, v => v);
            } else if (role === "PAW") {
                return this._getApiPromise(types.GET_REMOTE_VERSION, v => v);
            } else {
                return new Promise((ok, err) => {
                    ok("0.0");
                });
            }
        }, err => {
            return new Promise((ok, err) => {
                ok("0.0");
            });
        });
    },

    getTxrVersion() {
        return this.getRole().then(
        role => {
            if (role === "PAW") {
                return this._getApiPromise(types.GET_VERSION, v => v);
            } else if (role === "DOGBONE") {
                return this._getApiPromise(types.GET_REMOTE_VERSION, v => v);
            } else {
                return new Promise((ok, err) => {
                    ok("0.0");
                });
            }
        }, err => {
            return new Promise((ok, err) => {
                ok("0.0");
            });
        });
    },

    command(cmd) {
        if (port) {
            console.log("cmd: " + cmd);

            port.write(cmd + '\n', (err, results) => {
                if (err) throw err;
            });
        }
    },

    flashBoard(url, progressMonitor) {
        var parsed = path.parse(url);
        var filepath = './downloads/' + parsed.base;

        var avrgirl = new Avrgirl({
            board: 'leonardo',
            port: port.comName,
            debug: true,
        });
        port.close();
        port = null;

        return new Promise((ok,err) => {
            avrgirl.flash(filepath, e => {
                if (e) {
                    err(e);
                } else {
                    ok();
                }
            });
        });
    },

    types
}
