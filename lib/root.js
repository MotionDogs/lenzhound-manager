'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('lodash');
var AppBar = require('material-ui/lib/app-bar');
var LeftNav = require('material-ui/lib/left-nav');
var MenuItem = require('material-ui/lib/menus/menu-item');
var ThemeManager = require('material-ui/lib/styles/theme-manager');
var FileUploadIcon = require('material-ui/lib/svg-icons/file/file-upload');
var IconButton = require('material-ui/lib/icon-button');
var Radium = require('radium');
var React = require('react');

var resources = require('./resources');
var TxrPaw = require('./txr-paw');
var TxrSettings = require('./txr-settings');
var Theme = require('./theme');

var Root = Radium(React.createClass({

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
            },
            uploadIcon: function uploadIcon() {
                events.emit("UPLOAD_TO_TXR", _this.props.newVersion);
            }
        };

        var pawPluggedIn = this.props.pawPluggedIn;
        var dogbonePluggedIn = this.props.dogbonePluggedIn;
        var pluggedIn = pawPluggedIn || dogbonePluggedIn;

        var styles = {
            rootDiv: {
                background: 'url(content/lenzhound-bg.svg)',
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            innerDiv: {
                background: '#eee',
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
                left: pawPluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '60%',
                float: 'left'
            },
            startImage: {
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            settingsWrapper: {
                position: 'relative',
                right: pawPluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '40%',
                float: 'left'
            },
            uploadWrapper: {
                position: 'absolute',
                left: 0,
                bottom: 0,
                padding: 8,
                margin: 8,
                cursor: 'pointer',
                display: this.props.newVersion ? 'block' : 'none'
            },
            uploadIcon: {
                fill: Theme.palette.primary1Color,
                marginBottom: -6
            },
            uploadCopy: {
                color: Theme.palette.primary1Color,
                fontFamily: 'Roboto'
            },
            dogboneWrapper: {
                position: 'relative',
                left: dogbonePluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '60%',
                float: 'left'
            }
        };

        return React.createElement(
            'div',
            { style: styles.rootDiv },
            React.createElement(
                'div',
                { style: styles.innerDiv },
                React.createElement(
                    'div',
                    { style: styles.settingsWrapper },
                    React.createElement(TxrSettings, this.props.settings)
                ),
                React.createElement(
                    'div',
                    { style: styles.pawWrapper },
                    React.createElement(TxrPaw, _extends({ style: styles.txrPaw }, this.props.paw))
                ),
                React.createElement(
                    'div',
                    { style: styles.dogboneWrapper },
                    React.createElement('img', { src: 'url(content/lenzhound-dogbone.svg)' })
                ),
                React.createElement(
                    'div',
                    { style: styles.uploadWrapper, onClick: onClicks.uploadIcon },
                    React.createElement(FileUploadIcon, { style: styles.uploadIcon }),
                    React.createElement(
                        'span',
                        { style: styles.uploadCopy },
                        resources.uploadFirmware
                    )
                )
            )
        );
    }
}));

var props = {};
module.exports = {
    setProps: function setProps(newProps) {
        props = _.merge(props, newProps);
        ReactDOM.render(React.createElement(Root, props), document.getElementById('app'));
    }
};