'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var resources = require('./resources');
var AppBar = require('material-ui/lib/app-bar');
var LeftNav = require('material-ui/lib/left-nav');
var MenuItem = require('material-ui/lib/menus/menu-item');
var TxrPaw = require('./txr-paw');
var TxrSettings = require('./txr-settings');
var TxrProfileList = require('./txr-profile-list');
var ThemeManager = require('material-ui/lib/styles/theme-manager');
var Theme = require('./theme');
var NavigationClose = require('material-ui/lib/svg-icons/navigation/close');
var IconButton = require('material-ui/lib/icon-button');
var _ = require('lodash');

var Root = React.createClass({

    propTypes: {
        settings: React.PropTypes.object,
        pluggedIn: React.PropTypes.bool
    },

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

        var pluggedIn = this.props.pluggedIn;

        var styles = {
            rootDiv: {
                background: 'url(content/lenzhound-bg.svg)',
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            innerDiv: {
                background: 'linear-gradient(rgb(219, 224, 255), rgb(210, 230, 229))',
                width: '100%',
                height: '100%',
                opacity: pluggedIn ? 1 : 0,
                transition: '0.5s'
            },
            appBar: {
                WebkitUserSelect: "none",
                WebkitAppRegion: "drag"
            },
            txrPaw: {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 40
            },
            pawWrapper: {
                position: 'relative',
                left: pluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '60%',
                float: 'left'
            },
            startImage: {
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            settingsWrapper: {},
            leftSection: {
                position: 'relative',
                right: pluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '40%',
                float: 'left'
            },
            profileList: {}
        };

        return React.createElement(
            'div',
            { style: styles.rootDiv },
            React.createElement(
                'div',
                { style: styles.innerDiv },
                React.createElement(
                    'div',
                    { style: styles.leftSection },
                    React.createElement(
                        'div',
                        { style: styles.settingsWrapper },
                        React.createElement(TxrSettings, this.props.settings)
                    ),
                    React.createElement(
                        'div',
                        { style: styles.profileList },
                        React.createElement(TxrProfileList, { profiles: this.props.profiles })
                    )
                ),
                React.createElement(
                    'div',
                    { style: styles.pawWrapper },
                    React.createElement(TxrPaw, _extends({ style: styles.txrPaw }, this.props.paw))
                )
            )
        );
    }
});

var props = {};
module.exports = {
    setProps: function setProps(newProps) {
        props = _.merge(props, newProps);
        ReactDOM.render(React.createElement(Root, props), document.getElementById('app'));
    }
};