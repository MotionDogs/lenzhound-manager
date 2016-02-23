'use strict';

var React = require('react');
var Slider = require('material-ui/lib/slider');
var TextField = require('material-ui/lib/text-field');
var Theme = require('./theme');

module.exports = React.createClass({

    //public api:
    propTypes: {
        title: React.PropTypes.string,
        value: React.PropTypes.number,
        transform: React.PropTypes.func,
        invTransform: React.PropTypes.func,
        onChange: React.PropTypes.func
    },

    getValue: function getValue() {
        return this.state.value;
    },

    // React definitions
    getDefaultProps: function getDefaultProps() {
        return {
            value: 0,
            transform: function transform(v) {
                return v;
            },
            invTransform: function invTransform(v) {
                return v;
            },
            onChange: function onChange() {}
        };
    },

    getInitialState: function getInitialState() {
        return {
            value: this.props.value,
            stringValue: this.props.value.toString()
        };
    },
    render: function render() {
        var _this = this;

        var styles = {
            header: {
                fontFamily: 'Roboto, sans-serif',
                color: Theme.palette.textColor
            },
            sliderWrapper: {
                width: 'calc(100% - 70px)',
                display: 'inline-block',
                margin: '10px 14px 10px 4px'
            },
            slider: {
                marginTop: 0,
                marginBottom: 0
            },
            field: {
                display: 'inline-block',
                width: 52,
                top: -18
            },
            fieldInput: {
                textAlign: 'center'
            }
        };

        var handlers = {
            field: function field(e) {
                var stringValue = e.target.value;
                var parsed = parseInt(stringValue);
                var transformed = _this.props.transform(parsed);
                var between = function between(v, a, b) {
                    return v >= a && v <= b;
                };
                if (/^[0-9]+$/.test(stringValue) && between(transformed, 0, 1)) {
                    _this.setState({
                        value: parsed,
                        stringValue: stringValue
                    });

                    _this.props.onChange();
                } else if (stringValue == '') {
                    _this.setState({
                        stringValue: stringValue
                    });
                }
            },
            slider: function slider(e) {
                var transformedVal = _this.refs.slider.getValue();
                var val = _this.props.invTransform(transformedVal);
                _this.setState({
                    value: val,
                    stringValue: val.toString()
                });

                _this.props.onChange();
            }
        };

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { style: styles.header },
                this.props.title
            ),
            React.createElement(
                'div',
                { style: styles.sliderWrapper },
                React.createElement(Slider, {
                    style: styles.slider,
                    value: this.props.transform(this.state.value),
                    onChange: handlers.slider,
                    ref: 'slider'
                })
            ),
            React.createElement(TextField, {
                style: styles.field,
                inputStyle: styles.fieldInput,
                value: this.state.stringValue,
                onChange: handlers.field
            })
        );
    }
});