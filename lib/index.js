'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var root = require('./lib/root');
var events = require('./lib/events');
var api = require('./lib/serial-api');
var Promise = require('promise');

var retry = function retry(lambda) {
    return new Promise(function (ok, err) {
        lambda().then(function (val) {
            return ok(val);
        }, function (_) {
            console.log(_);
            lambda().then(function (val) {
                return ok(val);
            }, function (e) {
                return err(e);
            });
        });
    });
};

events.on("SERIAL_PORT_OPEN", function () {
    retry(function () {
        return api.getStartInCal();
    }).then(function (startInCal) {
        return retry(function () {
            return api.getMaxSpeed();
        }).then(function (maxSpeed) {
            return retry(function () {
                return api.getAccel();
            }).then(function (accel) {
                return root.setProps({
                    settings: { startInCal: startInCal, maxSpeed: maxSpeed, accel: accel },
                    pluggedIn: true
                });
            });
        });
    });
});

events.on("SERIAL_PORT_CLOSE", function () {
    root.setProps({ pluggedIn: false });
});

events.on("SET_START_IN_CAL", function (startInCal) {
    root.setProps({ settings: { startInCal: startInCal } });
    api.setStartInCal(startInCal);
});

events.on("SET_MAX_VELOCITY", function (val) {
    api.setMaxSpeed(val);
});

events.on("SET_ACCEL", function (val) {
    api.setAccel(val);
});

events.on("RESPONSE_OUTPUT:*", function (val) {});

root.setProps({ pluggedIn: false });