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
            pot: 0,
            potFound: false,
        };
    },

    componentDidMount() {
        this.setPot = _.throttle((str) => {
            var pot = parseInt(str);

            this.setState({pot, potFound: true});
        }, 100);

        events.on("RESPONSE_OUTPUT:p", this.setPot);
    },

    componentWillUnmount() {
        events.off("RESPONSE_OUTPUT:p", this.setPot);
    },

    render() {
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
            boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.2)',
        };

        const potPosition = ((this.state.pot - 512) / 1024) * 0.77;

        const styles = {
            base: {
                ...this.props.style,
                width,
                background: '#ccc',
                borderRadius: 30,
                padding: '12px 0 72px 0',
                boxShadow: '0px 4px 5px rgba(0,0,0,0.2), 3px 3px 17px rgba(0,0,0,0.2)',
            },
            pawButtons: [
                {...pawButtonStyleBase, marginLeft: 16, top: 16},
                {...pawButtonStyleBase, marginLeft: 8 },
                {...pawButtonStyleBase, marginLeft: 11 },
                {...pawButtonStyleBase, marginLeft: 8 , top: 16},
            ],
            canvas: {
                position: 'absolute',
            },
            encoder: {
                width: 14,
                height: 14,
                margin: '22px auto',
                background: '#999',
                borderRadius: '50%',
                boxShadow: '0px 2px 2px rgba(0,0,0,0.4)',
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

        const buttonSetHover = (index, val) => () => this.setState({
            buttonHovers: {[index]: val}
        });

        return (
        <div style={styles.base}>
            <canvas
                ref="canvas"
                style={styles.canvas}
                width={width}
                height={height}
            />

            <div style={styles.encoder} />

            {[PAW_1,PAW_2,PAW_3,PAW_4].map((_,i) => <div key={i} style={styles.pawButtons[i]} />)}

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