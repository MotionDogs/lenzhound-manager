'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var Promise = require('promise');
var events = require('./events');
var config = require('./config');
var https = require('https');
var fs = require('fs');
var path = require('path');
var Avrgirl = require('../avrgirl');

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
        baudRate: 9600
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
                var outputVar = /([a-zA-Z])=(.+)/;

                if (outputVar.test(match[1])) {
                    var ms = outputVar.exec(match[1]);
                    var k = ms[1];
                    var v = ms[2];

                    events.emit(events.RESPONSE_OUTPUT(k), v);
                }

                buffer = buffer.slice(match[0].length);
            }
        });
    });

    port.on("error", function (err) {
        if (err) {
            port = null;
            // throw err;
        }

        console.log("port error");
    });
};

var interval = setInterval(function () {
    serialport.list(function (e, ports) {
        if (!ports) throw e;
        var arduinos = ports.filter(function (p) {
            return (/VID_2341.*PID_8036/i.test(p.pnpId) || /2341/i.test(p.vendorId) && /8036/i.test(p.productId)
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

            var cb = function cb(v) {
                ok(callback(v));
            };

            events.once('RESPONSE_OUTPUT:' + key, cb);
            setTimeout(function () {
                err("timeout");
                events.off('RESPONSE_OUTPUT:' + key, cb);
            }, 100);
        });
    },
    closePort: function closePort() {
        port.close();
        port = null;
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
    getTxrVersion: function getTxrVersion() {
        var _this2 = this;

        return this._getApiPromise(types.GET_ROLE, function (r) {
            return parseInt(r);
        }).then(function (role) {
            if (role === 0) {
                return _this2._getApiPromise(types.GET_VERSION, function (v) {
                    return v;
                });
            } else if (role === 1) {
                return _this2._getApiPromise(types.GET_REMOTE_VERSION, function (v) {
                    return v;
                });
            } else {
                throw new Error("panic");
            }
        });
    },
    command: function command(cmd) {
        if (port) {
            port.write(cmd + '\n', function (err, results) {
                if (err) throw err;
            });
        }
    },
    flashTxr: function flashTxr(url) {
        var parsed = path.parse(url);
        var filepath = './downloads/' + parsed.base;

        var avrgirl = new Avrgirl({ board: 'leonardo', port: port.comName });
        port.close();
        port = null;

        return new Promise(function (ok, err) {
            avrgirl.flash(filepath, function (e) {
                if (e) {
                    err(e);
                } else {
                    ok();
                }
            });
        });
    },
    getLaterTxrVersionIfExists: function getLaterTxrVersionIfExists() {
        return this.getTxrVersion().then(function (v) {
            return new Promise(function (ok, err) {
                var splitVersion = v.split('.');
                var oldVersion = {
                    major: parseInt(splitVersion[0]),
                    minor: parseInt(splitVersion[1])
                };

                var options = {
                    host: config.githubBinDirectoryHost,
                    path: config.githubBinDirectoryPath,
                    headers: {
                        "User-Agent": "Lenzhound-Manager-1.0"
                    },
                    rejectUnauthorized: false
                };
                https.get(options, function (res) {
                    if (res.statusCode !== 200) {
                        err(res);
                    }

                    var body = "";

                    res.on('error', function (e) {
                        err(e);
                    });

                    res.on('data', function (chunk) {
                        body += chunk;
                    });

                    res.on('end', function () {
                        ok([oldVersion, JSON.parse(body)]);
                    });
                });
            });
        }).then(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2);

            var old = _ref2[0];
            var res = _ref2[1];

            var versionMatch = /txr\.ino\.leonardo-([0-9])+\.([0-9]+)\.hex/i;
            var versions = res.filter(function (x) {
                return versionMatch.test(x.name);
            }).map(function (x) {
                var match = versionMatch.exec(x.name);
                return {
                    major: parseInt(match[1]),
                    minor: parseInt(match[2]),
                    url: x.download_url
                };
            });

            versions.sort(function (l, r) {
                return r.major - l.major || r.minor - l.minor;
            });
            var latest = versions[0];

            if ((latest.major - old.major || latest.minor - old.minor) > 0) {
                return latest;
            } else {
                return null;
            }
        }).then(function (latest) {
            if (!latest) {
                return latest;
            }

            return Promise.denodeify(fs.stat)('./downloads').then(function (s) {
                if (!s.isDirectory()) {
                    throw new Error('panic');
                }

                return latest;
            }, function (err) {
                fs.mkdir('./downloads');
                return latest;
            });
        }).then(function (latest) {
            var parsed = path.parse(latest.url);
            var filePath = './downloads/' + parsed.base;

            return Promise.denodeify(fs.stat)(filePath).then(function (f) {
                if (!f.isFile()) {
                    throw new Error('panic');
                }

                return latest;
            }, function (err) {
                return new Promise(function (ok, err) {
                    https.get(latest.url, function (res) {
                        if (res.statusCode !== 200) {
                            throw new Error('panic');
                        }

                        var body = "";
                        res.on('data', function (chunk) {
                            body += chunk;
                        });

                        res.on('end', function () {
                            ok(body);
                        });

                        res.on('error', function (e) {
                            err(e);
                        });
                    });
                }).then(function (contents) {
                    var writeFile = Promise.denodeify(fs.writeFile);
                    return writeFile(filePath, contents, 'utf8').then(function () {
                        return latest;
                    });
                });
            });
        });
    },


    types: types
};