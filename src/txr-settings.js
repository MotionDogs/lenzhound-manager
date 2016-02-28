const React = require('react');
const Divider = require('material-ui/lib/divider');
const Paper = require('material-ui/lib/paper');
const Toggle = require('material-ui/lib/toggle');
const SliderControl = require('./slider-control');
const events = require('./events');

const MAX_MAX_SPEED = 1 << 15;
const MAX_ACCEL = 32;

module.exports = React.createClass({
    propTypes: {
        maxSpeed: React.PropTypes.number,
        accel: React.PropTypes.number,
        startInCal: React.PropTypes.bool,
    },

    getDefaultProps: function() {
        return {
            maxSpeed: 200,
            accel: 16,
            startInCal: false,
        };
    },

    render() {
        const callbacks = {
            toggleStartInCal: () => {
                events.emit("SET_START_IN_CAL", !this.props.startInCal);
            },
            changeMaxSpeed: (val) => {
                events.emit("SET_MAX_VELOCITY", val);
            },
            changeAccel: (val) => {
                events.emit("SET_ACCEL", val);
            },
        };

        const styles = {
            paper: {
                padding: 14,
                paddingBottom: 20,
            },
            toggle: {
                // marginTop: 16,
            },
        };

        var logb = (base, val) => Math.log10(val) / Math.log10(base);
        var powRounded = (base, val) => Math.round(Math.pow(base, val));

        return (
        <Paper style={styles.paper}>
            <SliderControl
                title="Max speed"
                value={this.props.maxSpeed}
                transform={(v) => logb(MAX_MAX_SPEED, v)}
                invTransform={(v) => powRounded(MAX_MAX_SPEED, v)}
                onChange={callbacks.changeMaxSpeed}
            />
            <SliderControl
                title="Acceleration"
                value={this.props.accel}
                transform={(v) => v / MAX_ACCEL}
                invTransform={(v) => Math.round(v * MAX_ACCEL)}
                onChange={callbacks.changeAccel}
            />
            <Toggle
              label="Start in calibration mode"
              style={styles.toggle}
              onToggle={callbacks.toggleStartInCal}
              defaultToggled={this.props.startInCal}
            />
        </Paper>
        )
    }
});
