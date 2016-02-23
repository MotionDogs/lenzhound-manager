'use strict';

var React = require('react');
var resources = require('./resources');
var AppBar = require('material-ui/lib/app-bar');
var LeftNav = require('material-ui/lib/left-nav');
var MenuItem = require('material-ui/lib/menus/menu-item');
var TxrPaw = require('./txr-paw');
var TxrSettings = require('./txr-settings');
var ThemeManager = require('material-ui/lib/styles/theme-manager');
var Theme = require('./theme');
var NavigationClose = require('material-ui/lib/svg-icons/navigation/close');
var IconButton = require('material-ui/lib/icon-button');

module.exports = React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    getChildContext: function getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(Theme)
        };
    },
    getInitialState: function getInitialState() {
        return {
            navOpen: false
        };
    },
    render: function render() {
        var _this = this;

        var onClicks = {
            appBarLeftIcon: function appBarLeftIcon() {
                _this.setState({ navOpen: true });
            }
        };

        var styles = {
            rootDiv: {
                background: '#e6e2e7',
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            appBar: {
                WebkitUserSelect: "none",
                WebkitAppRegion: "drag"
            },
            txrPaw: {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 40
            }
        };

        return React.createElement(
            'div',
            { style: styles.rootDiv },
            React.createElement(
                'div',
                { style: { width: '40%', float: 'left' } },
                React.createElement(TxrSettings, null)
            ),
            React.createElement(
                'div',
                { style: { width: '60%', float: 'left' } },
                React.createElement(TxrPaw, { style: styles.txrPaw })
            )
        );
    }
});