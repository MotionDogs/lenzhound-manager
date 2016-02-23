'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');
var Paper = require('material-ui/lib/paper');

module.exports = React.createClass({
    render: function render() {
        var _this = this;

        var pawButtonStyleBase = {
            height: 70,
            width: 70,
            margin: 20,
            textAlign: 'center',
            display: 'inline-block',
            cursor: 'pointer'
        };

        var styles = {
            pawButtons: [_extends({}, pawButtonStyleBase), _extends({}, pawButtonStyleBase), _extends({}, pawButtonStyleBase), _extends({}, pawButtonStyleBase)]
        };

        var pawButtonMouseOver = function pawButtonMouseOver(index) {
            return function () {
                return _this.setState({
                    pawButtonHovers: _defineProperty({}, index, true)
                });
            };
        };

        var pawButtonMouseOut = function pawButtonMouseOut(index) {
            return function () {
                return _this.setState({
                    pawButtonHovers: _defineProperty({}, index, false)
                });
            };
        };

        return React.createElement(
            'div',
            null,
            [0, 1, 2, 3].map(function (_, i) {
                return React.createElement(Paper, {
                    key: i,
                    style: styles.pawButtons[i],
                    onMouseOver: pawButtonMouseOver(i),
                    onMouseOut: pawButtonMouseOut(i),
                    zDepth: _this.state.pawButtonHovers[i] ? 5 : 3,
                    circle: true
                });
            })
        );
    }
});