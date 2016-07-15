const React = require('react');
const ReactDOM = require('react-dom');
const app = require('./lib/app-root');
const events = require('./lib/events');
const api = require('./lib/serial-api');
const remoteFileApi = require('./lib/remote-file-api');
const _ = require('lodash');
require('./lib/error-logger');

const poll = (period, lambda) => {
    var interval = setInterval(() => {
        lambda(() => {
            clearInterval(interval);
        });
    }, period);
    return interval;
}

var pollings = [];

events.on(events.SERIAL_PORT_OPEN, () => {
    const pollForSetting = (promise, setting) => {
        return poll(1000, stop => promise().then(result => {
            app.setProps({
                settings:{[setting]: result},
            });
            stop();
        }, err => {
            if (!/timeout/.test(err)) {
                throw err;
            } else {
                app.setProps({
                    settings:{[setting]: null},
                });
            }
        }));
    };

    poll(1000, stop => api.getRole().then(result => {
        app.setProps({
            unknownVersion: false,
            pawPluggedIn: result === "PAW",
            dogbonePluggedIn: result === "DOGBONE",
            settings: {
                startInCal: null,
                maxSpeed: null,
                accel: null,
                channel: null,
            }
        });
        pollings.push(pollForSetting(() => api.getStartInCal(), "startInCal"));
        pollings.push(pollForSetting(() => api.getMaxSpeed(), "maxSpeed"));
        pollings.push(pollForSetting(() => api.getAccel(), "accel"));
        pollings.push(pollForSetting(() => api.getChannel(), "channel"));

        if (result === "PAW") {
            remoteFileApi.getLaterTxrVersionIfExists().then(v => {
                app.setProps({newTxrVersion: v || null});
            });
        } else if (result === "DOGBONE") {
            remoteFileApi.getLaterRxrVersionIfExists().then(v => {
                app.setProps({newRxrVersion: v || null});
            });
        } else {
            app.setProps({unknownVersion: true});
        }
        stop();
    }, err => {
        app.setProps({unknownVersion: true});
    }));
});

events.on(events.SERIAL_PORT_CLOSE, () => {
    pollings.forEach(p => clearInterval(p));
    app.setProps({pawPluggedIn: false, dogbonePluggedIn: false});
});

events.on(events.SET_START_IN_CAL, (startInCal) => {
    app.setProps({settings:{startInCal}});
    api.setStartInCal(startInCal);
});

const saveConfigsDebounced = _.debounce(() => api.saveConfigs(), 5000);

events.on(events.SET_MAX_VELOCITY, (maxSpeed) => {
    app.setProps({settings:{maxSpeed}});
    api.setMaxSpeed(maxSpeed);
    saveConfigsDebounced();
});

events.on(events.SET_ACCEL, (accel) => {
    app.setProps({settings:{accel}});
    api.setAccel(accel);
    saveConfigsDebounced();
});


events.on(events.SET_CHANNEL, (channel) => {
    app.setProps({settings:{channel}});
    api.setChannel(channel);
});

events.on(events.UPLOAD_TO_TXR, (version) => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    api.flashBoard(version.url).then(() => {
        app.setProps({loading: false});
        api.enableAutoConnect();
    });
});

events.on(events.UPLOAD_TO_RXR, (version) => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    api.flashBoard(version.url).then(() => {
        app.setProps({loading: false});
        api.enableAutoConnect();
    });
});

events.on(events.FORCE_UPLOAD_TXR, () => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    remoteFileApi.getLaterTxrVersionIfExists().then(version => {
        api.flashBoard(version.url).then(() => {
            app.setProps({loading: false});
            api.enableAutoConnect();
        });;
    });
});

events.on(events.FORCE_UPLOAD_RXR, () => {
    api.disableAutoConnect();
    app.setProps({loading: true});
    remoteFileApi.getLaterRxrVersionIfExists().then(version => {
        api.flashBoard(version.url).then(() => {
            app.setProps({loading: false});
            api.enableAutoConnect();
        });
    });
});

events.on(events.RESPONSE_OUTPUT("*"), (val) => {
});

app.setProps({pawPluggedIn:false, profiles: []});

api.enableAutoConnect();
