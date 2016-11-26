const React = require('react');
const Paper = require('material-ui/lib/paper');
const FloatingActionButton = require('material-ui/lib/floating-action-button');
const ContentAdd = require('material-ui/lib/svg-icons/content/add');
const serial = require('./serial-api');
const events = require('./events');
const _ = require('lodash');

var btn_count = 0;
const PAW_1 = btn_count++;
const PAW_2 = btn_count++;
const PAW_3 = btn_count++;
const PAW_4 = btn_count++;
const PALM  = btn_count++;

module.exports = React.createClass({
    getInitialState() {
        return {
            navOpen: false,
            buttonHovers: new Array(btn_count),
            LEDStatuses: {},
            pot: 0,
            potFound: false,
        };
    },

    componentDidMount() {
        this.setPot = _.throttle((str) => {
            const pot = parseInt(str);

            this.setState({pot, potFound: true});
        }, 100);
        this.setProfileHover = val => str => {
            const {profiles} = this.props;
            const hoveredProfileId = parseInt(str);

            const index = profiles.findIndex(p => p.profileId == hoveredProfileId);

            this.setState({buttonHovers: {[index]: val}});
        };
        this.setLedStatus = val => led => {
            var {LEDStatuses} = this.state;
            this.setState({LEDStatuses: Object.assign({}, LEDStatuses, {[led]: val})});
        };

        events.on(events.RESPONSE_OUTPUT('p'), this.setPot);
        events.on(events.PROFILE_MOUSEOVER, this.setProfileHover(true));
        events.on(events.PROFILE_MOUSEOUT, this.setProfileHover(false));
        events.on(events.LED_ON, this.setLedStatus(true));
        events.on(events.LED_OFF, this.setLedStatus(false));
    },

    componentWillUnmount() {
        events.off("RESPONSE_OUTPUT:p", this.setPot);
        events.off(events.PROFILE_MOUSEOVER);
        events.off(events.PROFILE_MOUSEOUT);
        events.off(events.LED_ON);
        events.off(events.LED_OFF);
    },

    render() {
        const {profiles} = this.props;

        const pawButtonWidth = 40;

        const width = pawButtonWidth * 4 + 60;
        const height = width;

        const pawButtonStyleBase = {
            textAlign: 'center',
            display: 'inline-block',
            cursor: 'pointer',
            position: 'relative',
            borderRadius: '50%',
            width: 40,
            height: 40,
            background: '#333',
        };

        const pawLEDStyleBase = {
            display: 'inline-block',
            position: 'relative',
            borderRadius: '50%',
            width: 10,
            height: 10,
        };

        const potPosition = ((this.state.pot - 512) / 1024) * 0.77;

        const { buttonHovers, LEDStatuses } = this.state;

        const shadow = (i) => buttonHovers[i] ?
            '0 0 5px #fff' : 'none';

        const pawLED = [
            serial.leds.PAW_BUTTON_1,
            serial.leds.PAW_BUTTON_2,
            serial.leds.PAW_BUTTON_3,
            serial.leds.PAW_BUTTON_4,
        ];


    // background: rgb(204,255,144);
    // box-shadow: 0 0 5px rgba(204,255,144,0.6);

        const LEDColor = {
            [serial.leds.PAW_BUTTON_1]: "rgb(255, 100, 100)",
            [serial.leds.PAW_BUTTON_2]: "rgb(255, 158, 89)",
            [serial.leds.PAW_BUTTON_3]: "rgb(255, 158, 89)",
            [serial.leds.PAW_BUTTON_4]: "rgb(204, 255, 144)",
        };

        const LEDShadow = {
            [serial.leds.PAW_BUTTON_1]: "0 0 5px rgba(255, 100, 100, 0.6)",
            [serial.leds.PAW_BUTTON_2]: "0 0 5px rgba(255, 158, 89, 0.6)",
            [serial.leds.PAW_BUTTON_3]: "0 0 5px rgba(255, 158, 89, 0.6)",
            [serial.leds.PAW_BUTTON_4]: "0 0 5px rgba(204, 255, 144, 0.6)",
        };

        const pawLEDColor = (i) => LEDStatuses[pawLED[i]] ? LEDColor[pawLED[i]] : "#555";
        const pawLEDShadow = (i) => LEDStatuses[pawLED[i]] ? LEDShadow[pawLED[i]] : "none";

        const styles = {
            base: {
                ...this.props.style,
                width,
                background: '#757C88',
                borderRadius: 30,
                padding: '12px 0 72px 0',
                boxShadow: '0px 4px 5px rgba(0,0,0,0.2), 3px 3px 17px rgba(0,0,0,0.2)',
            },
            pawButtons: [
                {...pawButtonStyleBase, marginLeft: 16, top: 16, boxShadow: shadow(0)},
                {...pawButtonStyleBase, marginLeft: 8, boxShadow: shadow(1) },
                {...pawButtonStyleBase, marginLeft: 11, boxShadow: shadow(2) },
                {...pawButtonStyleBase, marginLeft: 8 , top: 16, boxShadow: shadow(3)},
            ],
            pawLEDs: [
                {...pawLEDStyleBase, marginLeft: 28, top: -65, background: pawLEDColor(0), boxShadow: pawLEDShadow(0) },
                {...pawLEDStyleBase, marginLeft: 24, top: -76, background: pawLEDColor(1), boxShadow: pawLEDShadow(1) },
                {...pawLEDStyleBase, marginLeft: 76, top: -76, background: pawLEDColor(2), boxShadow: pawLEDShadow(2) },
                {...pawLEDStyleBase, marginLeft: 24 , top: -65, background: pawLEDColor(3), boxShadow: pawLEDShadow(3) },
            ],
            canvas: {
                position: 'absolute',
            },
            encoder: {
                width: 14,
                height: 14,
                margin: '22px auto',
                background: '#ccff90',
                borderRadius: '50%',
                boxShadow: '0px 0px 12px rgba(204, 255, 144, 0.4), 0px 2px 2px rgba(0,0,0,0.4)',
            },
            palm: {
                height: width - 10,
                width: width - 10,
                background: '#fff',
                borderRadius: '50%',
                margin: '20px auto',
                position: 'relative',
                boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.2)',
            },
            pot: {
                height: 120,
                width: 120,
                background: '#333',
                borderRadius: '50%',
                top: 45,
                margin: '20px auto',
                position: 'relative',
                boxShadow: '2px 4px 4px rgba(0, 0, 0, 0.2)',
            },
            thumbWrapper: {
                height: '100%',
                width: '100%',
                background: 'transparent',
                position: 'relative',
                transform: 'rotate(' + potPosition + 'turn)',
                transition: '0.1s',
            },
            thumb: {
                height: 34,
                width: 34,
                top: 16,
                borderRadius: '50%',
                margin: '0 auto',
                position: 'relative',
                background: '#333',
                transform: 'rotate(' + (-potPosition) + 'turn)',
                transition: '0.1s',
                boxShadow: '0px 2px 5px rgba(0,0,0,0.5) inset',
            }
        };

        return (
        <div style={styles.base}>
            <canvas
                ref="canvas"
                style={styles.canvas}
                width={width}
                height={height}
            />

            <div style={styles.encoder} />

            {[PAW_1,PAW_2,PAW_3,PAW_4].map((_,i) => (<div
                key={i}
                style={styles.pawButtons[i]}
                onClick={() => profiles[i] && events.emit(events.PROFILE_SELECTED, profiles[i].profileId)}
                onMouseOver={() => profiles[i] && events.emit(events.PROFILE_MOUSEOVER, profiles[i].profileId)}
                onMouseOut={() => profiles[i] && events.emit(events.PROFILE_MOUSEOUT, profiles[i].profileId)}
            />))}

            {[PAW_1,PAW_2,PAW_3,PAW_4].map((_,i) => (<div
                key={i}
                style={styles.pawLEDs[i]}
            />))}

            <div style={styles.palm}>
                <div style={styles.pot}>
                    <div style={styles.thumbWrapper}>
                        {this.state.potFound && <div style={styles.thumb} />}
                    </div>
                </div>
            </div>
        </div>
        );
    }
});
