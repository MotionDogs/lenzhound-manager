const React = require('react');
const Divider = require('material-ui/lib/divider');
const Paper = require('material-ui/lib/paper');
const Checkbox = require('material-ui/lib/checkbox');
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
        };

        var logb = (base, val) => Math.log10(val) / Math.log10(base);
        var powRounded = (base, val) => Math.round(Math.pow(base, val));
        var clamp = (val, min, max) => Math.min(max, Math.max(min, val));

        return (
        <Paper style={styles.paper}>
            <SliderControl
                title="Max speed"
                disabled={this.props.maxSpeed === null}
                value={clamp(this.props.maxSpeed || 0, 1, 32768)}
                transform={(v) => v && logb(MAX_MAX_SPEED, v)}
                invTransform={(v) => powRounded(MAX_MAX_SPEED, v)}
                onChange={callbacks.changeMaxSpeed}
            />
            <SliderControl
                title="Acceleration"
                disabled={this.props.accel === null}
                value={clamp(this.props.accel || 0, 1, MAX_ACCEL)}
                transform={(v) => (v + 1) / MAX_ACCEL}
                invTransform={(v) => Math.round(v * MAX_ACCEL)}
                onChange={callbacks.changeAccel}
            />
            <Checkbox
              label="Start in calibration mode"
              labelPosition='left'
              disabled={this.props.startInCal === null}
              onCheck={callbacks.toggleStartInCal}
              defaultChecked={this.props.startInCal || false}
            />
        </Paper>
        )
    }
});
