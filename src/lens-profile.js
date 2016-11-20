const React = require('react');

module.exports = React.createClass({
    propTypes: {
    },

    render() {
        return (
            <div>
                {this.props.profileName || "Default Profile"}
            </div>
        )
    }
});
