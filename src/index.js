const React = require('react');
const ReactDOM = require('react-dom');
const root = require('./lib/root');
const events = require('./lib/events');
const api = require('./lib/serial-api');
const Promise = require('promise');

const retry = function (lambda) {
    return new Promise((ok, err) => {
        lambda().then((val) => ok(val), _ => {
            console.log(_);
            lambda().then(val => ok(val), e => err(e));
        });
    });
};

events.on("SERIAL_PORT_OPEN", () => {
    retry(() => api.getStartInCal()).then(startInCal =>
        retry(() => api.getMaxSpeed()).then(maxSpeed =>
            retry(() => api.getAccel()).then(accel =>
                root.setProps({
                    settings:{startInCal, maxSpeed, accel},
                    pluggedIn: true
                }))));
});

events.on("SERIAL_PORT_CLOSE", () => {
    root.setProps({pluggedIn: false});
});

events.on("SET_START_IN_CAL", (startInCal) => {
    root.setProps({settings:{startInCal}});
    api.setStartInCal(startInCal);
});

events.on("SET_MAX_VELOCITY", (val) => {
    api.setMaxSpeed(val);
});

events.on("SET_ACCEL", (val) => {
    api.setAccel(val);
});

events.on("RESPONSE_OUTPUT:*", (val) => {
});

root.setProps({pluggedIn:false});
