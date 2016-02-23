'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');
var Paper = require('material-ui/lib/paper');
var FloatingActionButton = require('material-ui/lib/floating-action-button');
var ContentAdd = require('material-ui/lib/svg-icons/content/add');
var serial = require('./serial-api');
var _ = require('lodash');

var btn_count = 0;
var PAW_1 = btn_count++;
var PAW_2 = btn_count++;
var PAW_3 = btn_count++;
var PAW_4 = btn_count++;
var PALM = btn_count++;

module.exports = React.createClass({
    getInitialState: function getInitialState() {
        return {
            navOpen: false,
            buttonHovers: new Array(btn_count),
            pot: 0,
            potFound: false
        };
    },
    componentDidMount: function componentDidMount() {
        var _this = this;

        // const ctx = this.refs.canvas.getContext('2d');
        // ctx.strokeStyle = 'blue';
        // ctx.moveTo(20,20);
        // ctx.bezierCurveTo(20, 20, 200, 60, 200, 20);
        // ctx.stroke();
        //
        // window.ctx = ctx;

        var pattern = /p=([0-9]+)/;
        this.serialKey = serial.bind(pattern, _.throttle(function (str) {
            var pot = parseInt(str);

            _this.setState({ pot: pot, potFound: true });
        }, 100));
    },
    componentWillUnmount: function componentWillUnmount() {
        serial.unbind(this.serialKey);
    },
    render: function render() {
        var _this2 = this;

        var pawButtonWidth = 56;

        var width = pawButtonWidth * 4 + 60;
        var height = width;

        var pawButtonStyleBase = {
            textAlign: 'center',
            display: 'inline-block',
            cursor: 'pointer',
            position: 'relative'
        };

        var potPosition = (this.state.pot - 512) / 1024 * 0.77;

        var styles = {
            pawButtons: [_extends({}, pawButtonStyleBase, { margin: '0 5px', top: 30 }), _extends({}, pawButtonStyleBase, { margin: '0 10px' }), _extends({}, pawButtonStyleBase, { margin: '0 10px' }), _extends({}, pawButtonStyleBase, { margin: '0 5px', top: 30 })],
            canvas: {
                position: 'absolute'
            },
            palm: {
                height: 200,
                width: 200,
                margin: '20px auto',
                textAlign: 'center',
                display: 'block',
                position: 'relative',
                transform: 'rotate(' + potPosition + 'turn)'
            },
            thumb: {
                height: 48,
                width: 48,
                top: 16,
                margin: '0 auto',
                display: 'block',
                position: 'relative',
                background: '#eee'
            }
        };

        var buttonSetHover = function buttonSetHover(index, val) {
            return function () {
                return _this2.setState({
                    buttonHovers: _defineProperty({}, index, val)
                });
            };
        };

        return React.createElement(
            'div',
            { style: _extends({}, this.props.style, { width: width, height: height }) },
            React.createElement('canvas', {
                ref: 'canvas',
                style: styles.canvas,
                width: width,
                height: height
            }),
            [PAW_1, PAW_2, PAW_3, PAW_4].map(function (_, i) {
                return React.createElement(
                    FloatingActionButton,
                    {
                        key: i,
                        style: styles.pawButtons[i],
                        secondary: true
                    },
                    React.createElement(ContentAdd, null)
                );
            }),
            React.createElement(
                Paper,
                {
                    style: styles.palm,
                    onMouseOver: buttonSetHover(PALM, true),
                    onMouseOut: buttonSetHover(PALM, false),
                    zDepth: 0,
                    circle: true
                },
                this.state.potFound && React.createElement(Paper, {
                    style: styles.thumb,
                    zDepth: 0,
                    circle: true
                })
            )
        );
    }
});