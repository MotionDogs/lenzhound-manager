'use strict';

var React = require('react');
var Divider = require('material-ui/lib/divider');
var Paper = require('material-ui/lib/paper');
var Checkbox = require('material-ui/lib/checkbox');
var SliderControl = require('./slider-control');
var events = require('./events');

var MAX_MAX_SPEED = 1 << 15;
var MAX_ACCEL = 32;

module.exports = React.createClass({
    propTypes: {
        maxSpeed: React.PropTypes.number,
        accel: React.PropTypes.number,
        startInCal: React.PropTypes.bool
    },

    render: function render() {
        var _this = this;

        var callbacks = {
            toggleStartInCal: function toggleStartInCal() {
                events.emit("SET_START_IN_CAL", !_this.props.startInCal);
            },
            changeMaxSpeed: function changeMaxSpeed(val) {
                events.emit("SET_MAX_VELOCITY", val);
            },
            changeAccel: function changeAccel(val) {
                events.emit("SET_ACCEL", val);
            }
        };

        var styles = {
            paper: {
                padding: 14,
                paddingBottom: 20
            }
        };

        var logb = function logb(base, val) {
            return Math.log10(val) / Math.log10(base);
        };
        var powRounded = function powRounded(base, val) {
            return Math.round(Math.pow(base, val));
        };
        var clamp = function clamp(val, min, max) {
            return Math.min(max, Math.max(min, val));
        };

        return React.createElement(
            Paper,
            { style: styles.paper },
            React.createElement(SliderControl, {
                title: 'Max speed',
                disabled: this.props.maxSpeed === null,
                value: clamp(this.props.maxSpeed || 0, 1, 32768),
                transform: function transform(v) {
                    return v && logb(MAX_MAX_SPEED, v);
                },
                invTransform: function invTransform(v) {
                    return powRounded(MAX_MAX_SPEED, v);
                },
                onChange: callbacks.changeMaxSpeed
            }),
            React.createElement(SliderControl, {
                title: 'Acceleration',
                disabled: this.props.accel === null,
                value: clamp(this.props.accel || 0, 1, MAX_ACCEL),
                transform: function transform(v) {
                    return (v + 1) / MAX_ACCEL;
                },
                invTransform: function invTransform(v) {
                    return Math.round(v * MAX_ACCEL);
                },
                onChange: callbacks.changeAccel
            }),
            React.createElement(Checkbox, {
                label: 'Start in calibration mode',
                labelPosition: 'left',
                disabled: this.props.startInCal === null,
                onCheck: callbacks.toggleStartInCal,
                defaultChecked: this.props.startInCal || false
            })
        );
    }
});