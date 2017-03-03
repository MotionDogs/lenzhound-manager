const React = require('react');
const Divider = require('material-ui/lib/divider');
const Paper = require('material-ui/lib/paper');
const Checkbox = require('material-ui/lib/checkbox');
const TextField = require('material-ui/lib/text-field');
const SliderControl = require('./slider-control');
const events = require('./events');
const NavigateBefore = require('material-ui/lib/svg-icons/image/navigate-before');

const MAX_MAX_SPEED = 1 << 15;
const MAX_ACCEL = 32;
const MAX_CHANNEL = 6;

module.exports = React.createClass({
    propTypes: {
        maxSpeed: React.PropTypes.number,
        accel: React.PropTypes.number,
        startInCal: React.PropTypes.bool,
        dogbone: React.PropTypes.bool,
    },

    render() {
        const {
            dogbone,
            maxSpeed,
            accel,
            startInCal,
            profileName,
            profileId,
            channel,
        } = this.props;

        const callbacks = {
            toggleStartInCal: () => {
                events.emit(events.UPDATE_PROFILE, {
                    profileId: profileId,
                    startInCal: !startInCal,
                });  
            },
            changeMaxSpeed: (val) => {
                events.emit(events.UPDATE_PROFILE, {
                    profileId: profileId,
                    maxSpeed: val,
                });
            },
            changeAccel: (val) => {
                events.emit(events.UPDATE_PROFILE, {
                    profileId: profileId,
                    accel: val,
                });
            },
            changeChannel: (val) => {
                events.emit(events.UPDATE_CHANNEL, val);
            },
            changeProfileName: (event) => {
                events.emit(events.UPDATE_PROFILE, {
                    profileId: profileId,
                    profileName: event.target.value.slice(0,20),
                });
            },
            goToProfileList: () => {
                events.emit(events.LIST_PROFILES);
            },
        };

        const styles = {
            paper: {
                padding: 14,
                paddingBottom: 20,
            },
            navigateBefore: {
                background: '#eaeaea',
                borderRadius: '50%',
                marginBottom: '12px',
                cursor: 'pointer',
            },
            profileName: {
                top: -19,
                marginLeft: 12,
                width: 197,
            },
        };

        const logb = (base, val) => Math.log10(val) / Math.log10(base);
        const powRounded = (base, val) => Math.round(Math.pow(base, val));
        const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
        const mapRange = (val, min0, max0, min1, max1) =>
            (clamp(val, min0, max0) - min0) / (max0 - min0) * (max1 - min1) + min1;
        const normalize = (val, min, max) => mapRange(val, min, max, 0, 1);
        const denormalize = (val, min, max) => mapRange(val, 0, 1, min, max);

        return dogbone ? (
        <Paper style={styles.paper}>
            <SliderControl
                title="Channel"
                disabled={channel === null}
                value={clamp(channel || 0, 1, MAX_CHANNEL)}
                transform={(v) => normalize(v, 1, MAX_CHANNEL)}
                invTransform={(v) => Math.round(denormalize(v, 1, MAX_CHANNEL))}
                onChange={callbacks.changeChannel}
            />
        </Paper>
        ) : (
        <Paper style={styles.paper}>
            <NavigateBefore
                style={styles.navigateBefore}
                onClick={callbacks.goToProfileList} 
            />

            <TextField
                style={styles.profileName}
                value={profileName || "Default Profile"}
                onChange={callbacks.changeProfileName}
            />

            <SliderControl
                title="Max speed"
                disabled={maxSpeed === null}
                value={clamp(maxSpeed || 0, 1, MAX_MAX_SPEED)}
                transform={(v) => normalize(v, 1, MAX_MAX_SPEED)}
                invTransform={(v) => Math.round(denormalize(v, 1, MAX_MAX_SPEED))}
                onChange={callbacks.changeMaxSpeed}
            />

            <SliderControl
                title="Acceleration"
                disabled={accel === null}
                value={clamp(accel || 0, 1, MAX_ACCEL)}
                transform={(v) => normalize(v, 1, MAX_ACCEL)}
                invTransform={(v) => Math.round(denormalize(v, 1, MAX_ACCEL))}
                onChange={callbacks.changeAccel}
            />
        </Paper>
        )
    }
});
