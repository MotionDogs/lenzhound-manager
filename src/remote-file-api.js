const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const config = require('./config');
const serial = require('./serial-api');

const homeDir = process.platform == 'darwin' ?
    process.env.HOME : process.env.USERPROFILE;
const dataDir = process.platform == 'darwin' ?
    homeDir + "/Library/Lenzhound" :
    homeDir + "/AppData/Local/Lenzhound";

const LOCAL_TXR = "local-txr";
const LOCAL_RXR = "local-rxr";

const LOCAL_BUILD_PATH = homeDir + "/.lenzhound/build";
const LOCAL_TXR_PATH = homeDir + "/.lenzhound/build/Txr.ino.hex";
const LOCAL_RXR_PATH = homeDir + "/.lenzhound/build/Rxr.ino.hex";

fs.stat(dataDir, e => {
    if (e) {
        fs.mkdir(dataDir, e => {
            if (e) {
                throw new Error("panid:" + e);
            }
        });
    }
});

module.exports = {
    fsWatchers: [],

    getAllVersions() {
        return new Promise((ok, err) => {
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
                    ok(JSON.parse(body));
                });
            });
        });
    },

    getLatestTxrVersion() {
        var versionMatch = /txr\.ino\.leonardo-([0-9])+\.([0-9]+)\.hex/i;
        return this.getAllVersions().then(vs => {
            var filtered = vs.filter(v => versionMatch.test(v.name));
            var mapped = filtered.map(v => {
                var match = versionMatch.exec(v.name);
                return {
                    major: parseInt(match[1]),
                    minor: parseInt(match[2]),
                    url: v.download_url
                };
            });
            mapped.sort((l,r) => (r.major - l.major) || (r.minor - l.minor));
            var latest = mapped[0];

            return latest;
        });
    },

    getLatestRxrVersion() {
        var versionMatch = /rxr\.ino\.leonardo-([0-9])+\.([0-9]+)\.hex/i;
        return this.getAllVersions().then(vs => {
            var filtered = vs.filter(v => versionMatch.test(v.name));
            var mapped = filtered.map(v => {
                var match = versionMatch.exec(v.name);
                return {
                    major: parseInt(match[1]),
                    minor: parseInt(match[2]),
                    url: v.download_url
                };
            });
            mapped.sort((l,r) => (r.major - l.major) || (r.minor - l.minor));
            var latest = mapped[0];

            return latest;
        });
    },

    maybeDownloadNewVersion(current, latest) {
        return new Promise((ok, err) => {
            if (((latest.major - current.major) ||
                (latest.minor - current.minor)) <= 0) {
                ok(null);
                return;
            }

            return new Promise((ok, err) => {
                fs.stat(dataDir + '/downloads', (e, s) => {
                    if (e) {
                        fs.mkdir(dataDir + '/downloads', (e) => {
                            if (e) {
                                throw new Error('panic: ' + e);
                            }
                            ok(latest);
                        });
                    } else {
                        // TODO(doug): this is failing for some reason on OSX...
                        // if (!s.isDirectory()) {
                        //     throw new Error('panic');
                        // }

                        ok(latest);
                    }
                });
            }).then(latest => {
                if (!latest) { return latest; }

                var parsed = path.parse(latest.url);
                var filePath = dataDir + '/downloads/' + parsed.base;

                return new Promise((ok, err) => {
                    fs.stat(filePath, (e, s) => {
                        if (e) {
                            https.get(latest.url, res => {
                                if (res.statusCode !== 200) {
                                    throw new Error('panic: statusCode == ' + res.statusCode);
                                }

                                var body = "";
                                res.on('data', chunk => {
                                    body += chunk;
                                });

                                res.on('end', () => {
                                    fs.writeFile(filePath, body, 'utf8', (e) => {
                                        if (e) throw e;
                                        ok(latest);
                                    });
                                });

                                res.on('error', (e) => {
                                    err(e);
                                });
                            });
                        } else {
                            if (!s.isFile()) {
                                throw new Error('panic');
                            }
                            ok(latest);
                        }
                    });
                });
            }).then(latest => ok(latest));
        });
    },

    getLaterTxrVersionIfExists() {
        if (config.devMode) {
            return new Promise(ok => fs.stat(LOCAL_TXR_PATH, (e) => {
                if (e) {
                    ok(null);
                } else {
                    ok({ url: LOCAL_TXR });
                }
            }));
        }

        return serial.getTxrVersion().then(v => {
            var splitVersion = v.split('.');
            var current = {
                major: parseInt(splitVersion[0]),
                minor: parseInt(splitVersion[1]),
            };

            return this.getLatestTxrVersion().then(latest => {
                return this.maybeDownloadNewVersion(current, latest);
            });
        });
    },

    getLaterRxrVersionIfExists() {
        if (config.devMode) {
            return new Promise(ok => fs.stat(LOCAL_RXR_PATH, (e) => {
                if (e) {
                    ok(null);
                } else {
                    ok({ url: LOCAL_RXR });
                }
            }));
        }

        return serial.getRxrVersion().then(v => {
            var splitVersion = v.split('.');
            var current = {
                major: parseInt(splitVersion[0]),
                minor: parseInt(splitVersion[1]),
            };

            return this.getLatestRxrVersion().then(latest => {
                return this.maybeDownloadNewVersion(current, latest);
            });
        });
    },

    uploadString(val) {
        return new Promise((ok, err) => {
            var boundary = "YELLOW_SUBMARINE";
            var data = 
                `--${boundary}\r\n` +
                `Content-Type: text/plain\r\n` +
                `Content-Disposition: form-data; name="file"; filename="upload.txt"\r\n` +
                `Content-Transfer-Encoding: binary"\r\n\r\n` +
                `${val}\r\n\r\n--${boundary}--`;

            var options = {
                host: 'file.io',
                path: '/?expires=5m',
                method: 'POST',
                headers: {
                  'Content-Length': Buffer.byteLength(data),
                  'Content-Type': `multipart/form-data; boundary="${boundary}"`,
              }
            };

            var request = https.request(options, res => {
                if (res.statusCode !== 200) {
                    console.log(`Received status code ${res.statusCode} from file.io`);
                }

                res.setEncoding('utf8');

                var body = "";
                res.on('data', chunk => {
                    body += chunk;
                });

                res.on('end', () => {
                    try {
                        ok(JSON.parse(body).link);
                    } catch (e) {
                        err(body);
                    }
                });

                res.on('error', (e) => {
                    err(e);
                });
            });

            request.end(data);
        });
    },

    getEepromUrl() {
        return serial.exportEeprom().then(eeprom => this.uploadString(eeprom));
    },

    getFilepathForUrl(url) {
        if (url == "local-txr") {
            return LOCAL_TXR_PATH;
        } else if (url == "local-rxr") {
            return LOCAL_RXR_PATH;
        }

        var parsed = path.parse(url);
        return dataDir + '/downloads/' + parsed.base;
    },

    clearLocalBuild() {
        this.fsWatcher.close();
        fs.unlink(LOCAL_TXR_PATH, e => {});
        fs.unlink(LOCAL_RXR_PATH, e => {});
        this.watchForLocalBuildChanges();
    },

    watchForLocalBuildChanges() {
        if (!config.devMode) {
            return;
        }
        
        this.fsWatcher = fs.watch(LOCAL_BUILD_PATH, () => {
            events.emit(events.LOCAL_BUILD_CHANGED);
        });
    },
};
