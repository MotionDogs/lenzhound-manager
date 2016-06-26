const serialport = require('serialport');
const SerialPort = serialport.SerialPort;
const Promise = require('promise');
const events = require('./events');
const config = require('./config');
const https = require('https');

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

            const cb = (v) => {
                ok(callback(v));
            };

            events.once(`RESPONSE_OUTPUT:${key}`, cb);
            setTimeout(() => {
                err("timeout");
                events.off(`RESPONSE_OUTPUT:${key}`, cb);
            }, 100);
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

    getTxrVersion() {
        return this._getApiPromise(types.GET_ROLE, r => parseInt(r)).then(role => {
            if (role === 0) {
                return this._getApiPromise(types.GET_VERSION, v => v);
            } else if (role === 1) {
                return this._getApiPromise(types.GET_REMOTE_VERSION, v => v);
            } else {
                throw new Error("panic");
            }
        });
    },

    command(cmd) {
        if (port) {
            port.write(cmd + '\n', (err, results) => {
                if (err) throw err;
            });
        }
    },

    getLaterTxrVersionIfExists() {
        return this.getTxrVersion().then(v => new Promise((ok,err) => {
            var splitVersion = v.split('.');
            var oldVersion = {
                major: parseInt(splitVersion[0]),
                minor: parseInt(splitVersion[1]),
            };

            var options = {
                host: config.githubBinDirectoryHost,
                path: config.githubBinDirectoryPath,
                headers: {
                    "User-Agent": "Lenzhound-Manager-1.0",
                },
                rejectUnauthorized: false,
            };
            https.get(options, res => {
                if (res.statusCode !== 200) {
                    err(res);
                }

                var body = "";

                res.on('error', e => {
                    err(e);
                });

                res.on('data', chunk => {
                    body += chunk;
                });

                res.on('end', () => {
                    ok([oldVersion, JSON.parse(body)]);
                });
            });
        })).then(([old, res]) => {
            var versionMatch = /txr\.ino\.leonardo([0-9])+\.([0-9]+)\.hex/i;
            var versions = res.filter(x => versionMatch.test(x.name)).map(x => {
                var match = versionMatch.exec(x.name);
                return {
                    major: parseInt(match[1]),
                    minor: parseInt(match[2]),
                    url: x.download_url
                };
            });

            versions = versions.concat([{major:2000, minor:0, url:'dummy'}]);

            versions.sort((l,r) => (r.major - l.major) || (r.minor - l.minor));
            var latest = versions[0];

            console.log(versions);

            if (((latest.major - old.major) || (latest.minor - old.minor)) > 0) {
                return latest;
            } else {
                return null;
            }
        });
    },

    types
}
