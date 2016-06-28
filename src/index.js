const React = require('react');
const ReactDOM = require('react-dom');
const root = require('./lib/root');
const events = require('./lib/events');
const api = require('./lib/serial-api');
const Promise = require('promise');

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
        }, err => {}));
    };

    root.setProps({
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

    api.getLaterTxrVersionIfExists().then(v => {
        if (v) {
            root.setProps({newVersion: v});
        }  else {
            root.setProps({newVersion: null});
        }
    });
});

events.on(events.SERIAL_PORT_CLOSE, () => {
    pollings.forEach(p => clearInterval(p));
    root.setProps({pawPluggedIn: false});
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
    api.flashTxr(version.url);
});

events.on(events.RESPONSE_OUTPUT("*"), (val) => {
});

root.setProps({pawPluggedIn:false, profiles: []});
