'use strict';

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
const ProfileSettingsPanel = require('./profile-settings-panel');
const ProfileList = require('./profile-list');
const Theme = require('./theme');

var Root = React.createClass({

    propTypes: {
        settings: React.PropTypes.array,
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

        const {
            settings,
            pawPluggedIn,
            dogbonePluggedIn,
            badVersion,
            profileId,
            loading,
            newTxrVersion,
            newRxrVersion,
            mode
        } = this.props;

        const pluggedIn = pawPluggedIn || dogbonePluggedIn || badVersion;
        const newVersion = newTxrVersion || newRxrVersion;

        const listMode = mode === 'list';

        const onClicks = {
            appBarLeftIcon: () => {this.setState({navOpen: true})},
            uploadIcon: () => {
                if (pawPluggedIn) {
                    events.emit(events.UPLOAD_TO_TXR, newTxrVersion);
                } else if (dogbonePluggedIn) {
                    events.emit(events.UPLOAD_TO_RXR, newRxrVersion);
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

        const styles = {
            rootDiv: {
                background: badVersion ?
                    '' : 'url(content/lenzhound-bg.svg)',
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundSize: '100% 100%',
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
            pawWrapper: {
                position: 'absolute',
                right: pawPluggedIn ? 0 : -1000,
                transition: '0.5s',
                width: '60%',
            },
            txrPaw: {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 40,
            },
            dogboneWrapper: {
                position: 'absolute',
                right: dogbonePluggedIn ? 0 : -1000,
                transition: '0.5s',
                width: '60%',
            },
            dogbone: {
                marginLeft: '24%',
            },
            startImage: {
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            settingsWrapper: {
            },
            pawSettingsSection: {
                margin: 6,
                position: 'absolute',
                left: (pawPluggedIn && profileId) ? 0 : -1000,
                transition: '0.5s',
                width: '40%',
            },
            dogboneSettingsSection: {
                margin: 6,
                position: 'absolute',
                left: (dogbonePluggedIn) ? 0 : -1000,
                transition: '0.5s',
                width: '40%',
            },
            profilesSection: {
                margin: 6,
                position: 'absolute',
                left: (pawPluggedIn && !profileId) ? 0 : -1000,
                transition: '0.5s',
                width: '40%',
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
            profileList: {},
            badVersionWrapperOuter: {
                width: '100%',
                height: '100%',
            },
            badVersionWrapper: {
                width: 290,
                position: 'absolute',
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
                position: "absolute",
                top: 16
            },
        };

        if (badVersion) {
            return (
                <div style={styles.rootDiv}>
                    <div style={styles.badVersionWrapperOuter}>
                        <div style={styles.badVersionWrapper}>
                            <div style={styles.oldVersionDesc}>
                                {!(dogbonePluggedIn || pawPluggedIn) && resources.unknownVersionDesc}
                                {pawPluggedIn && resources.oldPawDesc}
                                {dogbonePluggedIn && resources.oldDogboneDesc}
                            </div>
                            {!dogbonePluggedIn && <RaisedButton
                                disabled={loading}
                                style={styles.uploadButton}
                                label={resources.uploadTransmitter}
                                primary={true}
                                onMouseDown={onClicks.uploadTxr} />}
                            {!pawPluggedIn && <RaisedButton
                                disabled={loading}
                                style={styles.uploadButton}
                                label={resources.uploadReceiver}
                                primary={true}
                                onMouseDown={onClicks.uploadRxr} />}
                            {loading && <div style={styles.circularProgressWrapper}>
                                <CircularProgress
                                    color={Theme.palette.accent1Color}/>
                            </div>}
                        </div>
                    </div>
                </div>
            );
        }

        var dogboneSection = (
            <div style={styles.dogboneWrapper}>
                <img style={styles.dogbone} src='content/lenzhound-dogbone.svg' />
            </div>
        );

        var pawSection = (
            <div style={styles.pawWrapper}>
                <TxrPaw style={styles.txrPaw} profiles={settings} {...this.props.paw}/>
            </div>
        );

        var profile = settings.find(p =>
            p.profileId == profileId);

        var pawSettingsSection = pawPluggedIn && (
            <div style={styles.pawSettingsSection}>
                <div style={styles.settingsWrapper}>
                    {<ProfileSettingsPanel {...profile} dogbone={false}/>}
                </div>
            </div>
        );

        var dogboneSettingsSection = dogbonePluggedIn && (
            <div style={styles.dogboneSettingsSection}>
                <div style={styles.settingsWrapper}>
                    {<ProfileSettingsPanel {...profile} dogbone={true}/>}
                </div>
            </div>
        );

        var profilesSection = (
            <div style={styles.profilesSection}>
                <div style={styles.profileList}>
                    {<ProfileList profiles={settings}/>}
                </div>
            </div>
        );

        return (
        <div style={styles.rootDiv}>
            <div style={styles.innerDiv}>
                {pawSection}
                {dogboneSection}
                {pawSettingsSection}
                {dogboneSettingsSection}
                {profilesSection}
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
    },
    getProps() {
        return _.merge({}, props);
    }
};
