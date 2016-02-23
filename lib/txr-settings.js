'use strict';

var React = require('react');
var Divider = require('material-ui/lib/divider');
var Paper = require('material-ui/lib/paper');
var Toggle = require('material-ui/lib/toggle');
var SliderControl = require('./slider-control');

var MAX_MAX_SPEED = 1 << 15;
var MAX_ACCEL = 32;

module.exports = React.createClass({
    getInitialState: function getInitialState() {
        return {
            value: 52,
            stringValue: 52..toString()
        };
    },
    render: function render() {
        var styles = {
            paper: {
                padding: 14,
                paddingBottom: 20
            },
            toggle: {
                // marginTop: 16,
            }
        };

        var logb = function logb(base, val) {
            return Math.log10(val) / Math.log10(base);
        };
        var powRounded = function powRounded(base, val) {
            return Math.round(Math.pow(base, val));
        };

        return React.createElement(
            Paper,
            { style: styles.paper },
            React.createElement(SliderControl, {
                title: 'Max speed',
                value: 52,
                transform: function transform(v) {
                    return logb(MAX_MAX_SPEED, v);
                },
                invTransform: function invTransform(v) {
                    return powRounded(MAX_MAX_SPEED, v);
                }
            }),
            React.createElement(SliderControl, {
                title: 'Acceleration',
                value: 4,
                transform: function transform(v) {
                    return v / MAX_ACCEL;
                },
                invTransform: function invTransform(v) {
                    return Math.round(v * MAX_ACCEL);
                }
            }),
            React.createElement(Toggle, {
                label: 'Start in calibration mode',
                style: styles.toggle
            })
        );
    }
});