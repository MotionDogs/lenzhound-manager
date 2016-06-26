const React = require('react');
const resources = require('./resources');
const AppBar = require('material-ui/lib/app-bar');
const LeftNav = require('material-ui/lib/left-nav');
const MenuItem = require('material-ui/lib/menus/menu-item');
const TxrPaw = require('./txr-paw');
const TxrSettings = require('./txr-settings');
const TxrProfileList = require('./txr-profile-list');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const Theme = require('./theme');
const NavigationClose = require('material-ui/lib/svg-icons/navigation/close');
const IconButton = require('material-ui/lib/icon-button');
const _ = require('lodash');

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
            appBarLeftIcon: () => {this.setState({navOpen: true})}
        };

        const pluggedIn = this.props.pluggedIn;

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
                left: pluggedIn ? 0 : 500,
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
                right: pluggedIn ? 0 : 500,
                transition: '0.5s',
                width: '40%',
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
