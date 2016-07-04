const serial = require('./serial-api');
const Promise = require('promise');
const https = require('https');
const fs = require('fs');
const config = require('./config');
const logError = require('./error-logger').logError;
const path = require('path');

module.exports = {
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
        }, logError);
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
        }, logError);
    },

    maybeDownloadNewVersion(current, latest) {
        return new Promise((ok, err) => {
            if (((latest.major - current.major) ||
                (latest.minor - current.minor)) <= 0) {
                return null;
            }

            return Promise.denodeify(fs.stat)('./downloads').then(s => {
                if (!s.isDirectory()) {
                    throw new Error('panic');
                }

                return latest;
            }, err => {
                fs.mkdir('./downloads');
                return latest;
            }).then(latest => {
                if (!latest) { return latest; }

                var parsed = path.parse(latest.url);
                var filePath = './downloads/' + parsed.base;

                return Promise.denodeify(fs.stat)(filePath).then(f => {
                    if (!f.isFile()) {
                        throw new Error('panic');
                    }

                    return latest;
                }, err => {
                    return new Promise((ok,err) => {
                        https.get(latest.url, res => {
                            if (res.statusCode !== 200) {
                                throw new Error('panic');
                            }

                            var body = "";
                            res.on('data', chunk => {
                                body += chunk;
                            });

                            res.on('end', () => {
                                ok(body);
                            });

                            res.on('error', (e) => {
                                err(e);
                            });
                        });
                    }).then(contents => {
                        var writeFile = Promise.denodeify(fs.writeFile)
                        return writeFile(filePath, contents, 'utf8').then(() => {
                            return latest;
                        });
                    }, logError);
                });
            }, logError)
            .then(latest => ok(latest), logError);
        });
    },

    getLaterTxrVersionIfExists() {
        return serial.getTxrVersion().then(v => {
            var splitVersion = v.split('.');
            var current = {
                major: parseInt(splitVersion[0]),
                minor: parseInt(splitVersion[1]),
            };

            return this.getLatestTxrVersion().then(latest => {
                return this.maybeDownloadNewVersion(current, latest);
            });
        }, logError);
    },

    getLaterRxrVersionIfExists() {
        return serial.getRxrVersion().then(v => {
            var splitVersion = v.split('.');
            var current = {
                major: parseInt(splitVersion[0]),
                minor: parseInt(splitVersion[1]),
            };

            return this.getLatestRxrVersion().then(latest => {
                return this.maybeDownloadNewVersion(current, latest);
            });
        }, logError);
    }
};
