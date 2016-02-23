const React = require('react');
const resources = require('./resources');
const AppBar = require('material-ui/lib/app-bar');
const LeftNav = require('material-ui/lib/left-nav');
const MenuItem = require('material-ui/lib/menus/menu-item');
const TxrPaw = require('./txr-paw');
const TxrSettings = require('./txr-settings');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const Theme = require('./theme');
const NavigationClose = require('material-ui/lib/svg-icons/navigation/close');
const IconButton = require('material-ui/lib/icon-button');

module.exports = React.createClass({

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
            navOpen: false,
        };
    },

    render() {
        const onClicks = {
            appBarLeftIcon: () => {this.setState({navOpen: true})}
        };

        const styles = {
            rootDiv: {
                background: '#e6e2e7',
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            appBar: {
                WebkitUserSelect: "none",
                WebkitAppRegion: "drag",
            },
            txrPaw: {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 40
            }
        };

        return (
        <div style={styles.rootDiv}>
            <div style={{width: '40%', float: 'left'}}>
                <TxrSettings />
            </div>
            <div style={{width: '60%', float: 'left'}}>
                <TxrPaw style={styles.txrPaw}/>
            </div>
        </div>
        );
    }
});
