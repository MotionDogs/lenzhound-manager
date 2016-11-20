const _ = require('lodash');
const AppBar = require('material-ui/lib/app-bar');
const LeftNav = require('material-ui/lib/left-nav');
const MenuItem = require('material-ui/lib/menus/menu-item');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const FileUploadIcon = require('material-ui/lib/svg-icons/file/file-upload');
const IconButton = require('material-ui/lib/icon-button');
const React = require('react');
const ReactDOM = require('react-dom');
const RaisedButton = require('material-ui/lib/raised-button');
const CircularProgress = require('material-ui/lib/circular-progress');

const resources = require('./resources');
const TxrPaw = require('./txr-paw');
const TxrSettings = require('./txr-settings');
const TxrProfileList = require('./txr-profile-list');
const Theme = require('./theme');

var Root = React.createClass({

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
            uploadIcon: () => {
                if (pawPluggedIn) {
                    events.emit(events.UPLOAD_TO_TXR, this.props.newTxrVersion);
                } else if (dogbonePluggedIn) {
                    events.emit(events.UPLOAD_TO_RXR, this.props.newRxrVersion);
                } else {
                    throw new Error("Clicked upload without being plugged in.")
                }
            },
            uploadTxr: () => {
                events.emit(events.FORCE_UPLOAD_TXR);
            },
            uploadRxr: () => {
                events.emit(events.FORCE_UPLOAD_RXR);
            },
        };

        const pawPluggedIn = this.props.pawPluggedIn;
        const dogbonePluggedIn = this.props.dogbonePluggedIn;
        const unknownVersion = this.props.unknownVersion;
        const pluggedIn = pawPluggedIn || dogbonePluggedIn || unknownVersion;
        const newVersion = this.props.newTxrVersion || this.props.newRxrVersion;
        const loading = this.props.loading;

        const styles = {
            rootDiv: {
                background: unknownVersion ?
                    '' : 'url(content/lenzhound-bg.svg)',
                position: 'absolute',
                width: '100%',
                height: '100%',
            },
            innerDiv: {
                background: 'url(content/white_texture.png)',
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
                left: pawPluggedIn ? 0 : 1000,
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
                right: pluggedIn ? 0 : 1000,
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
                display: newVersion ? 'block' : 'none',
            },
            uploadIcon: {
                fill: Theme.palette.accent1Color,
                marginBottom: -6,
            },
            uploadCopy: {
                color: Theme.palette.accent1Color,
                fontFamily: 'Roboto',
            },
            dogboneWrapper: {
                position: 'relative',
                left: dogbonePluggedIn ? 0 : 1000,
                transition: '0.5s',
                width: '60%',
                float: 'left',
            },
            dogbone: {
                marginLeft: '24%',
            },
            profileList: {},
            unknownVersionWrapperOuter: {
                width: '100%',
                height: '100%',
            },
            unknownVersionWrapper: {
                width: 290,
                position: 'relative',
                top: '50%',
                left: '50%',
                margin: '-120px 0 0 -150px',
            },
            uploadButton: {
                width: 290,
                marginTop: 8,
            },
            oldVersionDesc: {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 4,
                color: '#fff',
                padding: 8,
                fontSize: '0.8em',
            },
            circularProgressWrapper: {
                textAlign: 'center',
            },
            inlineCircularProgress: {
                display: "inline-block",
                position: "relative",
                top: 16
            },
        };

        if (unknownVersion) {
            return (
                <div style={styles.rootDiv}>
                    <div style={styles.unknownVersionWrapperOuter}>
                        <div style={styles.unknownVersionWrapper}>
                            <div style={styles.oldVersionDesc}>
                                {resources.oldVersionDesc}
                            </div>
                            <RaisedButton
                                disabled={loading}
                                style={styles.uploadButton}
                                label={resources.uploadTransmitter}
                                primary={true}
                                onMouseDown={onClicks.uploadTxr} />
                            <RaisedButton
                                disabled={loading}
                                style={styles.uploadButton}
                                label={resources.uploadReceiver}
                                primary={true}
                                onMouseDown={onClicks.uploadRxr} />
                            {loading && <div style={styles.circularProgressWrapper}>
                                <CircularProgress
                                color={Theme.palette.accent1Color}/>
                            </div>}
                        </div>
                    </div>
                </div>
            );
        }

        var dogbone = (
            <div style={styles.dogboneWrapper}>
                <img style={styles.dogbone} src='content/lenzhound-dogbone.svg' />
            </div>
        );

        var paw = (
            <div style={styles.pawWrapper}>
                <TxrPaw style={styles.txrPaw} {...this.props.paw}/>
            </div>
        );

        var settings = (
            <div style={styles.leftSection}>
                <div style={styles.settingsWrapper}>
                    <TxrSettings {...this.props.settings}/>
                </div>
                <div style={styles.profileList}>
                    <TxrProfileList profiles={this.props.profiles}/>
                </div>
            </div>
        );

        return (
        <div style={styles.rootDiv}>
            <div style={styles.innerDiv}>
                {settings}
                {pawPluggedIn && paw}
                {dogbonePluggedIn && dogbone}
                <div style={styles.uploadWrapper} onClick={onClicks.uploadIcon}>
                    <FileUploadIcon style={styles.uploadIcon} />
                    <span style={styles.uploadCopy}>
                        {resources.uploadFirmware}
                    </span>
                    {loading &&
                        <CircularProgress
                        color={Theme.palette.accent1Color}
                        size={0.5}
                        style={styles.inlineCircularProgress}/>}
                </div>
            </div>
        </div>
        );
    }
});

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
