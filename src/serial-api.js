const serialport = require('serialport');
const events = require('./events');
const config = require('./config');
const cconsole = require('./cconsole');
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

const NAME_MAX_LENGTH = 20;

const ledStates = {
    OFF: 0,
    ON: 1,
    TOGGLE: 2,
};

const leds = {
    PAW_BUTTON_1: 3,  // Red LED
    PAW_BUTTON_2: 5,  // Amber #1 LED
    PAW_BUTTON_3: 6,  // Green LED
    PAW_BUTTON_4: 9,  // Green LED
};

const types = {
    ECHO: 'e', 'e': 'ECHO',
    GET_VERSION: 'v', 'v': 'GET_VERSION',
    GET_ROLE: 'r', 'r': 'GET_ROLE',
    GET_REMOTE_VERSION: 'w', 'w': 'GET_REMOTE_VERSION',
    GET_REMOTE_ROLE: 's', 's': 'GET_REMOTE_ROLE',
    GET_PRESET_INDEX: 'q', 'q': 'GET_PRESET_INDEX',
    SET_PRESET_INDEX: 'Q', 'Q': 'SET_PRESET_INDEX',
    GET_ID: 'i', 'i': 'GET_ID',
    SET_ID: 'I', 'I': 'SET_ID',
    GET_NAME: 'n', 'n': 'GET_NAME',
    SET_NAME: 'N', 'N': 'SET_NAME',
    GET_CHANNEL: 'c', 'c': 'GET_CHANNEL',
    SET_CHANNEL: 'C', 'C': 'SET_CHANNEL',
    GET_REMOTE_CHANNEL: 'd', 'd': 'GET_REMOTE_CHANNEL',
    SET_REMOTE_CHANNEL: 'D', 'D': 'SET_REMOTE_CHANNEL',
    GET_START_STATE: 't', 't': 'GET_START_STATE',
    SET_START_STATE: 'T', 'T': 'SET_START_STATE',
    GET_MAX_VELOCITY: 'm', 'm': 'GET_MAX_VELOCITY',
    SET_MAX_VELOCITY: 'M', 'M': 'SET_MAX_VELOCITY',
    GET_ACCEL: 'a', 'a': 'GET_ACCEL',
    SET_ACCEL: 'A', 'A': 'SET_ACCEL',
    GET_Z_ACCEL: 'b', 'b': 'GET_Z_ACCEL',
    SET_Z_ACCEL: 'B', 'B': 'SET_Z_ACCEL',
    GET_POT: 'p', 'p': 'GET_POT',
    GET_ENCODER: 'e', 'e': 'GET_ENCODER',
    SAVE_CONFIGS: 'u', 'u': 'SAVE_CONFIGS',
    RELOAD_CONFIGS: 'x', 'x': 'RELOAD_CONFIGS',
    EXPORT_EEPROM: 'g', 'g': 'EXPORT_EEPROM',
    IMPORT_EEPROM: 'G', 'G': 'IMPORT_EEPROM',
    GET_LED: 'l', 'l': 'GET_LED',
    INVALID_COMMAND: '`', '`': 'INVALID_COMMAND',
};

const DEFAULT_ID_SEED = 0xcafe;

const lineTest = /^([^\n]*)\n/;

var verboseLogging = true;

const connect = (p) => {
    port = new serialport(p.comName, {
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
                var line = match[1];
                var okResponse = /([a-zA-Z]) OK/;
                var outputVar = /([a-zA-Z])=(.*)/;
                var error = /ERR /;

                if (okResponse.test(line)) {
                    var ms = okResponse.exec(line);
                    var k = ms[1];

                    verboseLogging && cconsole.log("out", `${types[k] || k} OK`);

                    events.emit(events.RESPONSE_OK(k));
                } else if (outputVar.test(line)) {
                    var ms = outputVar.exec(line);
                    var k = ms[1];
                    var v = ms[2];

                    verboseLogging && cconsole.log("out", `${types[k] || k}=${v}`);

                    events.emit(events.RESPONSE_OUTPUT(k), v);
                } else if (error.test(line)) {
                    throw new Error(`Device returned "${line}"`);
                }

                buffer = buffer.slice(match[0].length);
            }

            if (buffer.length && verboseLogging) {
                cconsole.log("raw", data.toString());
            }
        });

    });

    port.on("error", (err) => {
        if (err) {
            port = null;

            throw err;
        }

        cconsole.log("err",`port error: ${err}`)
    });
};

var interval = null;

module.exports = {
    getPort: () => port,

    async _getApiPromise(key, callback) {
        return new Promise((ok, err) => {
            this.command(key);

            const cb = (v) => {
                ok(callback(v));
            };

            events.once(events.RESPONSE_OUTPUT(key), cb);
            setTimeout(() => {
                events.off(events.RESPONSE_OUTPUT(key), cb);
                err(new Error(`timeout on key:${types[key] || key}`));
            }, 400);
        });
    },

    _getApiPromiseWithVal(key, val, callback) {
        return new Promise((ok, err) => {
            this.command(key + " " + val);

            const cb = (v) => {
                ok(callback(v));
            };

            events.once(events.RESPONSE_OUTPUT(key), cb);
            setTimeout(() => {
                events.off(events.RESPONSE_OUTPUT(key), cb);
                err(new Error(`timeout on key:${types[key] || key}`));
            }, 400);
        });
    },

    _getApiOkPromise(key) {
        return new Promise((ok, err) => {
            this.command(key);

            const cb = (v) => {
                ok(v);
            };

            events.once(events.RESPONSE_OK(key[0]), cb);
            setTimeout(() => {
                events.off(events.RESPONSE_OK(key[0]), cb);
                err(new Error(`timeout on key:${types[key[0]] || key[0]}`));
            }, 400);
        });
    },

    _getApiOkPromiseWithVal(key, val) {
        return new Promise((ok, err) => {
            this.command(key + " " + val);

            const cb = (v) => {
                ok(v);
            };

            events.once(events.RESPONSE_OK(key[0]), cb);
            setTimeout(() => {
                events.off(events.RESPONSE_OK(key[0]), cb);
                err(new Error(`timeout on key:${types[key[0]] || key[0]}`));
            }, 400);
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
                    cconsole.log("err", "More than one arduino plugged in");
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
        return this._getApiOkPromiseWithVal(types.SET_START_STATE, val ? "1" : "0");
    },

    getStartInCal() {
        return this._getApiPromise(types.GET_START_STATE,
            v => (v === "0") ? false : true);
    },

    setMaxSpeed(val) {
        return this._getApiOkPromiseWithVal(types.SET_MAX_VELOCITY, val);
    },

    getMaxSpeed() {
        return this._getApiPromise(types.GET_MAX_VELOCITY, v => parseInt(v));
    },

    setPresetIndex(val) {
        return this._getApiOkPromiseWithVal(types.SET_PRESET_INDEX, val);
    },

    getPresetIndex() {
        return this._getApiPromise(types.GET_PRESET_INDEX, v => parseInt(v));
    },

    setId(val) {
        return this._getApiOkPromiseWithVal(types.SET_ID, val);
    },

    getId() {
        return this._getApiPromise(types.GET_ID, v => parseInt(v));
    },

    setName(val) {
        if (val.length > NAME_MAX_LENGTH) {
            throw new Error("Tried to set a name that was too long.");
        }
        return this._getApiOkPromiseWithVal(types.SET_NAME, val);
    },

    getName() {
        return this._getApiPromise(types.GET_NAME, v => v);
    },

    setChannel(val) {
        return this._getApiOkPromiseWithVal(types.SET_CHANNEL, val);
    },

    getChannel() {
        return this._getApiPromise(types.GET_CHANNEL, v => parseInt(v));
    },

    setAccel(val) {
        return this._getApiOkPromiseWithVal(types.SET_ACCEL, val);
    },

    getAccel() {
        return this._getApiPromise(types.GET_ACCEL, v => parseInt(v));
    },

    saveConfigs() {
        return this._getApiOkPromise(types.SAVE_CONFIGS);
    },

    async exportEeprom() {
        const identity = x => x;

        let start = 0;
        let buffer = "";
        let response = await this._getApiPromiseWithVal(types.EXPORT_EEPROM, start, identity);

        while (response.length) {
            start += response.length / 2;
            buffer += v;

            response = await this._getApiPromiseWithVal(types.EXPORT_EEPROM, start, identity);
        }

        return response;
    },

    importEeprom(val) {
        const scanLength = 16;
        var start = 0;
        var handler = () => {
            var hexStart = start * 2;
            var hexEnd = hexStart + (scanLength * 2);
            var slice = val.slice(hexStart, hexEnd);
            if (slice.length) {
                var payload = `${start} ${slice.length / 2} ${slice}`;
                start += slice.length / 2;
                return this._getApiOkPromiseWithVal(types.IMPORT_EEPROM, payload)
                    .then(handler);
            }
        };

        return handler();
    },

    reloadConfigs() {
        return this._getApiOkPromise(types.RELOAD_CONFIGS);
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

    async getRxrVersion() {
        try {
            const role = await this.getRole();

            if (role === "DOGBONE") {
                return await this._getApiPromise(types.GET_VERSION, v => v);
            } else if (role === "PAW") {
                return await this._getApiPromise(types.GET_REMOTE_VERSION, v => v);
            } else {
                return "0.0";
            }
        } catch (e) {
            return "0.0";
        }
    },

    async getTxrVersion() {
        try {
            const role = await this.getRole();

            if (role === "PAW") {
                return await this._getApiPromise(types.GET_VERSION, v => v);
            } else if (role === "DOGBONE") {
                return await this._getApiPromise(types.GET_REMOTE_VERSION, v => v);
            } else {
                return "0.0";
            }
        } catch (e) {
            return "0.0";
        }
    },

    turnVerboseLoggingOn() {
        verboseLogging = true;
    },

    command(cmd) {
        if (port) {
            cconsole.log("cmd", (types[cmd] || cmd));

            port.write(cmd + '\n', (err, results) => {
                if (err) throw err;
            });
        }
    },

    flashBoard(url, progressMonitor) {
        var filepath = remoteFileApi.getFilepathForUrl(url);

        var avrgirl = new Avrgirl({
            board: 'leonardo',
            port: port.comName,
            debug: msg => console.log(msg),
        });
        port.close();
        port = null;

        return new Promise((ok,err) => {
            avrgirl.flash(filepath, e => {
                if (e) {
                    err(e);
                } else {
                    if (url.startsWith("local-")) {
                        remoteFileApi.clearLocalBuild();
                    }
                    ok();
                }
            });
        });
    },

    types,

    ledStates,

    leds,
}
