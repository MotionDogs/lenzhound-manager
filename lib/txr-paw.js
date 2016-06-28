'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');
var Paper = require('material-ui/lib/paper');
var FloatingActionButton = require('material-ui/lib/floating-action-button');
var ContentAdd = require('material-ui/lib/svg-icons/content/add');
var serial = require('./serial-api');
var events = require('./events');
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

        this.setPot = _.throttle(function (str) {
            var pot = parseInt(str);

            _this.setState({ pot: pot, potFound: true });
        }, 100);

        events.on("RESPONSE_OUTPUT:p", this.setPot);
    },
    componentWillUnmount: function componentWillUnmount() {
        events.off("RESPONSE_OUTPUT:p", this.setPot);
    },
    render: function render() {
        var _this2 = this;

        var pawButtonWidth = 40;

        var width = pawButtonWidth * 4 + 60;
        var height = width;

        var pawButtonStyleBase = {
            textAlign: 'center',
            display: 'inline-block',
            cursor: 'pointer',
            position: 'relative',
            borderRadius: '50%',
            width: 40,
            height: 40,
            background: '#333',
            boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.2)'
        };

        var potPosition = (this.state.pot - 512) / 1024 * 0.77;

        var styles = {
            base: _extends({}, this.props.style, {
                width: width,
                background: '#757C88',
                borderRadius: 30,
                padding: '12px 0 72px 0',
                boxShadow: '0px 4px 5px rgba(0,0,0,0.2), 3px 3px 17px rgba(0,0,0,0.2)'
            }),
            pawButtons: [_extends({}, pawButtonStyleBase, { marginLeft: 16, top: 16 }), _extends({}, pawButtonStyleBase, { marginLeft: 8 }), _extends({}, pawButtonStyleBase, { marginLeft: 11 }), _extends({}, pawButtonStyleBase, { marginLeft: 8, top: 16 })],
            canvas: {
                position: 'absolute'
            },
            encoder: {
                width: 14,
                height: 14,
                margin: '22px auto',
                background: '#ccff90',
                borderRadius: '50%',
                boxShadow: '0px 0px 12px rgba(204, 255, 144, 0.4), 0px 2px 2px rgba(0,0,0,0.4)'
            },
            palm: {
                height: width - 10,
                width: width - 10,
                background: '#fff',
                borderRadius: '50%',
                margin: '20px auto',
                position: 'relative',
                boxShadow: '1px 2px 2px rgba(0, 0, 0, 0.2)'
            },
            pot: {
                height: 120,
                width: 120,
                background: '#333',
                borderRadius: '50%',
                top: 45,
                margin: '20px auto',
                position: 'relative',
                boxShadow: '2px 4px 4px rgba(0, 0, 0, 0.2)'
            },
            thumbWrapper: {
                height: '100%',
                width: '100%',
                background: 'transparent',
                position: 'relative',
                transform: 'rotate(' + potPosition + 'turn)',
                transition: '0.1s'
            },
            thumb: {
                height: 34,
                width: 34,
                top: 16,
                borderRadius: '50%',
                margin: '0 auto',
                position: 'relative',
                background: '#333',
                transform: 'rotate(' + -potPosition + 'turn)',
                transition: '0.1s',
                boxShadow: '0px 2px 5px rgba(0,0,0,0.5) inset'
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
            { style: styles.base },
            React.createElement('canvas', {
                ref: 'canvas',
                style: styles.canvas,
                width: width,
                height: height
            }),
            React.createElement('div', { style: styles.encoder }),
            [PAW_1, PAW_2, PAW_3, PAW_4].map(function (_, i) {
                return React.createElement('div', { key: i, style: styles.pawButtons[i] });
            }),
            React.createElement(
                'div',
                { style: styles.palm },
                React.createElement(
                    'div',
                    { style: styles.pot },
                    React.createElement(
                        'div',
                        { style: styles.thumbWrapper },
                        this.state.potFound && React.createElement('div', { style: styles.thumb })
                    )
                )
            )
        );
    }
});