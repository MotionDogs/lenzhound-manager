const promisify = require('promisify-node');
const https = promisify('https');
const fs = promisify('fs');
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

fs.stat(dataDir).then(null, () => fs.mkdir(dataDir).then(null, () => {
    throw new Error("panid:" + e);
}));

module.exports = {
    fsWatchers: [],

    getAllVersions() {
        return new Promise((ok, err) => {
            const options = {
                host: config.githubBinDirectoryHost,
                path: config.githubBinDirectoryPath + config.releaseChannel,
                headers: {
                    "User-Agent": "Lenzhound-Manager-1.0",
                },
                rejectUnauthorized: false,
            };

            https.get(options, res => {
                if (res.statusCode !== 200) {
                    err(res);
                }

                const body = "";

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

    async getLatestTxrVersion() {
        const versionMatch = /txr\.ino\.leonardo-([0-9])+\.([0-9]+)\.hex/i;
        const vs = await this.getAllVersions();

        const filtered = vs.filter(v => versionMatch.test(v.name));
        const mapped = filtered.map(v => {
            const match = versionMatch.exec(v.name);
            return {
                major: parseInt(match[1]),
                minor: parseInt(match[2]),
                url: v.download_url
            };
        });
        mapped.sort((l,r) => (r.major - l.major) || (r.minor - l.minor));
        const latest = mapped[0];

        return latest;
    },

    async getLatestRxrVersion() {
        const versionMatch = /rxr\.ino\.leonardo-([0-9])+\.([0-9]+)\.hex/i;
        const vs = await this.getAllVersions();

        const filtered = vs.filter(v => versionMatch.test(v.name));
        const mapped = filtered.map(v => {
            const match = versionMatch.exec(v.name);
            return {
                major: parseInt(match[1]),
                minor: parseInt(match[2]),
                url: v.download_url
            };
        });
        mapped.sort((l,r) => (r.major - l.major) || (r.minor - l.minor));
        const latest = mapped[0];

        return latest;
    },

    async maybeDownloadNewVersion(current, latest) {
        if (((latest.major - current.major) ||
            (latest.minor - current.minor)) <= 0) {
            return null;
        }

        try {
            await fs.stat(dataDir + '/downloads');
        } catch (e) {
            await fs.mkdir(dataDir + '/downloads');
        }

        if (!latest) { return latest; }

        const parsed = path.parse(latest.url);
        const filePath = dataDir + '/downloads/' + parsed.base;

        try {
            await fs.stat(filePath);
        } catch (e) {
            const res = await https.get(latest.url);

            if (res.statusCode !== 200) {
                throw new Error('panic: statusCode == ' + res.statusCode);
            }

            let body = "";
            res.on('data', chunk => {
                body += chunk;
            });

            await new Promise((ok, err) => {
                res.on('error', (e) => {
                    err(e);
                });

                res.on('end', () => {
                    ok();
                });
            });

            await fs.writeFile(filePath, body, 'utf8');
        }

        return latest;
    },

    async getLaterTxrVersionIfExists() {
        if (config.devMode) {
            try {
                await fs.stat(LOCAL_TXR_PATH);
                return { url: LOCAL_TXR };
            } catch (e) {
                return null;
            }
        }

        const version = await serial.getTxrVersion();
        const splitVersion = v.split('.');

        const current = {
            major: parseInt(splitVersion[0]),
            minor: parseInt(splitVersion[1]),
        };

        const latest = await this.getLatestTxrVersion();

        return await this.maybeDownloadNewVersion(current, latest);
    },

    async getLaterRxrVersionIfExists() {
        if (config.devMode) {
            try {
                await fs.stat(LOCAL_RXR_PATH);
                return { url: LOCAL_RXR };
            } catch (e) {
                return null;
            }
        }

        const version = await serial.getRxrVersion();
        const splitVersion = v.split('.');

        const current = {
            major: parseInt(splitVersion[0]),
            minor: parseInt(splitVersion[1]),
        };

        const latest = await this.getLatestRxrVersion();

        return await this.maybeDownloadNewVersion(current, latest);
    },

    async uploadString(val) {
        const boundary = "YELLOW_SUBMARINE";
        const data = 
            `--${boundary}\r\n` +
            `Content-Type: text/plain\r\n` +
            `Content-Disposition: form-data; name="file"; filename="upload.txt"\r\n` +
            `Content-Transfer-Encoding: binary"\r\n\r\n` +
            `${val}\r\n\r\n--${boundary}--`;

        const options = {
            host: 'file.io',
            path: '/?expires=5m',
            method: 'POST',
            headers: {
              'Content-Length': Buffer.byteLength(data),
              'Content-Type': `multipart/form-data; boundary="${boundary}"`,
          }
        };

        return await new Promise((ok, err) => {
            const request = https.request(options, res => {
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

    async getEepromUrl() {
        const eeprom = serial.exportEeprom();
        return await this.uploadString(eeprom);
    },

    getFilepathForUrl(url) {
        if (url == "local-txr") {
            return LOCAL_TXR_PATH;
        } else if (url == "local-rxr") {
            return LOCAL_RXR_PATH;
        }

        const parsed = path.parse(url);
        return dataDir + '/downloads/' + parsed.base;
    },

    async clearLocalBuild() {
        this.fsWatcher.close();
        try {
            await fs.unlink(LOCAL_TXR_PATH);
            await fs.unlink(LOCAL_RXR_PATH);
        } catch (e) {
        }
        this.watchForLocalBuildChanges();
    },

    watchForLocalBuildChanges() {
        if (!config.devMode) {
            return;
        }

        this.fsWatcher = fs.watch(LOCAL_BUILD_PATH, { recursive: true }, () => {
            events.emit(events.LOCAL_BUILD_CHANGED);
        });
    },
};
