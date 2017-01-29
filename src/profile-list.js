const React = require('react');
const ReactDOM = require('react-dom');
const RaisedButton = require('material-ui/lib/raised-button');
const FlatButton = require('material-ui/lib/flat-button');
const FloatingActionButton = require('material-ui/lib/floating-action-button');
const List = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const Dialog = require('material-ui/lib/dialog');
const Paper = require('material-ui/lib/paper');
const ContentAdd = require('material-ui/lib/svg-icons/content/add');
const CircularProgress = require('material-ui/lib/circular-progress');
const Checkbox = require('material-ui/lib/checkbox');
const Divider = require('material-ui/lib/divider');

const events = require('./events');
const LensProfile = require('./lens-profile');
const Theme = require('./theme');

module.exports = React.createClass({
    propTypes: {
        profiles: React.PropTypes.array,
        startInCal: React.PropTypes.bool,
    },

    getInitialState() {
        return {modalIsOpen: false};
    },

    modalOpen() {
        this.setState({modalIsOpen: true});
    },

    modalClose() {
        this.setState({modalIsOpen: false});
    },

    render() {
        var { profiles, startInCal } = this.props;

        var styles = {
            outerDiv: {

            },
            createButtonWrapperOuter: {
                position: 'absolute',
                width: '100%',
            },
            createButtonWrapper: {
                position: 'absolute',
                right: 0,
                top: -54,
                margin: 16,
            },
            circularProgressWrapper: {
                textAlign: 'center',
            },
            startInCalCheckbox: {
                padding: 14,
                width: 'calc(100% - 28px)',
            },
        };

        const modalActions = [
          <FlatButton
            label="Cancel"
            primary={true}
            onMouseDown={this.modalClose}
          />,
          <FlatButton
            label="Submit"
            primary={true}
            disabled={true}
            onMouseDown={this.modalClose}
          />,
        ];

        const centeredLoader = (
            <div style={styles.circularProgressWrapper}>
                <CircularProgress
                    color={Theme.palette.accent1Color}/>
            </div>
        );

        const callbacks = {
            toggleStartInCal: () => {
                events.emit(events.UPDATE_PROFILE, {
                    profileId: profileId,
                    startInCal: !startInCal,
                });  
            },
        };

        return (
            <Paper>
                <List>
                {profiles.length ? profiles.map(p => (
                    <ListItem
                        key={p.profileId}
                        primaryText={p.profileName || "Default Profile"}
                        onClick={() => events.emit(events.PROFILE_SELECTED, p.profileId)}
                        onMouseOver={() => events.emit(events.PROFILE_MOUSEOVER, p.profileId)}
                        onMouseOut={() => events.emit(events.PROFILE_MOUSEOUT, p.profileId)}
                    />
                )) : centeredLoader}
                </List>

                <Divider/>

                <Checkbox
                  style={styles.startInCalCheckbox}
                  label="Start in calibration mode"
                  labelPosition='left'
                  disabled={startInCal === null}
                  onCheck={callbacks.toggleStartInCal}
                  defaultChecked={startInCal || false}
                />
            </Paper>
        )
    }
});
