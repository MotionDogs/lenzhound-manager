const React = require('react');
const Paper = require('material-ui/lib/paper');
const FloatingActionButton = require('material-ui/lib/floating-action-button');
const ContentAdd = require('material-ui/lib/svg-icons/content/add');
const serial = require('./serial-api');
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
        // const ctx = this.refs.canvas.getContext('2d');
        // ctx.strokeStyle = 'blue';
        // ctx.moveTo(20,20);
        // ctx.bezierCurveTo(20, 20, 200, 60, 200, 20);
        // ctx.stroke();
        //
        // window.ctx = ctx;

        var pattern = /p=([0-9]+)/;
        this.serialKey = serial.bind(pattern, _.throttle((str) => {
            var pot = parseInt(str);

            this.setState({pot, potFound: true});
        }, 100));
    },

    componentWillUnmount() {
        serial.unbind(this.serialKey);
    },

    render() {
        const pawButtonWidth = 56;

        const width = pawButtonWidth * 4 + 60;
        const height = width;

        const pawButtonStyleBase = {
            textAlign: 'center',
            display: 'inline-block',
            cursor: 'pointer',
            position: 'relative',
        };

        const potPosition = ((this.state.pot - 512) / 1024) * 0.77;

        const styles = {
            pawButtons: [
                {...pawButtonStyleBase, margin: '0 5px', top: 30},
                {...pawButtonStyleBase, margin: '0 10px'},
                {...pawButtonStyleBase, margin: '0 10px'},
                {...pawButtonStyleBase, margin: '0 5px', top: 30},
            ],
            canvas: {
                position: 'absolute',
            },
            palm: {
                height: 200,
                width: 200,
                margin: '20px auto',
                textAlign: 'center',
                display: 'block',
                position: 'relative',
                transform: 'rotate(' + potPosition + 'turn)',
            },
            thumb: {
                height: 48,
                width: 48,
                top: 16,
                margin: '0 auto',
                display: 'block',
                position: 'relative',
                background: '#eee',
            }
        };

        const buttonSetHover = (index, val) => () => this.setState({
            buttonHovers: {[index]: val}
        });

        return (
        <div style={{...this.props.style, width, height}}>
            <canvas
                ref="canvas"
                style={styles.canvas}
                width={width}
                height={height}
            />
            {[PAW_1,PAW_2,PAW_3,PAW_4].map((_,i) =>
            <FloatingActionButton
                key={i}
                style={styles.pawButtons[i]}
                secondary={true}
            >
                <ContentAdd />
            </FloatingActionButton>)}
            <Paper
                style={styles.palm}
                onMouseOver={buttonSetHover(PALM, true)}
                onMouseOut={buttonSetHover(PALM, false)}
                zDepth={0}
                circle={true}
            >
                {this.state.potFound && <Paper
                    style={styles.thumb}
                    zDepth={0}
                    circle={true}
                />}
            </Paper>
        </div>
        );
    }
});
