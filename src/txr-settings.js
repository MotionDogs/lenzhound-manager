const React = require('react');
const Divider = require('material-ui/lib/divider');
const Paper = require('material-ui/lib/paper');
const Toggle = require('material-ui/lib/toggle');
const SliderControl = require('./slider-control');

const MAX_MAX_SPEED = 1 << 15;
const MAX_ACCEL = 32;

module.exports = React.createClass({
    getInitialState() {
        return {
            value: 52,
            stringValue: (52).toString(),
        };
    },

    render() {
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
                value={52}
                transform={(v) => logb(MAX_MAX_SPEED, v)}
                invTransform={(v) => powRounded(MAX_MAX_SPEED, v)}
            />
            <SliderControl
                title="Acceleration"
                value={4}
                transform={(v) => v / MAX_ACCEL}
                invTransform={(v) => Math.round(v * MAX_ACCEL)}
            />
            <Toggle
              label="Start in calibration mode"
              style={styles.toggle}
            />
        </Paper>
        )
    }
});
