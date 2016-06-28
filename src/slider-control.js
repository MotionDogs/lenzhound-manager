const React = require('react');
const Slider = require('material-ui/lib/slider');
const TextField = require('material-ui/lib/text-field');
const Theme = require('./theme');

module.exports = React.createClass({

    //public api:
    propTypes: {
        title: React.PropTypes.string,
        value: React.PropTypes.number,
        transform: React.PropTypes.func,
        invTransform: React.PropTypes.func,
        onChange: React.PropTypes.func,
    },

    getValue() {
        return this.state.value;
    },

    // React definitions
    getDefaultProps: function() {
        return {
            value: 0,
            transform: v => v,
            invTransform: v => v,
            onChange: () => {},
        };
    },

    getInitialState() {
        return {
            value: this.props.value,
            stringValue: this.props.value.toString(),
        };
    },

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            value: nextProps.value,
            stringValue: (nextProps.disabled) ? "- - -" : nextProps.value.toString(),
        });
    },

    render() {
        const styles = {
            header: {
                fontFamily: 'Roboto, sans-serif',
                color: Theme.palette.textColor,
            },
            sliderWrapper: {
                width: 'calc(100% - 70px)',
                display: 'inline-block',
                margin: '10px 14px 10px 4px',
            },
            slider: {
                marginTop: 0,
                marginBottom: 0
            },
            field: {
                display: 'inline-block',
                width: 52,
                top: -18,
            },
            fieldInput: {
                textAlign: 'center',
            },
        };

        const handlers = {
            field: (e) => {
                var stringValue = e.target.value;
                var parsed = parseInt(stringValue);
                var transformed = this.props.transform(parsed);
                var between = (v,a,b) => v >= a && v <= b;
                if (/^[0-9]+$/.test(stringValue) && between(transformed,0,1)) {
                    this.setState({
                        value: parsed,
                        stringValue: stringValue,
                    });

                    this.props.onChange(parsed);
                } else if (stringValue == '') {
                    this.setState({
                        stringValue: stringValue,
                    });
                }
            },
            slider: (e) => {
                var transformedVal = this.refs.slider.getValue();
                var val = this.props.invTransform(transformedVal);
                this.setState({
                    value: val,
                    stringValue: val.toString(),
                });

                this.props.onChange(val);
            },
        };

        return (
        <div>
            <div style={styles.header}>
                {this.props.title}
            </div>
            <div style={styles.sliderWrapper}>
                <Slider
                    style={styles.slider}
                    value={this.state.value !== null && this.props.transform(this.state.value)}
                    onChange={handlers.slider}
                    disabled={this.props.disabled}
                    ref='slider'
                />
            </div>
            <TextField
                style={styles.field}
                inputStyle={styles.fieldInput}
                value={this.state.stringValue}
                onChange={handlers.field}
                disabled={this.props.disabled}
            />
        </div>
        );
    }
});
