const React = require('react');
const ReactDOM = require('react-dom');
const root = require('./lib/root');
const events = require('./lib/events');
const api = require('./lib/serial-api');
const remoteFileApi = require('./lib/remote-file-api');

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
            root.setProps({
                settings:{[setting]: result},
            });
            stop();
        }, err => {
            if (!/timeout/.test(err)) {
                throw err;
            }
        }));
    };

    poll(1000, stop => api.getRole().then(result => {
        if (result === "PAW") {
            root.setProps({
                unknownVersion: false,
                pawPluggedIn: true,
                settings: {
                    startInCal: null,
                    maxSpeed: null,
                    accel: null,
                }
            });
            pollings.push(pollForSetting(() => api.getStartInCal(), "startInCal"));
            pollings.push(pollForSetting(() => api.getMaxSpeed(), "maxSpeed"));
            pollings.push(pollForSetting(() => api.getAccel(), "accel"));
            pollings.push(pollForSetting(() => api.getChannel(), "channel"));

            remoteFileApi.getLaterTxrVersionIfExists().then(v => {
                root.setProps({newTxrVersion: v || null});
            });
        } else if (result === "DOGBONE") {
            remoteFileApi.getLaterRxrVersionIfExists().then(v => {
                root.setProps({newRxrVersion: v || null});
            });

            root.setProps({
                unknownVersion: false,
                dogbonePluggedIn: true,
                settings: {
                    startInCal: null,
                    maxSpeed: null,
                    accel: null,
                }
            });
        } else {
            root.setProps({unknownVersion: true});
        }
        stop();
    }, err => {
        root.setProps({unknownVersion: true});
    }));
});

events.on(events.SERIAL_PORT_CLOSE, () => {
    pollings.forEach(p => clearInterval(p));
    root.setProps({pawPluggedIn: false, dogbonePluggedIn: false});
});

events.on(events.SET_START_IN_CAL, (startInCal) => {
    root.setProps({settings:{startInCal}});
    api.setStartInCal(startInCal);
});

events.on(events.SET_MAX_VELOCITY, (maxSpeed) => {
    root.setProps({settings:{maxSpeed}});
    api.setMaxSpeed(maxSpeed);
});

events.on(events.SET_ACCEL, (accel) => {
    root.setProps({settings:{accel}});
    api.setAccel(accel);
});

events.on(events.UPLOAD_TO_TXR, (version) => {
    api.flashBoard(version.url);
});

events.on(events.FORCE_UPLOAD_TXR, () => {
    api.disableAutoConnect();
    root.setProps({loading: true});
    remoteFileApi.getLaterTxrVersionIfExists().then(version => {
        api.flashBoard(version.url).then(() => {
            root.setProps({loading: false});
            api.enableAutoConnect();
        });;
    });
});

events.on(events.FORCE_UPLOAD_RXR, () => {
    api.disableAutoConnect();
    root.setProps({loading: true});
    remoteFileApi.getLaterRxrVersionIfExists().then(version => {
        api.flashBoard(version.url).then(() => {
            root.setProps({loading: false});
            api.enableAutoConnect();
        });
    });
});

events.on(events.RESPONSE_OUTPUT("*"), (val) => {
});

root.setProps({pawPluggedIn:false, profiles: []});

api.enableAutoConnect();
