'use strict';

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var Promise = require('promise');
var events = require('./events');

var buffer = "";
var port = null;

var types = {
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
    GET_ENCODER: 'e'
};

var lineTest = /^([^\n]*)\n/;

var connect = function connect(p) {
    port = new SerialPort(p.comName, {
        baudRate: 57600
    });

    port.on('open', function (err) {
        if (err) {
            throw err;
        }

        events.emit("SERIAL_PORT_OPEN");

        port.on('data', function (data) {
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

    port.on("error", function (err) {
        if (err) {
            port = null;
            throw err;
        }

        console.log("port error");
    });
};

var interval = setInterval(function () {
    serialport.list(function (e, ports) {
        if (e) throw e;
        var arduinos = ports.filter(function (p) {
            return (/VID_2341.*PID_8036/i.test(p.pnpId)
            );
        });

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
    getPort: function getPort() {
        return port;
    },

    _getApiPromise: function _getApiPromise(key, callback) {
        var _this = this;

        return new Promise(function (ok, err) {
            _this.command(key);
            setTimeout(function () {
                return err("timeout");
            }, 100);
            events.once('RESPONSE_OUTPUT:' + key, function (v) {
                ok(callback(v));
            });
        });
    },
    setStartInCal: function setStartInCal(val) {
        this.command(types.SET_START_STATE + ' ' + (val ? "1" : "0"));
    },
    getStartInCal: function getStartInCal() {
        return this._getApiPromise(types.GET_START_STATE, function (v) {
            return v === "0" ? false : true;
        });
    },
    setMaxSpeed: function setMaxSpeed(val) {
        this.command(types.SET_MAX_VELOCITY + ' ' + val);
    },
    getMaxSpeed: function getMaxSpeed() {
        return this._getApiPromise(types.GET_MAX_VELOCITY, function (v) {
            return parseInt(v);
        });
    },
    setAccel: function setAccel(val) {
        this.command(types.SET_ACCEL + ' ' + val);
    },
    getAccel: function getAccel() {
        return this._getApiPromise(types.GET_ACCEL, function (v) {
            return parseInt(v);
        });
    },
    command: function command(cmd) {
        if (port) {
            console.log(cmd);
            port.write(cmd + '\n', function (err, results) {
                if (err) throw err;
            });
        }
    },

    types: types
};