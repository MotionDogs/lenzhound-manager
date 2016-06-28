const _ = require('lodash');
const AppBar = require('material-ui/lib/app-bar');
const LeftNav = require('material-ui/lib/left-nav');
const MenuItem = require('material-ui/lib/menus/menu-item');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const FileUploadIcon = require('material-ui/lib/svg-icons/file/file-upload');
const IconButton = require('material-ui/lib/icon-button');
const Radium = require('radium');
const React = require('react');

const resources = require('./resources');
const TxrPaw = require('./txr-paw');
const TxrSettings = require('./txr-settings');
const TxrProfileList = require('./txr-profile-list');
const Theme = require('./theme');

var Root = Radium(React.createClass({

    propTypes: {
        settings: React.PropTypes.object,
        pluggedIn: React.PropTypes.bool,
    },

    childContextTypes : {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(Theme),
        };
    },

    getInitialState() {
        return {
            navOpen: false
        };
    },

    render() {
        const onClicks = {
            appBarLeftIcon: () => {this.setState({navOpen: true})},
            uploadIcon: () => {events.emit("UPLOAD_TO_TXR", this.props.newVersion)},
        };

        const pawPluggedIn = this.props.pawPluggedIn;
        const dogbonePluggedIn = this.props.dogbonePluggedIn;
        const pluggedIn = pawPluggedIn || dogbonePluggedIn;

        const styles = {
            rootDiv: {
                background: 'url(content/lenzhound-bg.svg)',
                position: 'absolute',
                width: '100%',
                height: '100%',
            },
            innerDiv: {
                background: 'linear-gradient(rgb(219, 224, 255), rgb(210, 230, 229))',
                width: '100%',
                height: '100%',
                opacity: pluggedIn ? 1 : 0,
                transition: '0.5s',
            },
            appBar: {
                WebkitUserSelect: "none",
                WebkitAppRegion: "drag",
            },
            txrPaw: {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 40,
            },
            pawWrapper: {
                position: 'relative',
                left: pawPluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '60%',
                float: 'left',
            },
            startImage: {
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            settingsWrapper: {
            },
            leftSection: {
                position: 'relative',
                right: pawPluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '40%',
                float: 'left',
            },
            uploadWrapper: {
                position: 'absolute',
                left: 0,
                bottom: 0,
                padding: 8,
                margin: 8,
                cursor: 'pointer',
                display: this.props.newVersion ? 'block' : 'none',
            },
            uploadIcon: {
                fill: Theme.palette.primary1Color,
                marginBottom: -6,
            },
            uploadCopy: {
                color: Theme.palette.primary1Color,
                fontFamily: 'Roboto',
            },
            dogboneWrapper: {
                position: 'relative',
                left: dogbonePluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '60%',
                float: 'left',
            },
            profileList: {
            },
        };

        return (
        <div style={styles.rootDiv}>
            <div style={styles.innerDiv}>
                <div style={styles.leftSection}>
                    <div style={styles.settingsWrapper}>
                        <TxrSettings {...this.props.settings}/>
                    </div>
                    <div style={styles.profileList}>
                        <TxrProfileList profiles={this.props.profiles}/>
                    </div>
                </div>
                <div style={styles.pawWrapper}>
                    <TxrPaw style={styles.txrPaw} {...this.props.paw}/>
                </div>
                <div style={styles.dogboneWrapper}>
                    <img src='url(content/lenzhound-dogbone.svg)' />
                </div>
                <div style={styles.uploadWrapper} onClick={onClicks.uploadIcon}>
                    <FileUploadIcon style={styles.uploadIcon} />
                    <span style={styles.uploadCopy}>{resources.uploadFirmware}</span>
                </div>
            </div>
        </div>
        );
    }
}));

var props = {};
module.exports = {
    setProps(newProps) {
        props = _.merge(props, newProps);
        ReactDOM.render(
            <Root {...props}/>,
            document.getElementById('app')
        );
    }
};
