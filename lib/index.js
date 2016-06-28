'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');
var ReactDOM = require('react-dom');
var root = require('./lib/root');
var events = require('./lib/events');
var api = require('./lib/serial-api');
var Promise = require('promise');

var poll = function poll(period, lambda) {
    var interval = setInterval(function () {
        lambda(function () {
            clearInterval(interval);
        });
    }, period);
    return interval;
};

var pollings = [];

events.on(events.SERIAL_PORT_OPEN, function () {
    var pollForSetting = function pollForSetting(promise, setting) {
        return poll(1000, function (stop) {
            return promise().then(function (result) {
                root.setProps({
                    settings: _defineProperty({}, setting, result)
                });
                stop();
            }, function (err) {});
        });
    };

    root.setProps({
        pawPluggedIn: true,
        settings: {
            startInCal: null,
            maxSpeed: null,
            accel: null
        }
    });
    pollings.push(pollForSetting(function () {
        return api.getStartInCal();
    }, "startInCal"));
    pollings.push(pollForSetting(function () {
        return api.getMaxSpeed();
    }, "maxSpeed"));
    pollings.push(pollForSetting(function () {
        return api.getAccel();
    }, "accel"));

    api.getLaterTxrVersionIfExists().then(function (v) {
        if (v) {
            root.setProps({ newVersion: v });
        } else {
            root.setProps({ newVersion: null });
        }
    });
});

events.on(events.SERIAL_PORT_CLOSE, function () {
    pollings.forEach(function (p) {
        return clearInterval(p);
    });
    root.setProps({ pawPluggedIn: false });
});

events.on(events.SET_START_IN_CAL, function (startInCal) {
    root.setProps({ settings: { startInCal: startInCal } });
    api.setStartInCal(startInCal);
});

events.on(events.SET_MAX_VELOCITY, function (maxSpeed) {
    root.setProps({ settings: { maxSpeed: maxSpeed } });
    api.setMaxSpeed(maxSpeed);
});

events.on(events.SET_ACCEL, function (accel) {
    root.setProps({ settings: { accel: accel } });
    api.setAccel(accel);
});

events.on(events.UPLOAD_TO_TXR, function (version) {
    api.flashTxr(version.url);
});

events.on(events.RESPONSE_OUTPUT("*"), function (val) {});

root.setProps({ pawPluggedIn: false, profiles: [] });